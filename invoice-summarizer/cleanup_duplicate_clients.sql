-- Clean up duplicate clients and fix data
-- Run this in your Supabase SQL editor

-- Step 1: Check for duplicate clients
SELECT 
  company,
  user_id,
  COUNT(*) as duplicate_count,
  SUM(total_amount) as total_amount_sum,
  SUM(total_invoices) as total_invoices_sum
FROM clients 
WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
GROUP BY company, user_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show all clients for the user
SELECT 
  id,
  name,
  company,
  total_amount,
  total_invoices,
  created_at
FROM clients 
WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
ORDER BY company, created_at;

-- Step 3: Keep only the first client for each company and delete duplicates
-- This will keep the oldest client record for each company
WITH ranked_clients AS (
  SELECT 
    id,
    name,
    company,
    total_amount,
    total_invoices,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY company ORDER BY created_at) as rn
  FROM clients 
  WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
)
DELETE FROM clients 
WHERE id IN (
  SELECT id 
  FROM ranked_clients 
  WHERE rn > 1
);

-- Step 4: Verify cleanup
SELECT 
  id,
  name,
  company,
  total_amount,
  total_invoices,
  created_at
FROM clients 
WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
ORDER BY company, created_at;

-- Step 5: Check for any remaining duplicates
SELECT 
  company,
  user_id,
  COUNT(*) as duplicate_count
FROM clients 
WHERE user_id = 'eb851373-f812-4059-a14e-c6e14d59e6d8'
GROUP BY company, user_id
HAVING COUNT(*) > 1; 