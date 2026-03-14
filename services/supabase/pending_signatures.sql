-- Create table for pending signatures
CREATE TABLE IF NOT EXISTS public.pending_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR NOT NULL,
    patient_name VARCHAR NOT NULL,
    therapist_username VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'signed')),
    signed_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '24 hours') NOT NULL
);

-- Enable RLS
ALTER TABLE public.pending_signatures ENABLE ROW LEVEL SECURITY;

-- Create policy for inserts (Therapists can create pending signatures)
CREATE POLICY "Therapists can create pending signatures" 
    ON public.pending_signatures FOR INSERT 
    WITH CHECK (true); -- Ideally restrict by therapist_username in a secure environment

-- Create policy for selects (Therapists can see their own, anyone with ID can view to sign)
CREATE POLICY "Anyone with ID can view pending signature" 
    ON public.pending_signatures FOR SELECT 
    USING (true);

-- Create policy for updates (Anyone with ID can sign)
CREATE POLICY "Anyone with ID can sign" 
    ON public.pending_signatures FOR UPDATE 
    USING (status = 'pending')
    WITH CHECK (status = 'signed');
