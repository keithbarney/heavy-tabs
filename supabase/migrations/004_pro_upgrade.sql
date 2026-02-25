-- Pro upgrade: add is_pro flag + stripe_customer_id to profiles
-- and enforce project limit via RLS

-- 1. Add columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- 2. Drop the permissive INSERT policy on projects
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;

-- 3. New INSERT policy: Pro users unlimited, free users capped at 10
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Pro users: unlimited
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_pro = true
      )
      -- Free users: max 10 projects
      OR (
        SELECT count(*) FROM public.projects
        WHERE projects.user_id = auth.uid()
      ) < 10
    )
  );
