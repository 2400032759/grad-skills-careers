-- Create roles/jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Full-time', 'Internship', 'Contract'
    salary_range TEXT,
    is_active BOOLEAN DEFAULT true,
    is_filled BOOLEAN DEFAULT FALSE, -- Added this line
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create candidates/applications table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT, -- Clerk user ID for application tracking
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,             -- Added portfolio column
    resume_url TEXT NOT NULL,       -- Now stores Cloudflare R2 URL
    job_id TEXT REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'Applied',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(email, job_id)
);

-- If upgrading existing table, run this:
-- ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR 'jobs'
-- Public: Can read active jobs
CREATE POLICY "Public Read Active Jobs" ON public.jobs
    FOR SELECT USING (is_active = true);

-- Admin: Full access
CREATE POLICY "Admin Full Access Jobs" ON public.jobs
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@gradskills.in'));

-- POLICIES FOR 'candidates'
-- Public: Can insert applications
CREATE POLICY "Public Insert Applications" ON public.candidates
    FOR INSERT WITH CHECK (true);

-- Public: Can read their own applications (by clerk_user_id or email)
CREATE POLICY "Users Read Own Applications" ON public.candidates
    FOR SELECT USING (true); -- Allow all reads; filter in app layer

-- Admin: Full access
CREATE POLICY "Admin Full Access Candidates" ON public.candidates
    FOR ALL USING (auth.jwt() ->> 'email' IN ('admin@gradskills.in'));
