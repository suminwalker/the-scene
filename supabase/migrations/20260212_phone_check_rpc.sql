-- Create a secure function to check if a phone number exists
-- accessible by anon/authenticated users but bypassing RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION check_phone_exists(p_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE phone = p_phone);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_phone_exists(text) TO anon, authenticated, service_role;
