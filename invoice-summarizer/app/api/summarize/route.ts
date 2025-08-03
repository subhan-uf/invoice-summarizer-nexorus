import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { summarizeInvoice } from '../../../lib/summarizer';
import { sendSummaryEmail } from '../../../lib/emailService';
import { extractTextFromPDF } from '../../../lib/server-utils';
console.log('[summarize API] Authenticated user:', supabase.auth.getUser());

export async function POST(request: NextRequest) {
  try {
    // Create authenticated Supabase client using service role key
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const authenticatedSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Log the raw request body
    const rawBody = await request.text();
    console.log('[summarize API] Raw request body:', rawBody);
    let body: any = {};
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e) {
      console.error('[summarize API] Failed to parse JSON body:', e);
      return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
    }
    console.log('[summarize API] Parsed body:', body);
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Verify the token and get user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        console.error('[summarize API] Auth error:', authError);
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
      user = authUser;
      console.log('[summarize API] Authenticated user:', user?.id);
    } else {
      console.log('[summarize API] No Bearer token provided');
    }
    
    const { invoiceId, action = 'summarize' } = body;

    if (!invoiceId) {
      console.error('[summarize API] invoiceId missing in body:', body);
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get invoice from database using authenticated client to bypass RLS
    const { data: invoice, error: fetchError } = await authenticatedSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    console.log('[summarize API] Supabase fetch invoice:', { invoice, fetchError });

    if (fetchError || !invoice) {
      console.error('[summarize API] Invoice not found:', { invoiceId, fetchError });
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // If invoice already has a summary, return it
    if (invoice.summary && action === 'summarize') {
      console.log('[summarize API] Invoice already summarized:', invoice.summary);
      return NextResponse.json({
        success: true,
        message: 'Invoice already summarized',
        summary: invoice.summary
      });
    }
    const fileUrl = invoice.file_url;
    // Download PDF from Supabase Storage
    const filePath = fileUrl.split('/public/invoices/')[1]; 
      
    console.log('[summarize API] Downloading file from storage:', filePath);
    const { data: fileData, error: downloadError } = await supabase.storage
    .from('invoices')
    .download(filePath);
    console.log('[summarize API] Storage download:', { fileData, downloadError });

    if (downloadError || !fileData) {
      console.error('[summarize API] Failed to download PDF file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download PDF file' },
        { status: 500 }
      );
    }

    // Convert to buffer for PDF parsing
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[summarize API] typeof buffer:', typeof buffer, 'constructor:', buffer.constructor.name, 'length:', buffer.length);

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(buffer);
    console.log('[summarize API] Extracted text:', extractedText?.slice(0, 500)); // log first 500 chars

    if (!extractedText || extractedText.trim().length === 0) {
      console.error('[summarize API] No text could be extracted from PDF');
      return NextResponse.json(
        { error: 'No text could be extracted from PDF' },
        { status: 400 }
      );
    }

    // Generate summary using LangChain
    const summary = await summarizeInvoice(extractedText, invoice);
    console.log('[summarize API] AI summary result:', summary);
    console.log('[summarize API] Total amount:', summary.totalAmount);
    console.log('[summarize API] Invoice date:', summary.invoiceDate);
    console.log('[summarize API] Client info:', summary.clientInfo);

    // Extract and save client information
    console.log('[summarize API] Checking client info condition:', {
      hasClientInfo: !!summary.clientInfo,
      hasCompany: !!(summary.clientInfo && summary.clientInfo.company),
      clientInfo: summary.clientInfo
    });
    
    // Test client creation with a simple insert first
    console.log('[summarize API] Testing client creation...');
    console.log('[summarize API] Test user check:', { hasUser: !!user, userId: user?.id });
    
    if (user) {
      // Test database connection
      const { data: testData, error: testError } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      console.log('[summarize API] Database test:', { testData, testError: testError?.message });
    }
    
        let clientId = null; // Declare at function scope
    
    // Let the database triggers handle client creation/updates automatically
    // We only need to ensure the client exists and get its ID for the invoice
    if (summary.clientInfo && summary.clientInfo.company && user) {
      console.log('[summarize API] Looking up or creating client for company:', summary.clientInfo.company);
      
      // Check if client already exists
      const { data: existingClients } = await authenticatedSupabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('company', summary.clientInfo.company);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
        console.log('[summarize API] Found existing client:', clientId);
      } else {
        // Create client with minimal data - triggers will handle totals
        const { data: newClient, error: insertError } = await authenticatedSupabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: summary.clientInfo.name || summary.clientInfo.company,
            email: summary.clientInfo.email,
            company: summary.clientInfo.company,
            status: 'active',
            total_invoices: 0, // Will be updated by trigger
            total_amount: 0,   // Will be updated by trigger
            last_invoice: null // Will be updated by trigger
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error('[summarize API] Error creating client:', insertError);
        } else {
          clientId = newClient.id;
          console.log('[summarize API] Created new client:', clientId);
        }
      }
    }

    // Prepare invoice update data with extracted details
    const updateData: any = {
      summary: summary,
      status: 'processed'
    };

    // Update client information if extracted
    if (summary.clientInfo && summary.clientInfo.company) {
      updateData.client = summary.clientInfo.company;
      console.log('[summarize API] Setting client name for invoice:', summary.clientInfo.company);
      
      // Use the clientId from the client creation/update above
      if (clientId) {
        updateData.client_id = clientId;
        console.log('[summarize API] Setting client_id for invoice:', clientId);
      }
    }

    // Update date if extracted
    if (summary.invoiceDate) {
      updateData.date = summary.invoiceDate;
      console.log('[summarize API] Setting invoice date:', summary.invoiceDate);
    }

    // Update amount if extracted - convert to numeric value
    if (summary.totalAmount) {
      // Remove currency symbols, commas, and spaces, then convert to number
      const cleanAmount = summary.totalAmount.toString().replace(/[$,€£¥\s]/g, '');
      const numericAmount = parseFloat(cleanAmount);
      
      if (!isNaN(numericAmount)) {
        updateData.amount = numericAmount;
        console.log('[summarize API] Setting invoice amount:', { original: summary.totalAmount, numeric: numericAmount });
      } else {
        console.warn('[summarize API] Could not parse amount:', summary.totalAmount);
      }
    }

    console.log('[summarize API] Final update data for invoice:', updateData);

    // Update invoice with summary and extracted details
    const { error: updateError } = await authenticatedSupabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId);
    console.log('[summarize API] Supabase update result:', { updateError });

    if (updateError) {
      console.error('[summarize API] Failed to update invoice with summary:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invoice with summary' },
        { status: 500 }
      );
    }

    // If action is 'email', send the summary via email
    if (action === 'email') {
      const emailResult = await sendSummaryEmail(invoice, summary);
      console.log('[summarize API] Email result:', emailResult);
      if (!emailResult.success) {
        return NextResponse.json(
          { 
            success: true,
            message: 'Summary generated but email failed to send',
            summary: summary,
            emailError: emailResult.error
          },
          { status: 200 }
        );
      }
    }

    // Prepare success message with update details
    let updateMessage = 'Summary generated successfully';
    const updates = [];
    
    if (summary.clientInfo && summary.clientInfo.company) {
      updates.push(`Client: ${summary.clientInfo.company}`);
    }
    if (summary.invoiceDate) {
      updates.push(`Date: ${summary.invoiceDate}`);
    }
    if (summary.totalAmount) {
      updates.push(`Amount: ${summary.totalAmount}`);
    }
    
    if (updates.length > 0) {
      updateMessage += ` and updated: ${updates.join(', ')}`;
    }

    return NextResponse.json({
      success: true,
      message: action === 'email' ? 'Summary generated and sent via email' : updateMessage,
      summary: summary,
      updates: updates
    });

  } catch (error) {
    console.error('[summarize API] Uncaught error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('invoiceId');

  if (!invoiceId) {
    return NextResponse.json(
      { error: 'Invoice ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('summary')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      summary: invoice.summary
    });

  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 