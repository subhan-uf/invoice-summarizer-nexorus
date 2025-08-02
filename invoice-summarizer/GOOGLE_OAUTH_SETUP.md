# Google OAuth Setup Guide for Gmail Integration

This guide will help you set up Google OAuth2 for Gmail integration in your AI Invoice Summarizer app.

## 🔧 Prerequisites

- Google Cloud Console account
- Supabase project with the `gmail_tokens` table created

## 📋 Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Cloud Console API

### 2. Enable Gmail API

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on "Gmail API" and click **Enable**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - **User Type**: External (or Internal if using Google Workspace)
   - **App name**: "AI Invoice Summarizer"
   - **User support email**: Your email
   - **Developer contact information**: Your email
       - **Scopes**: Add the following scopes:
      - `https://www.googleapis.com/auth/gmail.readonly`
      - `https://www.googleapis.com/auth/gmail.metadata`
      - `https://www.googleapis.com/auth/userinfo.email`
      - `https://www.googleapis.com/auth/userinfo.profile`

4. Create the OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: "AI Invoice Summarizer Web Client"
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

### 4. Get Your Credentials

After creating the OAuth client, you'll get:
- **Client ID** (public)
- **Client Secret** (keep this secure)

### 5. Update Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Create the Database Table

Run the SQL script in your Supabase SQL editor:

```sql
-- Run the create_gmail_tokens_table.sql file
```

## 🔒 Security Considerations

1. **Client Secret**: Never expose the client secret in client-side code
2. **Redirect URIs**: Only use authorized redirect URIs
3. **Scopes**: Request only the minimum required scopes
4. **Token Storage**: Tokens are stored securely in Supabase with RLS enabled

## 🧪 Testing the Integration

1. Start your development server: `npm run dev`
2. Go to the dashboard or invoices page
3. Click "Connect Gmail" button
4. Complete the Google OAuth flow
5. Verify the connection status shows "Connected to Gmail ✅"

## 🚀 Production Deployment

For production, update these settings:

1. **Google Cloud Console**:
   - Add your production domain to authorized redirect URIs
   - Publish your OAuth consent screen (if external)

2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Supabase**:
   - Ensure RLS policies are properly configured
   - Test token storage and retrieval

## 🔄 Token Refresh

The system automatically handles token refresh using the refresh token. The refresh token is stored securely and used to get new access tokens when they expire.

## 📧 Gmail Integration with n8n

Once users connect their Gmail, you can:

1. Retrieve the `refresh_token` from the `gmail_tokens` table
2. Use it in n8n to poll Gmail for new emails
3. Filter for emails with PDF attachments
4. Process invoices automatically

### n8n Gmail Node Configuration

```json
{
  "authentication": "oAuth2",
  "clientId": "your_client_id",
  "clientSecret": "your_client_secret",
  "refreshToken": "user_refresh_token_from_database"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that your redirect URI matches exactly in Google Cloud Console
   - Ensure protocol (http/https) and port are correct

2. **"Client ID not found"**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
   - Check that the OAuth client is created and enabled

3. **"Access denied"**
   - Ensure Gmail API is enabled in Google Cloud Console
   - Check that required scopes are added to OAuth consent screen

4. **"Token storage failed"**
   - Verify Supabase connection and RLS policies
   - Check that `gmail_tokens` table exists

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error messages.

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security) 