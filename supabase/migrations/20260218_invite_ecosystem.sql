-- =============================================================
-- Invite Ecosystem: Notifications, Circles, Trust Network
-- =============================================================

-- ─── 1. NOTIFICATIONS TABLE ─────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,                 -- 'invite_redeemed', 'new_follower', etc.
  title text not null,
  body text,
  data jsonb default '{}'::jsonb,     -- flexible payload (redeemer_id, invite_code, etc.)
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, read) where read = false;

alter table public.notifications enable row level security;

create policy "Users can view their own notifications" on public.notifications
    for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
    for update using (auth.uid() = user_id);

-- System inserts notifications via security definer RPCs (no direct insert policy needed for users)

-- ─── 2. CIRCLES TABLE ───────────────────────────────────────
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default 'My Circle',
  created_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_via text not null default 'invite',  -- 'invite' or 'manual'
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create index if not exists idx_circles_owner on public.circles(owner_id);
create index if not exists idx_circle_members_user on public.circle_members(user_id);

alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

-- Everyone can view circles and members
create policy "Circles are viewable by everyone" on public.circles
    for select using (true);

create policy "Circle members are viewable by everyone" on public.circle_members
    for select using (true);

-- Owners can manage their circles
create policy "Circle owners can manage their circle" on public.circles
    for all using (auth.uid() = owner_id);

-- ─── 3. RPC: on_invite_redeemed ─────────────────────────────
-- Called after a successful invite redemption.
-- Handles: auto-follow, circle membership, notification.
create or replace function public.on_invite_redeemed(
  p_inviter_id uuid,
  p_redeemer_id uuid,
  p_invite_code text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_circle_id uuid;
  v_redeemer_name text;
begin
  -- 1. Auto-follow: mutual follows
  insert into public.follows (follower_id, following_id)
  values (p_redeemer_id, p_inviter_id)
  on conflict do nothing;

  insert into public.follows (follower_id, following_id)
  values (p_inviter_id, p_redeemer_id)
  on conflict do nothing;

  -- 2. Circle: get or create the inviter's circle
  select id into v_circle_id from public.circles where owner_id = p_inviter_id;

  if v_circle_id is null then
    insert into public.circles (owner_id)
    values (p_inviter_id)
    returning id into v_circle_id;

    -- Add the inviter as a member of their own circle
    insert into public.circle_members (circle_id, user_id, joined_via)
    values (v_circle_id, p_inviter_id, 'owner')
    on conflict do nothing;
  end if;

  -- Add the redeemer to the inviter's circle
  insert into public.circle_members (circle_id, user_id, joined_via)
  values (v_circle_id, p_redeemer_id, 'invite')
  on conflict do nothing;

  -- 3. Notification: notify the inviter
  select coalesce(name, handle, 'Someone')
  into v_redeemer_name
  from public.profiles
  where id = p_redeemer_id;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    p_inviter_id,
    'invite_redeemed',
    v_redeemer_name || ' joined The Scene',
    v_redeemer_name || ' used your invite code to join. You''re now following each other!',
    jsonb_build_object(
      'redeemer_id', p_redeemer_id,
      'invite_code', p_invite_code
    )
  );
end;
$$;

-- ─── 4. RPC: get_my_notifications ────────────────────────────
create or replace function public.get_my_notifications(p_user_id uuid, p_limit int default 20)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_result json;
begin
  select json_agg(row_to_json(n))
  into v_result
  from (
    select id, type, title, body, data, read, created_at
    from public.notifications
    where user_id = p_user_id
    order by created_at desc
    limit p_limit
  ) n;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- ─── 5. RPC: mark_notifications_read ─────────────────────────
create or replace function public.mark_notifications_read(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.notifications
  set read = true
  where user_id = p_user_id and read = false;
end;
$$;

-- ─── 6. RPC: get_unread_notification_count ───────────────────
create or replace function public.get_unread_notification_count(p_user_id uuid)
returns int
language plpgsql
security definer set search_path = public
as $$
declare
  v_count int;
begin
  select count(*)::int into v_count
  from public.notifications
  where user_id = p_user_id and read = false;

  return v_count;
end;
$$;

-- ─── 7. RPC: get_circle_trust_score ──────────────────────────
-- Returns the average rating for a venue from the user's circle members
create or replace function public.get_circle_trust_score(
  p_user_id uuid,
  p_venue_id text
)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_avg_rating float;
  v_count int;
  v_circle_id uuid;
begin
  -- Find the user's circle (either owned or member of)
  select cm.circle_id into v_circle_id
  from public.circle_members cm
  where cm.user_id = p_user_id
  limit 1;

  if v_circle_id is null then
    return json_build_object('avg_rating', null, 'review_count', 0);
  end if;

  -- Get ratings from circle members for this venue
  select avg(a.rating), count(*)::int
  into v_avg_rating, v_count
  from public.activities a
  inner join public.circle_members cm on cm.circle_id = v_circle_id and cm.user_id = a.user_id
  where a.venue_id = p_venue_id
    and a.rating is not null
    and a.user_id != p_user_id;

  return json_build_object(
    'avg_rating', round(v_avg_rating::numeric, 1),
    'review_count', coalesce(v_count, 0)
  );
end;
$$;

-- ─── 8. RPC: get_my_circle_member_ids ────────────────────────
-- Returns array of user IDs in the user's circle (for feed boosting)
create or replace function public.get_my_circle_member_ids(p_user_id uuid)
returns json
language plpgsql
security definer set search_path = public
as $$
declare
  v_result json;
  v_circle_id uuid;
begin
  select cm.circle_id into v_circle_id
  from public.circle_members cm
  where cm.user_id = p_user_id
  limit 1;

  if v_circle_id is null then
    return '[]'::json;
  end if;

  select json_agg(cm.user_id)
  into v_result
  from public.circle_members cm
  where cm.circle_id = v_circle_id
    and cm.user_id != p_user_id;

  return coalesce(v_result, '[]'::json);
end;
$$;
