-- =============================================
-- Invite System: Tables and RPC Functions
-- =============================================

-- Table: stores each user's unique invite code and usage limits
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  code text not null unique,
  max_uses int not null default 5,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Table: tracks each redemption (who used whose code)
create table if not exists public.invite_redemptions (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.invites(id) on delete cascade not null,
  redeemed_by uuid references auth.users(id) on delete cascade not null,
  redeemed_at timestamptz not null default now()
);

-- Index for fast lookups
create index if not exists idx_invites_code on public.invites(code);
create index if not exists idx_invites_user_id on public.invites(user_id);
create index if not exists idx_invite_redemptions_invite_id on public.invite_redemptions(invite_id);

-- Enable RLS
alter table public.invites enable row level security;
alter table public.invite_redemptions enable row level security;

-- RLS policies: users can read their own invite
create policy "Users can view own invite"
  on public.invites for select
  using (auth.uid() = user_id);

-- Allow inserts from the RPC (security definer)
create policy "System can insert invites"
  on public.invites for insert
  with check (auth.uid() = user_id);

-- Allow anyone to read invites by code (needed for redemption lookup)
create policy "Anyone can lookup invite by code"
  on public.invites for select
  using (true);

-- Redemptions: users can see their own
create policy "Users can view own redemptions"
  on public.invite_redemptions for select
  using (auth.uid() = redeemed_by);

-- =============================================
-- RPC: Generate invite code for a user
-- Called after signup or on first modal open
-- =============================================
create or replace function public.generate_invite_code(p_user_id uuid)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_username text;
  v_code text;
  v_existing json;
  v_random text;
begin
  -- Check if user already has an invite code
  select json_build_object('code', code, 'remaining', max_uses - used_count)
  into v_existing
  from invites
  where user_id = p_user_id;

  if v_existing is not null then
    return v_existing;
  end if;

  -- Get username for personalized code
  select handle into v_username
  from profiles
  where id = p_user_id;

  if v_username is null then
    v_username := 'USER';
  end if;

  -- Generate 4-char random alphanumeric suffix
  v_random := upper(substr(md5(random()::text), 1, 4));
  v_code := 'SCENE-' || upper(v_username) || '-' || v_random;

  -- Ensure uniqueness (retry if collision)
  while exists (select 1 from invites where code = v_code) loop
    v_random := upper(substr(md5(random()::text), 1, 4));
    v_code := 'SCENE-' || upper(v_username) || '-' || v_random;
  end loop;

  insert into invites (user_id, code, max_uses, used_count)
  values (p_user_id, v_code, 5, 0);

  return json_build_object('code', v_code, 'remaining', 5);
end;
$$;

-- =============================================
-- RPC: Get a user's invite info
-- =============================================
create or replace function public.get_my_invite(p_user_id uuid)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_result json;
begin
  select json_build_object(
    'code', code,
    'remaining', max_uses - used_count,
    'max_uses', max_uses,
    'used_count', used_count
  )
  into v_result
  from invites
  where user_id = p_user_id;

  return v_result;
end;
$$;

-- =============================================
-- RPC: Redeem an invite code
-- Returns status: 'success', 'invalid_code', 'no_uses_left', 'already_redeemed'
-- =============================================
create or replace function public.redeem_invite_code(p_code text, p_redeemer_id uuid)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_invite record;
  v_already_redeemed boolean;
begin
  -- Look up the invite
  select * into v_invite
  from invites
  where code = upper(trim(p_code));

  if v_invite is null then
    return json_build_object('status', 'invalid_code');
  end if;

  -- Don't let users redeem their own code
  if v_invite.user_id = p_redeemer_id then
    return json_build_object('status', 'invalid_code');
  end if;

  -- Check if already redeemed by this user
  select exists(
    select 1 from invite_redemptions
    where invite_id = v_invite.id and redeemed_by = p_redeemer_id
  ) into v_already_redeemed;

  if v_already_redeemed then
    return json_build_object('status', 'already_redeemed');
  end if;

  -- Check remaining uses
  if v_invite.used_count >= v_invite.max_uses then
    return json_build_object('status', 'no_uses_left');
  end if;

  -- Redeem: insert record and increment counter
  insert into invite_redemptions (invite_id, redeemed_by)
  values (v_invite.id, p_redeemer_id);

  update invites
  set used_count = used_count + 1
  where id = v_invite.id;

  -- Trigger ecosystem side effects (auto-follow, circle, notification)
  -- This function may not exist yet on first migration run, so
  -- we call it conditionally via a BEGIN/EXCEPTION block
  begin
    perform public.on_invite_redeemed(v_invite.user_id, p_redeemer_id, upper(trim(p_code)));
  exception when undefined_function then
    -- on_invite_redeemed not yet deployed, skip silently
    null;
  end;

  return json_build_object(
    'status', 'success',
    'inviter_id', v_invite.user_id
  );
end;
$$;
