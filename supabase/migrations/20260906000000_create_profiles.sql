begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create policy "Read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider)
  values (
    new.id, new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.raw_user_meta_data ->> 'name'),
    coalesce(nullif(new.raw_user_meta_data ->> 'avatar_url', ''), new.raw_user_meta_data ->> 'picture'),
    new.raw_app_meta_data ->> 'provider'
  ) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.update_profile_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.update_profile_timestamp() from public, anon, authenticated;
create trigger on_profile_updated before update on public.profiles
  for each row execute function public.update_profile_timestamp();

insert into public.profiles (id, email, full_name, avatar_url, provider, created_at)
select id, email,
  coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), raw_user_meta_data ->> 'name'),
  coalesce(nullif(raw_user_meta_data ->> 'avatar_url', ''), raw_user_meta_data ->> 'picture'),
  raw_app_meta_data ->> 'provider', created_at
from auth.users
on conflict (id) do nothing;

commit;
