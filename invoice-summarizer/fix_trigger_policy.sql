-- Fix the trigger policy issue
-- Run this in your Supabase SQL editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow admin inserts" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_comprehensive_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_authenticated_users" ON public.profiles;

-- Create a policy that allows the trigger to insert profiles
CREATE POLICY "profiles_trigger_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create a policy for users to view their own profile
CREATE POLICY "profiles_user_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Create a policy for users to update their own profile
CREATE POLICY "profiles_user_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a policy for users to delete their own profile
CREATE POLICY "profiles_user_delete" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Show the final policies
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_condition,
    with_check as with_check_condition
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname; 