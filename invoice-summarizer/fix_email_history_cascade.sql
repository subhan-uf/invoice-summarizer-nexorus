-- Add trigger to delete email history when invoices are deleted
-- Run this in your Supabase SQL editor

-- Create a function to handle invoice deletion
CREATE OR REPLACE FUNCTION handle_invoice_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete associated email history records
  DELETE FROM email_history WHERE invoice_id = OLD.id;
  
  -- Update client totals
  IF OLD.client_id IS NOT NULL THEN
    UPDATE clients 
    SET 
      total_amount = total_amount - COALESCE(OLD.amount, 0),
      total_invoices = total_invoices - 1
    WHERE id = OLD.client_id;
    
    -- If client has no more invoices, delete the client
    DELETE FROM clients 
    WHERE id = OLD.client_id 
    AND total_invoices <= 0;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS invoice_deletion_trigger ON invoices;
CREATE TRIGGER invoice_deletion_trigger
  BEFORE DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_invoice_deletion();

-- Show the trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'invoice_deletion_trigger'; 