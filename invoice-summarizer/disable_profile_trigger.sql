-- Disable the profile trigger that's causing conflicts
-- Run this in your Supabase SQL editor

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; 