# AI Invoice Summarizer - Backend Documentation

## Overview

This document describes the backend implementation for the AI Invoice Summarizer SaaS application. The backend is built using Next.js API routes and integrates with Supabase, OpenAI, and Gmail for comprehensive invoice processing and email functionality.

## Architecture

### Core Components

1. **API Routes** (`/app/api/`)
   - `/summarize` - Main invoice summarization endpoint
   - `/email` - Email sending functionality
   - `/webhook/n8n` - Webhook for n8n automation

2. **Services** (`/lib/`)
   - `summarizer.ts` - LangChain integration for AI summarization
   - `emailService.ts` - Nodemailer integration for email sending
   - `utils.ts` - Utility functions for PDF processing and error handling

3. **Database Integration**
   - Supabase for data storage and authentication
   - PostgreSQL tables: `invoices`, `clients`, `email_history`, `profiles`

## API Endpoints

### 1. POST `/api/summarize`

**Purpose**: Generate AI summary for uploaded invoices

**Request Body**:
```json
{
  "invoiceId": "uuid",
  "action": "summarize" | "email"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Summary generated successfully",
  "summary": {
    "summary": "Invoice summary text",
    "keyDetails": {
      "vendor": "Vendor name",
      "invoiceNumber": "INV-001",
      "dueDate": "2024-01-15",
      "paymentTerms": "Net 30"
    },
    "lineItems": [...],
    "totalAmount": "$1,000.00",
    "currency": "USD"
  }
}
```

### 2. POST `/api/email`

**Purpose**: Send invoice summary via email

**Request Body**:
```json
{
  "invoiceId": "uuid",
  "recipientEmail": "optional-specific-email@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "recipient": "recipient@example.com",
  "messageId": "email-message-id"
}
```

### 3. POST `/api/webhook/n8n`

**Purpose**: Webhook endpoint for n8n automation (email invoice detection)

**Request Body**:
```json
{
  "invoiceId": "uuid",
  "userId": "user-uuid",
  "invoiceName": "Invoice Name",
  "client": "Client Name",
  "date": "2024-01-01",
  "amount": "$1,000.00",
  "fileUrl": "https://storage-url/file.pdf",
  "source": "email"
}
```

## Environment Variables

Create a `.env.local` file with the following variables:

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Gmail Configuration
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Optional Variables

```bash
# Gmail API (for advanced features)
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token

# Application
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

### 3. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and add billing information
3. Generate an API key
4. Add to `OPENAI_API_KEY`

#### Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Add to `GMAIL_APP_PASSWORD`

#### Supabase Configuration
1. Create a Supabase project
2. Get project URL and anon key from Settings > API
3. Add to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Database Setup

Ensure your Supabase database has the following tables:

#### `invoices` Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  client TEXT,
  date DATE,
  amount DECIMAL(10,2),
  summary JSONB,
  file_url TEXT NOT NULL,
  source TEXT DEFAULT 'upload',
  status TEXT DEFAULT 'uploaded',
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `clients` Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  total_invoices INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  last_invoice DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `email_history` Table
```sql
CREATE TABLE email_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  invoice_id UUID REFERENCES invoices(id),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  client TEXT,
  invoice_name TEXT,
  status TEXT DEFAULT 'pending',
  date DATE NOT NULL,
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `profiles` Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  tagline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Storage Buckets

Create the following Supabase Storage buckets:

- `invoices` - For storing uploaded invoice PDFs
- `avatars` - For storing user profile pictures

### 6. Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

## Usage Examples

### Manual Upload Flow

1. User uploads PDF to Supabase Storage
2. Invoice record created in database
3. Call `/api/summarize` with invoice ID
4. AI generates summary and updates database
5. User can view summary or send via email

### Email Integration Flow

1. n8n detects invoice email
2. PDF saved to Supabase Storage
3. n8n calls `/api/webhook/n8n` with invoice data
4. AI generates summary automatically
5. Summary stored in database

### Email Sending

1. Call `/api/email` with invoice ID
2. System determines recipient (client email or user email)
3. Email sent with formatted summary
4. Email logged in `email_history` table

## Error Handling

The backend includes comprehensive error handling:

- **PDF Processing Errors**: Invalid PDFs, corrupted files
- **AI Service Errors**: OpenAI API failures, rate limits
- **Email Errors**: Invalid recipients, SMTP failures
- **Database Errors**: Connection issues, constraint violations

All errors are logged and appropriate HTTP status codes are returned.

## Security Considerations

1. **Authentication**: All endpoints require valid Supabase authentication
2. **Authorization**: Row Level Security ensures users only access their data
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **API Key Security**: Environment variables are used for sensitive data

## Monitoring and Logging

- All operations are logged to the `email_history` table
- Console logging for debugging
- Error tracking for failed operations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use production Supabase project
3. Configure production email settings
4. Set up proper domain and SSL
5. Implement rate limiting and monitoring

## Troubleshooting

### Common Issues

1. **PDF Text Extraction Fails**
   - Check if PDF is password protected
   - Verify PDF is not corrupted
   - Ensure PDF contains text (not just images)

2. **Email Sending Fails**
   - Verify Gmail App Password is correct
   - Check Gmail account settings
   - Ensure recipient email is valid

3. **AI Summary Generation Fails**
   - Check OpenAI API key and billing
   - Verify API rate limits
   - Check extracted text quality

4. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure RLS policies are correct

## Support

For issues or questions:
1. Check the console logs for error details
2. Verify all environment variables are set correctly
3. Test individual components (PDF parsing, AI, email) separately
4. Review Supabase logs for database issues 