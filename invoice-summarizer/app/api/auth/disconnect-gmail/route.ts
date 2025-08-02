import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the user token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[Disconnect Gmail] Authentication error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('[Disconnect Gmail] User authenticated:', user.id);

    // Delete Gmail tokens for the user
    const { error: deleteError } = await supabase
      .from('gmail_tokens')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[Disconnect Gmail] Error deleting tokens:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect Gmail. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[Disconnect Gmail] Successfully disconnected Gmail for user:', user.id);

    return NextResponse.json(
      { success: true, message: 'Gmail disconnected successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Disconnect Gmail] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 