-- Fix profiles table structure
-- Run this in your Supabase SQL editor

-- Step 1: Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 2: Update existing profiles with email from auth.users
UPDATE public.profiles 
SET email = auth.users.email
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
  AND public.profiles.email IS NULL;

-- Step 3: Create a trigger to automatically sync email from auth.users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile email when user email changes
  UPDATE public.profiles 
  SET email = NEW.email
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger for email sync
DROP TRIGGER IF EXISTS trigger_sync_user_email ON auth.users;
CREATE TRIGGER trigger_sync_user_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_email();

-- Step 5: Create trigger for new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for new user signup
DROP TRIGGER IF EXISTS trigger_handle_new_user ON auth.users;
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 7: Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 8: Show current profiles data
SELECT 
  id,
  first_name,
  last_name,
  email,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10; 