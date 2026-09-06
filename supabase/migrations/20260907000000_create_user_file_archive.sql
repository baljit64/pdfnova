-- Saved tool results for signed-in users. Source documents are never archived.
create table public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null check (char_length(tool) between 1 and 80),
  original_name text not null check (char_length(original_name) between 1 and 255),
  storage_path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index user_files_owner_created_at_idx on public.user_files (user_id, created_at desc);
create index user_files_expiry_idx on public.user_files (expires_at);

alter table public.user_files enable row level security;
revoke all on public.user_files from anon;
grant select on public.user_files to authenticated;

create policy "Read own saved files" on public.user_files for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Create own saved file records" on public.user_files for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Private bucket. Objects must be placed below a directory named for auth.uid().
insert into storage.buckets (id, name, public, file_size_limit)
values ('user-files', 'user-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

create policy "Read own saved file objects" on storage.objects for select to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Upload own saved file objects" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Delete own saved file objects" on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
