-- =================================================================
--  Table: websites
-- =================================================================
-- Stores the list of websites that users are monitoring.
-- Each website is owned by a single user from the auth.users table.

CREATE TABLE public.websites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.websites IS 'Stores websites monitored by users.';
COMMENT ON COLUMN public.websites.id IS 'Unique identifier for the website entry.';
COMMENT ON COLUMN public.websites.user_id IS 'Foreign key linking to the owner in auth.users.';
COMMENT ON COLUMN public.websites.name IS 'User-defined name for the website.';
COMMENT ON COLUMN public.websites.url IS 'The URL of the website to be monitored.';
COMMENT ON COLUMN public.websites.created_at IS 'Timestamp of when the website was added.';


-- =================================================================
--  Table: status_checks
-- =================================================================
-- Stores the historical results of each monitoring check for every website.

CREATE TABLE public.status_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID REFERENCES public.websites(id) ON DELETE CASCADE NOT NULL,
  status          TEXT NOT NULL,
  response_time   INTEGER, -- Stored in milliseconds
  checked_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.status_checks IS 'Stores historical results of status checks.';
COMMENT ON COLUMN public.status_checks.id IS 'Unique identifier for the status check record.';
COMMENT ON COLUMN public.status_checks.website_id IS 'Foreign key linking to the monitored website.';
COMMENT ON COLUMN public.status_checks.status IS 'The result of the check (e.g., "Online", "Offline").';
COMMENT ON COLUMN public.status_checks.response_time IS 'Website response time in milliseconds.';
COMMENT ON COLUMN public.status_checks.checked_at IS 'Timestamp of when the check was performed.';


-- =================================================================
--  Row Level Security (RLS) Policies
-- =================================================================
-- Enable RLS for both tables to enforce data privacy.

ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see and manage their own websites.
CREATE POLICY "Allow users to manage their own websites"
ON public.websites
FOR ALL
USING (auth.uid() = user_id);

-- Policy: Users can see the status checks for websites they own.
-- This is an indirect check; it joins status_checks to websites to verify ownership.
CREATE POLICY "Allow users to see status checks for their own websites"
ON public.status_checks
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.websites w
    WHERE w.id = status_checks.website_id AND w.user_id = auth.uid()
  )
);

-- Note: Inserting into status_checks should be handled by a trusted backend process
-- (like a Vercel Cron Job invoking a serverless function) that has elevated privileges,
-- so a direct INSERT policy for users is not required.