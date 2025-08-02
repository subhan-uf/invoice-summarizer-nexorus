import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { summarizeInvoice } from '@/lib/summarizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      invoiceId, 
      userId, 
      invoiceName, 
      client, 
      date, 
      amount, 
      fileUrl,
      source = 'email' 
    } = body;

    // Validate required fields
    if (!invoiceId || !userId || !invoiceName || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, userId, invoiceName, fileUrl' },
        { status: 400 }
      );
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, summary')
      .eq('id', invoiceId)
      .single();

    if (existingInvoice) {
      // If invoice already has a summary, return it
      if (existingInvoice.summary) {
        return NextResponse.json({
          success: true,
          message: 'Invoice already summarized',
          summary: existingInvoice.summary
        });
      }
    } else {
      // Create new invoice record if it doesn't exist
      const { error: insertError } = await supabase
        .from('invoices')
        .insert({
          id: invoiceId,
          user_id: userId,
          name: invoiceName,
          client: client || null,
          date: date || null,
          amount: amount || null,
          file_url: fileUrl,
          source: source,
          status: 'uploaded',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        return NextResponse.json(
          { error: `Failed to create invoice record: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    // Download PDF from Supabase Storage
    const filePath = fileUrl.split('/').slice(-2).join('/');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('invoices')
      .download(filePath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download PDF file' },
        { status: 500 }
      );
    }

    // Convert to buffer for PDF parsing
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text could be extracted from PDF' },
        { status: 400 }
      );
    }

    // Get invoice data for summarization
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found after creation' },
        { status: 500 }
      );
    }

    // Generate summary using LangChain
    const summary = await summarizeInvoice(extractedText, invoice);

    // Update invoice with summary
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        summary: summary,
        status: 'processed'
      })
      .eq('id', invoiceId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update invoice with summary' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice summarized successfully',
      summary: summary
    });

  } catch (error) {
    console.error('Error in n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for webhook verification (optional)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'n8n webhook endpoint is active'
  });
} 