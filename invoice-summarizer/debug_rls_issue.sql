-- Debug RLS Policies Issue
-- Run this in your Supabase SQL editor to check current policies

-- Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('clients', 'invoices', 'email_history', 'profiles')
ORDER BY tablename;

-- Check existing policies
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
WHERE tablename IN ('clients', 'invoices', 'email_history', 'profiles')
ORDER BY tablename, policyname;

-- Check if there are any conflicting policies
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('clients', 'invoices', 'email_history', 'profiles')
GROUP BY tablename;

-- Test if we can see the invoice
-- Replace '0795d1f2-1208-4094-a8c6-c260e7478e3f' with your actual invoice ID
SELECT 
  id,
  name,
  user_id,
  status,
  created_at
FROM invoices 
WHERE id = '0795d1f2-1208-4094-a8c6-c260e7478e3f';

-- Check all invoices for the user
-- Replace 'eb851373-f812-4059-a14e-c6e14d59e6d8' with your actual user ID
SELECT 
  id,
  name,
  user_id,
  status,
  created_at
FROM invoices 
WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
ORDER BY created_at DESC
LIMIT 10; 