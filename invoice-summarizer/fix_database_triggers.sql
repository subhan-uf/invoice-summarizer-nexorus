-- Fix database triggers to prevent double counting
-- Run this in your Supabase SQL editor

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_client_totals ON public.invoices;

-- Step 2: Drop existing function if it exists
DROP FUNCTION IF EXISTS update_client_totals();

-- Step 3: Create a new, improved function that handles all cases properly
CREATE OR REPLACE FUNCTION update_client_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT operations
  IF TG_OP = 'INSERT' THEN
    -- Only update if client_id is set
    IF NEW.client_id IS NOT NULL THEN
      UPDATE public.clients 
      SET total_amount = COALESCE(total_amount, 0) + COALESCE(NEW.amount, 0),
          total_invoices = COALESCE(total_invoices, 0) + 1,
          last_invoice = COALESCE(NEW.date, CURRENT_DATE)
      WHERE id = NEW.client_id;
      
      RAISE NOTICE 'INSERT: Updated client % with amount %', NEW.client_id, NEW.amount;
    END IF;
    
  -- Handle UPDATE operations
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle client_id change
    IF OLD.client_id IS DISTINCT FROM NEW.client_id THEN
      -- Remove from old client
      IF OLD.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = GREATEST(COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0), 0),
            total_invoices = GREATEST(COALESCE(total_invoices, 0) - 1, 0)
        WHERE id = OLD.client_id;
        
        RAISE NOTICE 'UPDATE: Removed from old client % with amount %', OLD.client_id, OLD.amount;
      END IF;
      
      -- Add to new client
      IF NEW.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = COALESCE(total_amount, 0) + COALESCE(NEW.amount, 0),
            total_invoices = COALESCE(total_invoices, 0) + 1,
            last_invoice = COALESCE(NEW.date, CURRENT_DATE)
        WHERE id = NEW.client_id;
        
        RAISE NOTICE 'UPDATE: Added to new client % with amount %', NEW.client_id, NEW.amount;
      END IF;
    ELSE
      -- Same client, just update amount difference
      IF OLD.amount IS DISTINCT FROM NEW.amount AND NEW.client_id IS NOT NULL THEN
        UPDATE public.clients 
        SET total_amount = COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0) + COALESCE(NEW.amount, 0),
            last_invoice = COALESCE(NEW.date, CURRENT_DATE)
        WHERE id = NEW.client_id;
        
        RAISE NOTICE 'UPDATE: Updated amount for client % from % to %', NEW.client_id, OLD.amount, NEW.amount;
      END IF;
    END IF;
    
  -- Handle DELETE operations
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove invoice amount from client total
    IF OLD.client_id IS NOT NULL THEN
      UPDATE public.clients 
      SET total_amount = GREATEST(COALESCE(total_amount, 0) - COALESCE(OLD.amount, 0), 0),
          total_invoices = GREATEST(COALESCE(total_invoices, 0) - 1, 0)
      WHERE id = OLD.client_id;
      
      RAISE NOTICE 'DELETE: Removed from client % with amount %', OLD.client_id, OLD.amount;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
CREATE TRIGGER trigger_update_client_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_client_totals();

-- Step 5: Create function to clean up orphaned clients
CREATE OR REPLACE FUNCTION cleanup_orphaned_clients()
RETURNS void AS $$
BEGIN
  -- Delete clients that have no invoices
  DELETE FROM public.clients 
  WHERE total_invoices = 0 OR total_invoices IS NULL;
  
  RAISE NOTICE 'Cleaned up orphaned clients';
END;
$$ LANGUAGE plpgsql;

-- Step 6: Test the trigger with a sample
-- This will show you if the trigger is working properly
SELECT 
  'Trigger test' as test_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'invoices' AND trigger_name = 'trigger_update_client_totals';

-- Step 7: Show current client totals for verification
SELECT 
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