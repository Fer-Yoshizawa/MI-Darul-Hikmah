import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, LayoutDashboard, Users, ClipboardCheck, PenLine, Printer, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/siswa', label: 'Data Siswa', icon: Users },
  { to: '/absensi', label: 'Absensi', icon: ClipboardCheck },
  { to: '/nilai', label: 'Nilai', icon: PenLine },
  { to: '/laporan', label: 'Laporan', icon: Printer },
]

export default function Layout() {
  const { profile, classes } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden print:hidden" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-sidebar text-white/80 transition-transform duration-200 lg:static lg:translate-x-0 print:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <img
            src="/logo.png"
            alt="Logo MI Darul Hikmah"
            className="h-11 w-11 shrink-0 rounded-lg bg-white object-contain"
          />
          <div className="min-w-0">
            <p className="font-semibold text-white">MI Darul Hikmah</p>
            <p className="text-xs text-white/60">Sistem Informasi Guru</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-6 sm:py-4 print:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-slate-700 hover:bg-surface lg:hidden"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{profile?.full_name}</p>
            <p className="truncate text-xs text-muted">
              {classes.length ? classes.map((c) => c.name).join(', ') : '-'}
            </p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
