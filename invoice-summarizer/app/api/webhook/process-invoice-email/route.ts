import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0,
});

// Email invoice processing prompt
const emailInvoicePrompt = PromptTemplate.fromTemplate(`
You are an expert invoice analyzer. Extract all relevant information from the email invoice data provided.

Email Subject: {subject}
Email Body: {body}

Please extract and return a JSON object with the following structure:
{{
  "clientInfo": {{
    "name": "Client/Company name",
    "email": "Client email address",
    "company": "Company name if different from client name"
  }},
  "invoiceInfo": {{
    "invoiceNumber": "Invoice number/ID",
    "invoiceDate": "YYYY-MM-DD format",
    "amount": "Total amount as number (no currency symbol)"
  }},
  "summary": "A concise summary of the invoice in 2-3 sentences"
}}

Important:
- Extract amounts as numbers only (no currency symbols)
- Use YYYY-MM-DD format for dates
- If any field is not found, use null
- Ensure all amounts are numeric values
- Extract the most accurate information available
- Focus on essential fields that match the database schema
`);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subject, body: emailBody } = body;

    if (!user_id || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, subject, body' },
        { status: 400 }
      );
    }

    // Process the email with LangChain
    const prompt = await emailInvoicePrompt.format({
      subject,
      body: emailBody,
    });

    const response = await llm.invoke(prompt);
    const content = response.content as string;

    // Parse the JSON response
    let extractedData;
    try {
      // Extract JSON from the response (it might be wrapped in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Extract data
    const { clientInfo, invoiceInfo, summary } = extractedData;

    // Create or update client
    let clientId = null;
    if (clientInfo?.name || clientInfo?.email) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id, total_amount, total_invoices')
        .eq('user_id', user_id)
        .eq('name', clientInfo.name || clientInfo.email)
        .single();

      if (existingClient) {
        // Update existing client
        const newTotal = (existingClient.total_amount || 0) + (invoiceInfo.amount || 0);
        const newCount = (existingClient.total_invoices || 0) + 1;
        
        const { data: updatedClient } = await supabase
          .from('clients')
          .update({
            total_amount: newTotal,
            total_invoices: newCount,
            last_invoice: invoiceInfo.invoiceDate || new Date().toISOString().split('T')[0]
          })
          .eq('id', existingClient.id)
          .select()
          .single();
        
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            user_id,
            name: clientInfo.name || clientInfo.email,
            email: clientInfo.email,
            company: clientInfo.company,
            status: 'active',
            total_invoices: 1,
            total_amount: invoiceInfo.amount || 0,
            last_invoice: invoiceInfo.invoiceDate || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        
        clientId = newClient?.id;
      }
    }

    // Create invoice record (NO PDF storage for email invoices)
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id,
        name: `Email Invoice - ${invoiceInfo.invoiceNumber || 'Unknown'}`,
        client: clientInfo?.name || 'Unknown',
        client_id: clientId,
        date: invoiceInfo.invoiceDate || new Date().toISOString().split('T')[0],
        amount: invoiceInfo.amount || 0,
        status: 'processed',
        source: 'email',
        summary: summary,
        file_url: null, // No PDF for email invoices
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice record' },
        { status: 500 }
      );
    }

    // Create email history record
    const { error: emailError } = await supabase
      .from('email_history')
      .insert({
        user_id,
        invoice_id: invoice.id,
        recipient: clientInfo?.email || 'Unknown',
        subject: subject,
        client: clientInfo?.name || 'Unknown',
        invoice_name: `Email Invoice - ${invoiceInfo.invoiceNumber || 'Unknown'}`,
        status: 'delivered',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].split('.')[0],
        created_at: new Date().toISOString()
      });

    if (emailError) {
      console.error('Error creating email history:', emailError);
      // Don't fail the whole process for email history error
    }

    return NextResponse.json({
      success: true,
      message: 'Email invoice processed successfully',
      invoice_id: invoice.id,
      client_id: clientId
    });

  } catch (error) {
    console.error('Error processing email invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 