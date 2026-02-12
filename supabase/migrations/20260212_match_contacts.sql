-- Create a function to match phone numbers
-- This function takes an array of phone numbers and returns the profiles that match.
-- It's a secure way to bulk-query profiles without exposing the entire table.

CREATE OR REPLACE FUNCTION match_phone_numbers(phones text[])
RETURNS SETOF public.profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles
  WHERE phone = ANY(phones);
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_phone_numbers(text[]) TO authenticated;
