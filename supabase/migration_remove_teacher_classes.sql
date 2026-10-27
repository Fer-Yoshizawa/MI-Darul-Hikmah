-- ============================================================
-- migration_remove_teacher_classes.sql
-- Removes the teacher_classes join table. Login (Supabase Auth)
-- is the only account concept: every signed-in teacher sees
-- all classes and all students.
-- Idempotent: safe to run more than once.
-- ============================================================

-- 1. Classes: everyone signed in can read them (feeds the dropdowns)
drop policy if exists "teacher reads own class" on classes;
drop policy if exists "teacher reads assigned classes" on classes;
drop policy if exists "everyone signed in reads classes" on classes;
create policy "everyone signed in reads classes"
  on classes for select to authenticated
  using (true);

-- No UI creates classes anymore (Kelas 1..6 are seeded).
drop policy if exists "teacher creates classes" on classes;

-- 2. Students: any signed-in account
drop policy if exists "teacher manages students in own class" on students;
drop policy if exists "teacher manages students in own classes" on students;
drop policy if exists "everyone signed in manages students" on students;
create policy "everyone signed in manages students"
  on students for all to authenticated
  using (true)
  with check (true);

-- 3. Attendance: any signed-in account
drop policy if exists "teacher manages attendance in own class" on attendance;
drop policy if exists "teacher manages attendance in own classes" on attendance;
drop policy if exists "everyone signed in manages attendance" on attendance;
create policy "everyone signed in manages attendance"
  on attendance for all to authenticated
  using (true)
  with check (true);

-- 4. Grades: any signed-in account
drop policy if exists "teacher manages grades in own class" on grades;
drop policy if exists "teacher manages grades in own classes" on grades;
drop policy if exists "everyone signed in manages grades" on grades;
create policy "everyone signed in manages grades"
  on grades for all to authenticated
  using (true)
  with check (true);

-- 5. Remove the helper functions and the join table
drop function if exists current_class_ids();
drop function if exists current_class_id();
drop table if exists teacher_classes cascade;
