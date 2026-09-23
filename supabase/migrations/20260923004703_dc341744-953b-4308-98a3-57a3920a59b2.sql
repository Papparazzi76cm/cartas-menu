ALTER TABLE public.saved_menus ADD COLUMN IF NOT EXISTS user_id uuid;

DROP POLICY IF EXISTS "Allow public read" ON public.saved_menus;
DROP POLICY IF EXISTS "Allow public insert" ON public.saved_menus;
DROP POLICY IF EXISTS "Allow public update" ON public.saved_menus;
DROP POLICY IF EXISTS "Allow public delete" ON public.saved_menus;

REVOKE ALL ON public.saved_menus FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_menus TO authenticated;
GRANT ALL ON public.saved_menus TO service_role;

ALTER TABLE public.saved_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own menus"
ON public.saved_menus FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own menus"
ON public.saved_menus FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus"
ON public.saved_menus FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
ON public.saved_menus FOR DELETE TO authenticated
USING (auth.uid() = user_id);