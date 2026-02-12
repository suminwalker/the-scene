-- Trigger function to handle new user creation
-- Copies metadata from auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    first_name,
    last_name,
    phone,
    age_bracket,
    neighborhoods,
    not_familiar,
    dislikes, -- references 'preferences' from UI
    location_permission,
    instagram,
    tiktok,
    updated_at
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'age_bracket',
    -- Handle arrays by casting from jsonb, defaulting to empty array if missing/invalid
    coalesce(
        (select array_agg(x) 
         from jsonb_array_elements_text(
             case when jsonb_typeof(new.raw_user_meta_data -> 'neighborhoods') = 'array' 
             then new.raw_user_meta_data -> 'neighborhoods' 
             else '[]'::jsonb end
         ) t(x)), 
        '{}'::text[]
    ),
    (new.raw_user_meta_data ->> 'not_familiar')::boolean,
    coalesce(
        (select array_agg(x) 
         from jsonb_array_elements_text(
             case when jsonb_typeof(new.raw_user_meta_data -> 'dislikes') = 'array' 
             then new.raw_user_meta_data -> 'dislikes' 
             else '[]'::jsonb end
         ) t(x)), 
        '{}'::text[]
    ),
    new.raw_user_meta_data ->> 'location_permission',
    new.raw_user_meta_data ->> 'instagram',
    new.raw_user_meta_data ->> 'tiktok',
    now()
  );
  return new;
end;
$$;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
