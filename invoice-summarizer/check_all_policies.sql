-- Check all RLS policies in your database
-- Run this in your Supabase SQL editor

-- Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all policies for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- More detailed view of policies
SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    p.cmd as operation,
    p.permissive,
    p.roles,
    p.qual as using_condition,
    p.with_check as with_check_condition
FROM pg_policies p
WHERE p.schemaname = 'public'
ORDER BY p.tablename, p.policyname;

-- Check specific policies for profiles table
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