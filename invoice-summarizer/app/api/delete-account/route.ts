import { NextRequest, NextResponse } from 'next/server';

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
      // Verify the token and get user
      const { data: { user: authUser }, error: authError } = await authenticatedSupabase.auth.getUser(token);
      if (authError) {
        console.error('[delete-account API] Auth error:', authError);
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
      user = authUser;
      console.log('[delete-account API] Authenticated user:', user?.id);
    } else {
      console.log('[delete-account API] No Bearer token provided');
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[delete-account API] Starting account deletion for user:', user.id);

    // Step 1: Delete all user's data from database tables
    const tablesToClean = ['invoices', 'clients', 'email_history', 'profiles', 'user_settings'];
    
    for (const table of tablesToClean) {
      console.log(`[delete-account API] Cleaning table: ${table}`);
      const { error: deleteError } = await authenticatedSupabase
        .from(table)
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error(`[delete-account API] Error cleaning ${table}:`, deleteError);
        // Continue with other tables even if one fails
      } else {
        console.log(`[delete-account API] Successfully cleaned ${table}`);
      }
    }

    // Step 2: Delete user from Supabase Auth
    console.log('[delete-account API] Deleting user from auth');
    const { error: authDeleteError } = await authenticatedSupabase.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      console.error('[delete-account API] Error deleting user from auth:', authDeleteError);
      return NextResponse.json(
        { error: `Failed to delete account: ${authDeleteError.message}` },
        { status: 500 }
      );
    }

    console.log('[delete-account API] Account deletion completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('[delete-account API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 