-- Fix database relationships between invoices and clients tables
-- Run this in your Supabase SQL editor

-- Step 1: Add client_id column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Step 2: Create index for better performance
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);

-- Step 3: Update existing invoices to link to clients based on client name
UPDATE public.invoices 
SET client_id = c.id
FROM public.clients c
WHERE invoices.client = c.company 
  AND invoices.user_id = c.user_id
  AND invoices.client_id IS NULL;

-- Step 4: Add RLS policy for the new relationship
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy for invoices with client_id relationship
CREATE POLICY "Users can manage their own invoices with client relationship" ON public.invoices
FOR ALL USING (
  auth.uid() = user_id AND 
  (client_id IS NULL OR client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  ))
);

-- Step 5: Create a function to automatically update client totals
CREATE OR REPLACE FUNCTION update_client_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update client totals when invoice is inserted/updated/deleted
  IF TG_OP = 'INSERT' THEN
    -- Add invoice amount to client total
    UPDATE public.clients 
    SET total_amount = COALESCE(total_amount, 0) + COALESCE(NEW.amount, 0),
        total_invoices = COALESCE(total_invoices, 0) + 1,
        last_invoice = COALESCE(NEW.date, CURRENT_DATE)
    WHERE id = NEW.client_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle client change
    IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
      -- Remove from old client
      IF OLD.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0),
            total_invoices = GREATEST(COALESCE(total_invoices, 0) - 1, 0)
        WHERE id = OLD.client_id;
      END IF;
      
      -- Add to new client
      IF NEW.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = COALESCE(total_amount, 0) + COALESCE(NEW.amount, 0),
            total_invoices = COALESCE(total_invoices, 0) + 1,
            last_invoice = COALESCE(NEW.date, CURRENT_DATE)
        WHERE id = NEW.client_id;
      END IF;
    ELSE
      -- Same client, just update amount difference
      IF OLD.amount IS DISTINCT FROM NEW.amount AND NEW.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0),
            last_invoice = COALESCE(NEW.date, CURRENT_DATE)
        WHERE id = NEW.client_id;
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove invoice amount from client total
    IF OLD.client_id IS NOT NULL THEN
      UPDATE public.clients 
      SET total_amount = GREATEST(COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0), 0),
          total_invoices = GREATEST(COALESCE(total_invoices, 0) - 1, 0)
      WHERE id = OLD.client_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to automatically update client totals
DROP TRIGGER IF EXISTS trigger_update_client_totals ON public.invoices;
CREATE TRIGGER trigger_update_client_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_client_totals();

-- Step 7: Create function to clean up orphaned clients
CREATE OR REPLACE FUNCTION cleanup_orphaned_clients()
RETURNS void AS $$
BEGIN
  -- Delete clients that have no invoices
  DELETE FROM public.clients 
  WHERE total_invoices = 0 OR total_invoices IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create a view for better querying
CREATE OR REPLACE VIEW invoice_client_summary AS
SELECT 
  i.id as invoice_id,
  i.name as invoice_name,
  i.client_id,
  c.company as client_company,
  c.name as client_name,
  i.amount,
  i.date,
  i.status,
  i.user_id
FROM public.invoices i
LEFT JOIN public.clients c ON i.client_id = c.id
WHERE i.user_id = auth.uid();

-- Step 9: Add RLS to the view
ALTER VIEW invoice_client_summary SET (security_invoker = true); 