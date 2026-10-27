-- MI Darul Hikmah — Aplikasi Guru
-- Run this in the Supabase SQL Editor.

-- Classes
create table classes (
  id bigint generated always as identity primary key,
  name text not null unique
);

-- One profile per teacher account. Linked to Supabase Auth.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  class_id bigint references classes(id)
);

create table students (
  id bigint generated always as identity primary key,
  class_id bigint not null references classes(id) on delete cascade,
  name text not null,
  gender text not null check (gender in ('L', 'P')),
  created_at timestamptz not null default now()
);

create table attendance (
  id bigint generated always as identity primary key,
  student_id bigint not null references students(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('H', 'I', 'S', 'A')),
  unique (student_id, attendance_date)
);

create table subjects (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table grades (
  id bigint generated always as identity primary key,
  student_id bigint not null references students(id) on delete cascade,
  subject_id bigint not null references subjects(id),
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

-- Row-level security.
-- Login (Supabase Auth) is the only account concept: every
-- signed-in teacher sees all classes and all students.
alter table classes enable row level security;
alter table profiles enable row level security;
alter table students enable row level security;
alter table attendance enable row level security;
alter table subjects enable row level security;
alter table grades enable row level security;

create policy "teacher reads own profile"
  on profiles for select to authenticated
  using (id = auth.uid());

create policy "everyone signed in reads classes"
  on classes for select to authenticated
  using (true);

create policy "everyone signed in reads subjects"
  on subjects for select to authenticated
  using (true);

create policy "everyone signed in manages students"
  on students for all to authenticated
  using (true)
  with check (true);

create policy "everyone signed in manages attendance"
  on attendance for all to authenticated
  using (true)
  with check (true);

create policy "everyone signed in manages grades"
  on grades for all to authenticated
  using (true)
  with check (true);

-- Starter subjects for an MI (Madrasah Ibtidaiyah) curriculum. Edit as needed.
insert into subjects (name) values
  ('Al-Qur''an Hadis'),
  ('Akidah Akhlak'),
  ('Fikih'),
  ('Bahasa Indonesia'),
  ('Bahasa Arab'),
  ('Matematika'),
  ('IPA'),
  ('IPS'),
  ('SKI'),
  ('PJOK'),
  ('SBdP'),
  ('PPKn');

-- Class options: Kelas 1 sampai Kelas 6.
insert into classes (name)
select 'Kelas ' || n from generate_series(1, 6) n
on conflict (name) do nothing;
