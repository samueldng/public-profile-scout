-- Create enum for job status
CREATE TYPE public.job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create enum for search plan
CREATE TYPE public.search_plan AS ENUM ('basic', 'complete');

-- Create search jobs table
CREATE TABLE public.search_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  city TEXT,
  username TEXT,
  plan public.search_plan NOT NULL,
  status public.job_status NOT NULL DEFAULT 'pending',
  result_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.search_jobs(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.search_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for search_jobs (public read for now, will add auth later)
CREATE POLICY "Anyone can create search jobs"
ON public.search_jobs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view search jobs"
ON public.search_jobs
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update search jobs"
ON public.search_jobs
FOR UPDATE
USING (true);

-- RLS policies for payments
CREATE POLICY "Anyone can create payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view payments"
ON public.payments
FOR SELECT
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_search_jobs_updated_at
BEFORE UPDATE ON public.search_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_search_jobs_status ON public.search_jobs(status);
CREATE INDEX idx_search_jobs_created_at ON public.search_jobs(created_at DESC);
CREATE INDEX idx_payments_job_id ON public.payments(job_id);