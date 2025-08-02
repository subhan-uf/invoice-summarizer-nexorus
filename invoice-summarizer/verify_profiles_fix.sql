-- Verify profiles table fix
-- Run this in your Supabase SQL editor to check the fix

-- Step 1: Check if email column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'email';

-- Step 2: Check current profiles data
SELECT 
  id,
  first_name,
  last_name,
  email,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;

-- Step 3: Check if triggers are working
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Step 4: Test creating a new profile (this will be triggered automatically)
-- Note: This is just for verification, don't run this in production
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- Step 5: Show the relationship between auth.users and profiles
SELECT 
  u.id,
  u.email as auth_email,
  p.first_name,
  p.last_name,
  p.email as profile_email,
  p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10; 