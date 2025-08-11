-- Security Hardening Migration (Phase 1)
-- 1) Enable RLS and add safe policies on key tables used by the app

-- report_pdfs: user-owned, referenced by crime_reports.report_id
ALTER TABLE public.report_pdfs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_pdfs' AND policyname = 'Users can view their own report PDFs'
  ) THEN
    CREATE POLICY "Users can view their own report PDFs"
    ON public.report_pdfs
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.crime_reports cr
        WHERE cr.id = report_pdfs.report_id
          AND cr.user_id = auth.uid()
      )
    );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'report_pdfs' AND policyname = 'Users can insert their own report PDFs'
  ) THEN
    CREATE POLICY "Users can insert their own report PDFs"
    ON public.report_pdfs
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.crime_reports cr
        WHERE cr.id = report_pdfs.report_id
          AND cr.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- user_notifications: user-owned notifications (read/update/delete only by owner)
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notifications' AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
    ON public.user_notifications
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notifications' AND policyname = 'Users can insert their own notifications'
  ) THEN
    CREATE POLICY "Users can insert their own notifications"
    ON public.user_notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notifications' AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
    ON public.user_notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notifications' AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications"
    ON public.user_notifications
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- advisories: public readable content; keep write-ops via service role only
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'advisories' AND policyname = 'Advisories are publicly readable'
  ) THEN
    CREATE POLICY "Advisories are publicly readable"
    ON public.advisories
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- officer_notifications: allow authenticated users to create entries (e.g., when sending to officer)
-- Reading is performed through privileged edge functions; no SELECT policy added here yet
ALTER TABLE public.officer_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'officer_notifications' AND policyname = 'Authenticated users can insert officer notifications'
  ) THEN
    CREATE POLICY "Authenticated users can insert officer notifications"
    ON public.officer_notifications
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;


-- 2) Harden SECURITY DEFINER functions with explicit search_path
-- Recreate functions with SET search_path = public to prevent search path hijacking

