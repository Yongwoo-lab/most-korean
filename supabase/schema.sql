-- Мост · 다리: accounts per institution, learning records.
-- Run once in Supabase → SQL Editor. Safe to run again.
--
-- Every device signs in to Supabase anonymously and keeps that session.
-- Logging in with an institution + ID + password binds the device session
-- to an account here, so nobody needs an email address. Tables are closed
-- to direct access (RLS on, no policies); the app only calls the functions
-- below, which check who is asking.

create extension if not exists pgcrypto with schema extensions;

create table if not exists institutions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,            -- short public code, e.g. ubi
  name text not null,
  region text,
  teacher_code text not null,           -- secret, lets a teacher create an account
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions on delete cascade,
  role text not null check (role in ('teacher', 'student', 'guardian')),
  login_id text not null,
  pass_hash text not null,
  name text not null,
  avatar text,
  class_name text,
  guardian_code text unique,            -- students only: links a parent
  state jsonb,                          -- students only: progress from the app
  state_at timestamptz,
  failed int not null default 0,
  locked_until timestamptz,
  created_at timestamptz default now(),
  unique (institution_id, login_id)
);

create table if not exists guardian_links (
  guardian_id uuid references accounts on delete cascade,
  student_id uuid references accounts on delete cascade,
  primary key (guardian_id, student_id)
);

create table if not exists sessions (
  auth_uid uuid primary key,
  account_id uuid not null references accounts on delete cascade,
  at timestamptz default now()
);

alter table institutions enable row level security;
alter table accounts enable row level security;
alter table guardian_links enable row level security;
alter table sessions enable row level security;

-- Helpers -------------------------------------------------------------------

create or replace function _me() returns accounts
language sql stable security definer set search_path = public as $$
  select a.* from sessions s join accounts a on a.id = s.account_id where s.auth_uid = auth.uid()
$$;

create or replace function _public(a accounts) returns jsonb
language sql immutable as $$
  select jsonb_build_object('id', a.id, 'role', a.role, 'login_id', a.login_id, 'name', a.name,
    'avatar', a.avatar, 'class_name', a.class_name, 'institution_id', a.institution_id,
    'institution', (select jsonb_build_object('code', i.code, 'name', i.name) from institutions i where i.id = a.institution_id))
$$;

create or replace function _bind(acc uuid) returns void
language sql security definer set search_path = public as $$
  insert into sessions (auth_uid, account_id) values (auth.uid(), acc)
  on conflict (auth_uid) do update set account_id = excluded.account_id, at = now()
$$;

create or replace function _check_id(p_id text) returns void
language plpgsql as $$
begin
  if p_id !~ '^[a-z0-9]{3,20}$' then
    raise exception 'bad_login_id';
  end if;
end $$;

-- Public --------------------------------------------------------------------

create or replace function list_institutions() returns table (code text, name text, region text)
language sql stable security definer set search_path = public as $$
  select code, name, region from institutions order by name
$$;

