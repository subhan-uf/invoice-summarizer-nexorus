-- Fix Missing RLS Policies
-- Run this in your Supabase SQL editor

-- Check current policies
SELECT 
  schemaname, 
  tablename, 
  policyname
FROM pg_policies 
WHERE tablename IN ('clients', 'email_history', 'profiles')
ORDER BY tablename, policyname;

-- Enable RLS on missing tables (if not already enabled)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on these tables to avoid conflicts
DROP POLICY IF EXISTS "clients_policy" ON clients;
DROP POLICY IF EXISTS "email_history_policy" ON email_history;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

-- Create policies for clients table
CREATE POLICY "clients_policy" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for email_history table
CREATE POLICY "email_history_policy" ON email_history
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for profiles table (uses 'id' instead of 'user_id')
CREATE POLICY "profiles_policy" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Verify all policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('clients', 'invoices', 'email_history', 'profiles')
ORDER BY tablename, policyname;

-- Test client creation manually (this should work now)
-- Replace with your actual user ID
INSERT INTO clients (
  user_id,
  name,
  email,
  company,
  status,
  total_invoices,
  total_amount,
  last_invoice
) VALUES (
  'eb851373-f812-4059-a14e-c6e14d59e6d8',
  'Test Client 2',
  'test2@example.com',
  'Test Company 2',
  'active',
  1,
  200.00,
  CURRENT_DATE
);

-- Check if test client was created
SELECT * FROM clients WHERE name = 'Test Client 2';

-- Clean up test data
DELETE FROM clients WHERE name = 'Test Client 2'; 