CREATE OR REPLACE FUNCTION public.record_report_share(p_report_id uuid, p_shared_to text, p_share_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.report_shares (report_id, shared_to, share_type)
  VALUES (p_report_id, p_shared_to, p_share_type);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_kyc_document_ocr()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.officer_notifications (notification_type, message)
  VALUES ('kyc_ocr_needed', 'New KYC document uploaded, OCR processing needed for verification ID: ' || NEW.verification_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_analysis_video_status(p_video_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.analysis_videos 
  SET status = p_status
  WHERE id = p_video_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_officers_sos_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO officer_notifications (notification_type, message)
  VALUES ('sos_alert', 'New SOS Alert: ' || COALESCE(NEW.message, 'Emergency assistance needed'));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_officers_kyc_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO officer_notifications (notification_type, message)
  VALUES ('kyc_submission', 'New KYC verification submitted by ' || NEW.full_name);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_officers_voice_recording()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO officer_notifications (
    notification_type, 
    message
  )
  VALUES (
    'voice_recording', 
    'New voice recording uploaded for SOS alert: ' || NEW.alert_id
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_user_kyc_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.user_kyc_notifications (
        user_id, 
        verification_id, 
        message, 
        status
      )
      VALUES (
        NEW.user_id::uuid,
        NEW.id,
        CASE 
          WHEN NEW.status = 'Approved' THEN 'Your KYC verification has been approved.'
          WHEN NEW.status = 'Rejected' THEN 'Your KYC verification has been rejected: ' || COALESCE(NEW.rejection_reason, 'No reason provided.')
          ELSE 'Your KYC verification status has been updated to ' || NEW.status || '.'
        END,
        NEW.status
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_officer(full_name character varying, badge_number character varying, department character varying, department_email character varying, phone_number character varying, password character varying, confirm_password character varying)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  new_officer_id INTEGER;
BEGIN
  INSERT INTO public.officer_profiles 
    (full_name, badge_number, department, department_email, phone_number, password, confirm_password)
  VALUES 
    (full_name, badge_number, department, department_email, phone_number, password, confirm_password)
  RETURNING id INTO new_officer_id;
  
  SELECT jsonb_build_object(
    'id', new_officer_id,
    'full_name', full_name,
    'badge_number', badge_number
  ) INTO result;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_officer_report_materials(p_report_id uuid, p_pdf_id uuid DEFAULT NULL::uuid, p_pdf_name text DEFAULT NULL::text, p_pdf_url text DEFAULT NULL::text, p_pdf_is_official boolean DEFAULT false, p_video_id uuid DEFAULT NULL::uuid, p_video_name text DEFAULT NULL::text, p_video_url text DEFAULT NULL::text, p_video_status text DEFAULT NULL::text, p_video_size integer DEFAULT NULL::integer, p_report_title text DEFAULT NULL::text, p_report_status text DEFAULT NULL::text, p_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_report_title TEXT;
  v_report_status TEXT;
  v_user_id UUID;
  view_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
      SELECT FROM pg_catalog.pg_views
      WHERE schemaname = 'public'
      AND viewname = 'officer_report_materials'
  ) INTO view_exists;
  
  IF p_report_title IS NULL OR p_report_status IS NULL OR p_user_id IS NULL THEN
    SELECT title, status, user_id 
    INTO v_report_title, v_report_status, v_user_id
    FROM crime_reports 
    WHERE id = p_report_id;
    
    v_report_title := COALESCE(p_report_title, v_report_title);
    v_report_status := COALESCE(p_report_status, v_report_status);
    v_user_id := COALESCE(p_user_id, v_user_id);
  ELSE
    v_report_title := p_report_title;
    v_report_status := p_report_status;
    v_user_id := p_user_id;
  END IF;

  IF view_exists THEN
    RAISE NOTICE 'officer_report_materials is a view, adding data to underlying tables';
    IF p_pdf_id IS NOT NULL AND p_pdf_url IS NOT NULL THEN
      UPDATE report_pdfs 
      SET file_name = p_pdf_name,
          file_url = p_pdf_url,
          is_official = p_pdf_is_official
      WHERE id = p_pdf_id;
    END IF;
    
    IF p_video_id IS NOT NULL AND p_video_url IS NOT NULL THEN
      UPDATE analysis_videos
      SET file_name = p_video_name,
          file_url = p_video_url,
          status = p_video_status,
          file_size = p_video_size
      WHERE id = p_video_id;
    END IF;
  ELSE
    IF p_pdf_id IS NOT NULL AND p_pdf_url IS NOT NULL THEN
      PERFORM 1 
      FROM officer_report_materials 
      WHERE report_id = p_report_id AND pdf_id = p_pdf_id;
      
      IF FOUND THEN
        UPDATE officer_report_materials 
        SET pdf_name = p_pdf_name,
            pdf_url = p_pdf_url,
            pdf_is_official = p_pdf_is_official,
            report_title = v_report_title,
            report_status = v_report_status,
            user_id = v_user_id
        WHERE report_id = p_report_id AND pdf_id = p_pdf_id;
      ELSE
        INSERT INTO officer_report_materials (
          report_id, pdf_id, pdf_name, pdf_url, pdf_is_official, 
          report_title, report_status, user_id
        ) VALUES (
          p_report_id, p_pdf_id, p_pdf_name, p_pdf_url, p_pdf_is_official,
          v_report_title, v_report_status, v_user_id
        );
      END IF;
    END IF;

    IF p_video_id IS NOT NULL AND p_video_url IS NOT NULL THEN
      PERFORM 1 
      FROM officer_report_materials 
      WHERE report_id = p_report_id AND video_id = p_video_id;
      
      IF FOUND THEN
        UPDATE officer_report_materials 
        SET video_name = p_video_name,
            video_url = p_video_url,
            video_status = p_video_status,
            video_size = p_video_size,
            report_title = v_report_title,
            report_status = v_report_status,
            user_id = v_user_id
        WHERE report_id = p_report_id AND video_id = p_video_id;
      ELSE
        INSERT INTO officer_report_materials (
          report_id, video_id, video_name, video_url, video_status, video_size,
          report_title, report_status, user_id
        ) VALUES (
          p_report_id, p_video_id, p_video_name, p_video_url, p_video_status, p_video_size,
          v_report_title, v_report_status, v_user_id
        );
      END IF;
    END IF;
  END IF;
END;
$$;