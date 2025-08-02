-- Simple fix for profiles RLS policy
-- Run this in your Supabase SQL editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow admin inserts" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;

-- Create a simple policy that allows authenticated users to manage their own profile
CREATE POLICY "profiles_authenticated_users" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Show the final policy
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