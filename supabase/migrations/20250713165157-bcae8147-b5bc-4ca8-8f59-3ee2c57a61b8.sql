-- Add preferred_language column to users table
ALTER TABLE public.users 
ADD COLUMN preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'he'));