create or replace function login(p_inst text, p_id text, p_secret text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare a accounts;
begin
  if auth.uid() is null then raise exception 'no_session'; end if;
  select x.* into a from accounts x join institutions i on i.id = x.institution_id
   where i.code = lower(p_inst) and x.login_id = lower(p_id);
  -- Errors are returned, not raised, so the failed-try count is kept.
  if a.id is null then return jsonb_build_object('error', 'wrong_login'); end if;
  if a.locked_until > now() then return jsonb_build_object('error', 'locked'); end if;
  if a.pass_hash <> crypt(p_secret, a.pass_hash) then
    -- Five wrong tries lock the account for ten minutes.
    update accounts set failed = failed + 1,
      locked_until = case when failed + 1 >= 5 then now() + interval '10 minutes' end
     where id = a.id;
    return jsonb_build_object('error', 'wrong_login');
  end if;
  update accounts set failed = 0, locked_until = null where id = a.id;
  perform _bind(a.id);
  return _public(a);
end $$;

create or replace function logout() returns void
language sql security definer set search_path = public as $$
  delete from sessions where auth_uid = auth.uid()
$$;

create or replace function me() returns jsonb
language sql stable security definer set search_path = public as $$
  select case when (_me()).id is null then null else _public(_me()) end
$$;

create or replace function register_teacher(p_inst text, p_code text, p_id text, p_password text, p_name text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare i institutions; a accounts;
begin
  if auth.uid() is null then raise exception 'no_session'; end if;
  select * into i from institutions where code = lower(p_inst);
  if i.id is null or i.teacher_code <> upper(trim(p_code)) then raise exception 'wrong_code'; end if;
  perform _check_id(lower(p_id));
  if length(p_password) < 6 then raise exception 'short_password'; end if;
  insert into accounts (institution_id, role, login_id, pass_hash, name)
  values (i.id, 'teacher', lower(p_id), crypt(p_password, gen_salt('bf')), p_name) returning * into a;
  perform _bind(a.id);
  return _public(a);
exception when unique_violation then raise exception 'id_taken';
end $$;

create or replace function register_guardian(p_inst text, p_code text, p_id text, p_password text, p_name text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare i institutions; kid accounts; a accounts;
begin
  if auth.uid() is null then raise exception 'no_session'; end if;
  select * into i from institutions where code = lower(p_inst);
  select * into kid from accounts where institution_id = i.id and role = 'student' and guardian_code = upper(trim(p_code));
  if kid.id is null then raise exception 'wrong_code'; end if;
  perform _check_id(lower(p_id));
  if length(p_password) < 6 then raise exception 'short_password'; end if;
  insert into accounts (institution_id, role, login_id, pass_hash, name)
  values (i.id, 'guardian', lower(p_id), crypt(p_password, gen_salt('bf')), p_name) returning * into a;
  insert into guardian_links values (a.id, kid.id);
  perform _bind(a.id);
  return _public(a);
exception when unique_violation then raise exception 'id_taken';
end $$;

-- Teachers ------------------------------------------------------------------

create or replace function create_student(p_id text, p_secret text, p_name text, p_avatar text, p_class text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare t accounts := _me(); a accounts;
begin
  if t.role is distinct from 'teacher' then raise exception 'not_allowed'; end if;
  perform _check_id(lower(p_id));
  insert into accounts (institution_id, role, login_id, pass_hash, name, avatar, class_name, guardian_code)
  values (t.institution_id, 'student', lower(p_id), crypt(p_secret, gen_salt('bf')), p_name, p_avatar, nullif(p_class, ''),
          upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6)))
  returning * into a;
  return _public(a) || jsonb_build_object('guardian_code', a.guardian_code);
exception when unique_violation then raise exception 'id_taken';
end $$;

create or replace function reset_student_secret(p_student uuid, p_secret text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare t accounts := _me();
begin
  if t.role is distinct from 'teacher' then raise exception 'not_allowed'; end if;
  update accounts set pass_hash = crypt(p_secret, gen_salt('bf')), failed = 0, locked_until = null
   where id = p_student and institution_id = t.institution_id and role = 'student';
end $$;

create or replace function list_students() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t accounts := _me();
begin
  if t.role is distinct from 'teacher' then raise exception 'not_allowed'; end if;
  return coalesce((select jsonb_agg(_public(a) || jsonb_build_object('guardian_code', a.guardian_code, 'state', a.state, 'state_at', a.state_at,
      'guardians', (select count(*) from guardian_links g where g.student_id = a.id)) order by a.class_name nulls last, a.name)
    from accounts a where a.institution_id = t.institution_id and a.role = 'student'), '[]'::jsonb);
end $$;

-- Students ------------------------------------------------------------------

create or replace function load_state() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('state', (_me()).state, 'state_at', (_me()).state_at) where (_me()).role = 'student'
$$;

create or replace function save_state(p_state jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare a accounts := _me();
begin
  if a.role is distinct from 'student' then raise exception 'not_allowed'; end if;
  if pg_column_size(p_state) > 500000 then raise exception 'too_big'; end if;
  update accounts set state = p_state, state_at = now() where id = a.id;
end $$;

-- Guardians -----------------------------------------------------------------

create or replace function my_children() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare g accounts := _me();
begin
  if g.role is distinct from 'guardian' then raise exception 'not_allowed'; end if;
  return coalesce((select jsonb_agg(_public(a) || jsonb_build_object('state', a.state, 'state_at', a.state_at) order by a.name)
    from guardian_links l join accounts a on a.id = l.student_id where l.guardian_id = g.id), '[]'::jsonb);
end $$;

create or replace function add_child(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare g accounts := _me(); kid accounts;
begin
  if g.role is distinct from 'guardian' then raise exception 'not_allowed'; end if;
  select * into kid from accounts where institution_id = g.institution_id and role = 'student' and guardian_code = upper(trim(p_code));
  if kid.id is null then raise exception 'wrong_code'; end if;
  insert into guardian_links values (g.id, kid.id) on conflict do nothing;
end $$;

-- Only the functions above are callable from the app.
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function list_institutions() to anon, authenticated;
grant execute on function login(text, text, text), logout(), me(), register_teacher(text, text, text, text, text),
  register_guardian(text, text, text, text, text), create_student(text, text, text, text, text),
  reset_student_secret(uuid, text), list_students(), load_state(), save_state(jsonb), my_children(), add_child(text)
  to authenticated;

-- The first institution. Change the name if needed, then run.
insert into institutions (code, name, region, teacher_code)
values ('ubi', '유비아동센터', '경북 경주시', upper(substr(md5(random()::text), 1, 6)))
on conflict (code) do nothing;

-- Shows the teacher sign-up code. Give it only to the centre's teachers.
select code, name, teacher_code from institutions;
