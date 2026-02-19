-- RPC function to get a user's email by their profile ID
-- Used by the login flow to look up email when a phone number is entered
-- Security definer allows reading from auth.users which clients can't access directly
create or replace function public.get_user_email_by_id(user_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  user_email text;
begin
  select email into user_email
  from auth.users
  where id = user_id;
  
  return user_email;
end;
$$;
