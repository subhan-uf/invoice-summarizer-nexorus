-- Debug why first_name and last_name aren't being stored
-- Run this in your Supabase SQL editor

-- Check if there are any triggers on the profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Check if there are any constraints that might be affecting the insert
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- Check the exact structure of the profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Let's try a manual insert to see what happens
-- (Replace 'your-user-id-here' with an actual user ID from auth.users)
INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    created_at
) VALUES (
    'your-user-id-here',
    'Test',
    'User',
    'test@example.com',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    updated_at = NOW()
RETURNING *; 