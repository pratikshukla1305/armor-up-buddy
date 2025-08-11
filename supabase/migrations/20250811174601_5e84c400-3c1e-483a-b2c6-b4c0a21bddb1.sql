-- Security Hardening Migration (Phase 1b): Enable RLS on remaining public tables with safe policies

-- cases: public read-only
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cases' AND policyname='Cases are publicly readable'
  ) THEN
    CREATE POLICY "Cases are publicly readable"
    ON public.cases
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- criminal_profiles: public read-only
ALTER TABLE public.criminal_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='criminal_profiles' AND policyname='Criminal profiles are publicly readable'
  ) THEN
    CREATE POLICY "Criminal profiles are publicly readable"
    ON public.criminal_profiles
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- criminal_tips: allow public read, authenticated insert; updates will be refined later when roles are in place
ALTER TABLE public.criminal_tips ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='criminal_tips' AND policyname='Criminal tips are publicly readable'
  ) THEN
    CREATE POLICY "Criminal tips are publicly readable"
    ON public.criminal_tips
    FOR SELECT
    USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='criminal_tips' AND policyname='Authenticated users can submit tips'
  ) THEN
    CREATE POLICY "Authenticated users can submit tips"
    ON public.criminal_tips
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
  -- Temporary policy: allow authenticated updates (will be replaced with officer-only once roles exist)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='criminal_tips' AND policyname='Authenticated users can update tips (temporary)'
  ) THEN
    CREATE POLICY "Authenticated users can update tips (temporary)"
    ON public.criminal_tips
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (true);
  END IF;
END $$;

-- officer_profiles: keep public read-only directory
ALTER TABLE public.officer_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='officer_profiles' AND policyname='Officer profiles are publicly readable'
  ) THEN
    CREATE POLICY "Officer profiles are publicly readable"
    ON public.officer_profiles
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- officer_report_materials: restrict access to service role only (no policies)
ALTER TABLE public.officer_report_materials ENABLE ROW LEVEL SECURITY;