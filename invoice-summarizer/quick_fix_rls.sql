-- Quick Fix for RLS Issues
-- Run this in your Supabase SQL editor

-- Step 1: Temporarily disable RLS to test if that's the issue
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Test if we can now see the invoice
SELECT 
  id,
  name,
  user_id,
  status,
  created_at
FROM invoices 
WHERE id = '0795d1f2-1208-4094-a8c6-c260e7478e3f';

-- Step 3: Test if we can insert a client manually
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
  'Test Client',
  'test@example.com',
  'Test Company',
  'active',
  1,
  100.00,
  CURRENT_DATE
);

-- Step 4: Check if the test client was created
SELECT * FROM clients WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8';

-- Step 5: Clean up test data
DELETE FROM clients WHERE name = 'Test Client';

-- Step 6: Re-enable RLS with proper policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create proper policies (run this after confirming the issue is RLS)
-- Uncomment the lines below if RLS was the issue:

/*
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

-- Create simple, permissive policies for testing
CREATE POLICY "Enable all for authenticated users" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON invoices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON email_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Enable all for authenticated users" ON profiles
  FOR ALL USING (auth.uid() = id);
*/ 