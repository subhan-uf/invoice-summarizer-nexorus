import { NextRequest, NextResponse } from 'next/server';
import { sendSummaryEmail, sendSummaryEmailToRecipient } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    let user = null;
    
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
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Verify the token and get user using the authenticated client
      const { data: { user: authUser }, error: authError } = await authenticatedSupabase.auth.getUser(token);
      if (authError) {
        console.error('[email API] Auth error:', authError);
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
      user = authUser;
      console.log('[email API] Authenticated user:', user?.id);
    } else {
      console.log('[email API] No Bearer token provided');
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { invoiceId, recipientEmail } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Get invoice from database using authenticated client
    const { data: invoice, error: fetchError } = await authenticatedSupabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      console.error('[email API] Invoice fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if invoice has a summary
    if (!invoice.summary) {
      return NextResponse.json(
        { error: 'Invoice does not have a summary. Please generate summary first.' },
        { status: 400 }
      );
    }
    
    // Send email
    let emailResult;
    if (recipientEmail) {
      emailResult = await sendSummaryEmailToRecipient(invoice, invoice.summary, recipientEmail, authenticatedSupabase);
    } else {
      emailResult = await sendSummaryEmail(invoice, invoice.summary, authenticatedSupabase);
    }

    console.log('[email API] Email result:', emailResult);

    if (!emailResult.success) {
      console.error('[email API] Email sending failed:', emailResult.error);
      return NextResponse.json(
        { error: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      recipient: emailResult.recipient,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 