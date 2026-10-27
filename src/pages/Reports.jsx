import { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

// Minimum passing score (KKM). Set this to the school's value.
const KKM = 70

export default function Reports() {
  const { classes } = useAuth()
  const [rows, setRows] = useState([])
  const [classFilter, setClassFilter] = useState('')

  // Default to the first assigned class.
  useEffect(() => {
    if (!classFilter && classes.length) setClassFilter(String(classes[0].id))
  }, [classes, classFilter])

  useEffect(() => {
    supabase
      .from('grades')
      .select('id, score, students(name, class_id), subjects(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows(data ?? []))
  }, [])

  const visible = rows.filter(
    (r) => r.students?.class_id === Number(classFilter)
  )

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Laporan nilai</h1>
          <p className="mt-1 text-sm text-muted">Rekap nilai siswa di kelas Anda.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover print:hidden"
        >
          <Printer size={16} /> Cetak laporan
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-4 print:hidden">
        <label htmlFor="class" className="text-sm font-medium text-slate-800">Kelas</label>
        <select
          id="class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Mata pelajaran</th>
              <th className="px-4 py-3 font-medium">Nilai</th>
              <th className="px-4 py-3 font-medium">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const score = Number(r.score)
              return (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-4 py-3 text-muted">{i + 1}</td>
                  <td className="px-4 py-3 text-slate-900">{r.students?.name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.subjects?.name}</td>
                  <td className="px-4 py-3 text-slate-900">{score}</td>
                  <td className={`px-4 py-3 ${score >= KKM ? 'text-slate-700' : 'text-red-700'}`}>
                    {score >= KKM ? 'Tuntas' : 'Belum tuntas'}
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Belum ada data nilai.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
