import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get token data from URL parameters
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const scope = searchParams.get('scope');
    const tokenType = searchParams.get('token_type');
    const expiryDate = searchParams.get('expiry_date');
    const userEmail = searchParams.get('user_email');

    if (!accessToken || !refreshToken || !scope || !expiryDate) {
      console.error('[Store Gmail Tokens] Missing required token data');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Missing required token data')}`
      );
    }

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

    // Get user info from the user email
    const { data: users, error: userError } = await authenticatedSupabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('[Store Gmail Tokens] Error fetching users:', userError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Error fetching user data')}`
      );
    }

    // Find user by email
    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error('[Store Gmail Tokens] User not found for email:', userEmail);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Only the email you are logged in with can be connected via Gmail. Please log in with the same email address you used for Gmail.')}`
      );
    }

    console.log('[Store Gmail Tokens] Found user:', user.id);

    // Check if user already has Gmail tokens
    const { data: existingTokens } = await authenticatedSupabase
      .from('gmail_tokens')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingTokens) {
      // Update existing tokens
      const { error: updateError } = await authenticatedSupabase
        .from('gmail_tokens')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          scope: scope,
          token_type: tokenType || 'Bearer',
          expiry_date: expiryDate,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('[Store Gmail Tokens] Error updating tokens:', updateError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Failed to update Gmail tokens')}`
        );
      }

      console.log('[Store Gmail Tokens] Updated existing tokens for user:', user.id);
    } else {
      // Insert new tokens
      const { error: insertError } = await authenticatedSupabase
        .from('gmail_tokens')
        .insert({
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
          scope: scope,
          token_type: tokenType || 'Bearer',
          expiry_date: expiryDate,
        });

      if (insertError) {
        console.error('[Store Gmail Tokens] Error inserting tokens:', insertError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Failed to store Gmail tokens')}`
        );
      }

      console.log('[Store Gmail Tokens] Inserted new tokens for user:', user.id);
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=gmail_connected&message=${encodeURIComponent('Gmail connected successfully!')}`
    );

  } catch (error) {
    console.error('[Store Gmail Tokens] Unexpected error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Unexpected error occurred')}`
    );
  }
} 