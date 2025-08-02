-- Test database structure and relationships
-- Run this in your Supabase SQL editor to verify everything is working

-- 1. Check if client_id column exists in invoices table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'client_id';

-- 2. Check foreign key constraint
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='invoices' 
  AND kcu.column_name = 'client_id';

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'invoices';

-- 4. Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'invoices';

-- 5. Test data - show current invoices and their client relationships
SELECT 
    i.id as invoice_id,
    i.name as invoice_name,
    i.client,
    i.client_id,
    i.amount,
    i.date,
    c.company as client_company,
    c.total_amount as client_total,
    c.total_invoices as client_invoice_count
FROM public.invoices i
LEFT JOIN public.clients c ON i.client_id = c.id
ORDER BY i.created_at DESC
LIMIT 10; 