CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE private.menu_recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  used_at timestamptz,
  used_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.menu_recovery_codes FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.menu_recovery_codes TO service_role;
ALTER TABLE private.menu_recovery_codes ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_legacy_menus(recovery_code text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _uid uuid := auth.uid();
  _code_id uuid;
  _count integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión' USING ERRCODE = '42501';
  END IF;
  IF recovery_code IS NULL OR length(trim(recovery_code)) < 16 THEN
    RAISE EXCEPTION 'Código no válido' USING ERRCODE = '22023';
  END IF;

  SELECT id INTO _code_id
  FROM private.menu_recovery_codes
  WHERE code_hash = encode(extensions.digest(trim(recovery_code), 'sha256'), 'hex')
    AND used_at IS NULL
  FOR UPDATE;

  IF _code_id IS NULL THEN
    RAISE EXCEPTION 'Código no válido o ya utilizado' USING ERRCODE = '22023';
  END IF;

  UPDATE public.saved_menus SET user_id = _uid WHERE user_id IS NULL;
  GET DIAGNOSTICS _count = ROW_COUNT;

  UPDATE private.menu_recovery_codes SET used_at = now(), used_by = _uid WHERE id = _code_id;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_legacy_menus(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_legacy_menus(text) TO authenticated;