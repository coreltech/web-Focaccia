-- Add name column to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS name TEXT;
