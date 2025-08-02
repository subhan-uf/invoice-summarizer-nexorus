import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle OAuth errors
    if (error) {
      console.error('[Google OAuth] Error from Google:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      console.error('[Google OAuth] No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('No authorization code received')}`
      );
    }

    console.log('[Google OAuth] Received authorization code, exchanging for tokens...');

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Google OAuth] Token exchange failed:', errorText);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Failed to exchange authorization code for tokens')}`
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('[Google OAuth] Token exchange successful');

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    let userEmail = 'Unknown';
    if (userInfoResponse.ok) {
      const userInfo = await userInfoResponse.json();
      userEmail = userInfo.email || 'Unknown';
      console.log('[Google OAuth] User email:', userEmail);
    }

    // Store tokens in database (we'll need to get the user ID from the session)
    // For now, we'll redirect to a page that will handle the token storage
    const tokenParams = new URLSearchParams({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      expiry_date: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      user_email: userEmail,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/store-gmail-tokens?${tokenParams.toString()}`
    );

  } catch (error) {
    console.error('[Google OAuth] Unexpected error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?error=gmail_connection_failed&message=${encodeURIComponent('Unexpected error occurred')}`
    );
  }
} 