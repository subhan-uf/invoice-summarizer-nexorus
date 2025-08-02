-- Fix all database issues
-- Run this in your Supabase SQL editor

-- 1. Fix the profiles table RLS policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Fix the user_settings table - add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_settings' AND column_name = 'user_id') THEN
    ALTER TABLE public.user_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to user_settings table';
  ELSE
    RAISE NOTICE 'user_id column already exists in user_settings table';
  END IF;
END $$;

-- 3. Fix RLS policies for user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Check and fix other tables that might have similar issues
-- Fix invoices table if it has user_id instead of id
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'invoices' AND column_name = 'user_id') THEN
    RAISE NOTICE 'invoices table already has user_id column';
  ELSE
    ALTER TABLE public.invoices ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to invoices table';
  END IF;
END $$;

-- Fix clients table if it has user_id instead of id
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'clients' AND column_name = 'user_id') THEN
    RAISE NOTICE 'clients table already has user_id column';
  ELSE
    ALTER TABLE public.clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to clients table';
  END IF;
END $$;

-- Fix email_history table if it has user_id instead of id
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'email_history' AND column_name = 'user_id') THEN
    RAISE NOTICE 'email_history table already has user_id column';
  ELSE
    ALTER TABLE public.email_history ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    RAISE NOTICE 'Added user_id column to email_history table';
  END IF;
END $$;

-- 5. Show the current structure of key tables
SELECT 'profiles' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

SELECT 'user_settings' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position; 