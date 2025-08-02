-- Clean up double-counted client data
-- Run this in your Supabase SQL editor to fix existing issues

-- Step 1: Show current state before cleanup
SELECT 
  'BEFORE CLEANUP' as status,
  c.id,
  c.company,
  c.total_invoices as stored_invoice_count,
  c.total_amount as stored_total_amount,
  COUNT(i.id) as actual_invoice_count,
  SUM(i.amount) as actual_total_amount
FROM public.clients c
LEFT JOIN public.invoices i ON c.id = i.client_id
GROUP BY c.id, c.company, c.total_invoices, c.total_amount
ORDER BY c.company;

-- Step 2: Update client totals to match actual invoice data
UPDATE public.clients 
SET 
  total_invoices = subquery.actual_invoice_count,
  total_amount = subquery.actual_total_amount
FROM (
  SELECT 
    c.id,
    COUNT(i.id) as actual_invoice_count,
    COALESCE(SUM(i.amount), 0) as actual_total_amount
  FROM public.clients c
  LEFT JOIN public.invoices i ON c.id = i.client_id
  GROUP BY c.id
) as subquery
WHERE public.clients.id = subquery.id;

-- Step 3: Show state after cleanup
SELECT 
  'AFTER CLEANUP' as status,
  c.id,
  c.company,
  c.total_invoices as stored_invoice_count,
  c.total_amount as stored_total_amount,
  COUNT(i.id) as actual_invoice_count,
  SUM(i.amount) as actual_total_amount
FROM public.clients c
LEFT JOIN public.invoices i ON c.id = i.client_id
GROUP BY c.id, c.company, c.total_invoices, c.total_amount
ORDER BY c.company;

-- Step 4: Clean up orphaned clients (those with 0 invoices)
SELECT 
  'ORPHANED CLIENTS TO DELETE' as status,
  c.id,
  c.company,
  c.total_invoices,
  c.total_amount
FROM public.clients c
WHERE c.total_invoices = 0 OR c.total_invoices IS NULL;

-- Step 5: Delete orphaned clients
DELETE FROM public.clients 
WHERE total_invoices = 0 OR total_invoices IS NULL;

-- Step 6: Final verification
SELECT 
  'FINAL STATE' as status,
  c.id,
  c.company,
  c.total_invoices,
  c.total_amount,
  COUNT(i.id) as actual_invoice_count,
  SUM(i.amount) as actual_total_amount
FROM public.clients c
LEFT JOIN public.invoices i ON c.id = i.client_id
GROUP BY c.id, c.company, c.total_invoices, c.total_amount
ORDER BY c.company; 