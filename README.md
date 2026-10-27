# MI Darul Hikmah — Aplikasi Guru

A teacher app for one class at a time — now supporting **Kelas 1–6**. A teacher logs in, manages students, records weekly attendance (Senin–Sabtu), enters grades, and prints a grade report.

## Stack

- **Frontend:** React 19 + Vite (JavaScript), Tailwind CSS 3, react-router-dom, lucide-react
- **Database & auth:** Supabase (PostgreSQL + row-level security)
- **Hosting:** Vercel (static build)

## Screens

| Route | What it does |
|---|---|
| `/login` | Email + password sign-in (no public sign-up) |
| `/` | Dashboard: student count, grade count, average, class list |
| `/siswa` | Students: add / search / filter by class / delete |
| `/absensi` | Weekly attendance grid, H / I / S / A per day |
| `/nilai` | Grade entry per class + recent history |
| `/laporan` | Grade report with Tuntas / Belum tuntas (KKM 70), printable |

Every page with student data has a **Kelas** dropdown (Kelas 1 … Kelas 6).

## Local development

```bash
npm install
npm run dev
```

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database setup (Supabase)

1. SQL Editor → run `supabase/schema.sql` (tables, RLS, subjects, Kelas 1–6)
2. Authentication → Users → **Add user** (tick *Auto Confirm User*)
3. SQL Editor → create the teacher profile:

```sql
insert into profiles (id, full_name, class_id)
values ('<user-uuid>', 'Nama Guru', (select id from classes where name = 'Kelas 1'));
```

4. Authentication → Sign In / Providers → turn **off** "Allow new users to sign up"
5. Authentication → URL Configuration → set the Site URL to your deployed URL

> Upgrading an older database? Run the files in `supabase/` in filename order — each migration is idempotent.

## Deploy (Vercel)

1. Push this folder to GitHub
2. Import the repo in Vercel — build command `npm run build`, output `dist` (auto-detected)
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy, then paste the live URL into Supabase → Authentication → URL Configuration → Site URL

SPA routing is handled by `vercel.json`.

## Project structure

```
mdh-guru/
├── supabase/          # schema.sql + idempotent migrations
├── src/
│   ├── lib/           # supabase client, auth context, date helpers
│   ├── components/    # Layout (responsive sidebar), RequireAuth
│   └── pages/         # Login, Dashboard, Students, Attendance, Grades, Reports
├── vercel.json        # SPA rewrite
└── tailwind.config.js # brand palette
```
