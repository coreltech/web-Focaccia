-- Create the newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow any user (public/non-authenticated) to insert their email
CREATE POLICY "Enable insert for all users" 
ON public.newsletter_subscribers 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy: Allow only authenticated users (admins) to view subscribers
-- Assuming 'authenticated' role is used for admins/staff
CREATE POLICY "Enable read for authenticated users only" 
ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated 
USING (true);
