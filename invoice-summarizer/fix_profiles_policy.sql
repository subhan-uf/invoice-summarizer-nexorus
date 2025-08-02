-- Fix the conflicting RLS policies for profiles table
-- Run this in your Supabase SQL editor

-- First, let's see what policies exist
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow admin inserts" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;

-- Create a single comprehensive policy that allows both admin and user operations
CREATE POLICY "profiles_comprehensive_policy" ON public.profiles
  FOR ALL USING (
    -- Allow if user is authenticated and owns the profile
    (auth.uid() = id) OR
    -- Allow if user is admin
    (auth.role() = 'authenticated' AND auth.uid() = id)
  ) WITH CHECK (
    -- For inserts, ensure user can only insert their own profile
    (auth.uid() = id) OR
    -- Allow admin operations
    (auth.role() = 'authenticated' AND auth.uid() = id)
  );

-- Alternative: Create separate policies for each operation
-- SELECT
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- INSERT
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- DELETE
CREATE POLICY "profiles_delete_policy" ON public.profiles
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