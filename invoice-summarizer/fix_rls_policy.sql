-- Quick fix for RLS policy blocking invoice lookup
-- Run this in your Supabase SQL editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can manage their own invoices with client relationship" ON public.invoices;

-- Create a simpler, working policy
CREATE POLICY "Users can manage their own invoices" ON public.invoices
FOR ALL USING (auth.uid() = user_id);

-- Test the fix
SELECT COUNT(*) FROM public.invoices WHERE user_id = auth.uid(); 