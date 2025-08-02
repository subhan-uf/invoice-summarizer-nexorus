-- Final RLS Fix - Run this in your Supabase SQL editor

-- Step 1: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON clients;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON invoices;

DROP POLICY IF EXISTS "Users can view their own email history" ON email_history;
DROP POLICY IF EXISTS "Users can insert their own email history" ON email_history;
DROP POLICY IF EXISTS "Users can update their own email history" ON email_history;
DROP POLICY IF EXISTS "Users can delete their own email history" ON email_history;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON email_history;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON profiles;

-- Step 2: Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create simple, comprehensive policies for each table
-- These policies allow all operations for authenticated users on their own data

-- Clients table policies
CREATE POLICY "clients_policy" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Invoices table policies  
CREATE POLICY "invoices_policy" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Email history table policies
CREATE POLICY "email_history_policy" ON email_history
  FOR ALL USING (auth.uid() = user_id);

-- Profiles table policies (uses 'id' instead of 'user_id')
CREATE POLICY "profiles_policy" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Step 4: Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd
FROM pg_policies 
WHERE tablename IN ('clients', 'invoices', 'email_history', 'profiles')
ORDER BY tablename, policyname;

-- Step 5: Test the policies work
-- This should return the invoice we know exists
SELECT 
  id,
  name,
  user_id,
  status
FROM invoices 
WHERE id = 'f1ccb980-9004-4666-b1a1-14e62f04754e'
AND user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'; 