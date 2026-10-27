import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-brand">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { profile, classes } = useAuth()
  const [stats, setStats] = useState({ students: 0, grades: 0, average: null })

  useEffect(() => {
    async function load() {
      const [{ count: students }, { data: scores }] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('grades').select('score'),
      ])
      const count = scores?.length ?? 0
      const total = (scores ?? []).reduce((sum, row) => sum + Number(row.score), 0)
      setStats({
        students: students ?? 0,
        grades: count,
        average: count ? total / count : null,
      })
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Ringkasan kelas Anda.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jumlah siswa" value={stats.students} />
        <StatCard label="Jumlah nilai" value={stats.grades} />
        <StatCard label="Rata-rata nilai" value={stats.average === null ? '-' : stats.average.toFixed(1)} />
        <StatCard label="Jumlah kelas" value={classes.length} />
      </div>

      <div className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="font-semibold text-slate-900">Guru</h2>
        <p className="mt-2 text-sm text-slate-700">{profile?.full_name}</p>
        <p className="mt-1 text-sm text-muted">
          {classes.length ? classes.map((c) => c.name).join(', ') : '-'}
        </p>
      </div>
    </div>
  )
}
