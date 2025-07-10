-- Add status_code column to status_checks table
ALTER TABLE public.status_checks 
ADD COLUMN status_code INTEGER;

-- Add comment for the new column
COMMENT ON COLUMN public.status_checks.status_code IS 'HTTP status code returned by the website (e.g., 200, 404, 500).'; 