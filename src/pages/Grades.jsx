import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { formatDate } from '../lib/dates'

const emptyForm = { student_id: '', subject_id: '', score: '' }

export default function Grades() {
  const { classes } = useAuth()
  const [classId, setClassId] = useState('')
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [history, setHistory] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  // Default to the first assigned class.
  useEffect(() => {
    if (!classId && classes.length) setClassId(String(classes[0].id))
  }, [classes, classId])

  async function load() {
    const [s, sub, h] = await Promise.all([
      supabase
        .from('students')
        .select('id, name, class_id')
        .eq('class_id', Number(classId))
        .order('name'),
      supabase.from('subjects').select('id, name').order('name'),
      supabase
        .from('grades')
        .select('id, score, created_at, students(name, class_id), subjects(name)')
        .eq('students.class_id', Number(classId))
        .order('created_at', { ascending: false })
        .limit(50),
    ])
    setStudents(s.data ?? [])
    setSubjects(sub.data ?? [])
    setHistory((h.data ?? []).filter((r) => r.students?.class_id === Number(classId)))
  }

  useEffect(() => {
    if (classId) load()
  }, [classId])

  async function save(e) {
    e.preventDefault()
    const score = Number(form.score)

    if (!form.student_id || !form.subject_id) {
      setMessage('Pilih siswa dan mata pelajaran.')
      return
    }
    if (form.score === '' || Number.isNaN(score) || score < 0 || score > 100) {
      setMessage('Nilai harus antara 0 sampai 100.')
      return
    }

    const { error } = await supabase.from('grades').insert({
      student_id: Number(form.student_id),
      subject_id: Number(form.subject_id),
      score,
    })

    if (error) {
      setMessage(error.message)
      return
    }
    setForm(emptyForm)
    setMessage('Nilai tersimpan.')
    load()
  }

  const fieldClass =
    'w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm'

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Input nilai</h1>
      <p className="mt-1 text-sm text-muted">Pilih siswa dan mata pelajaran, lalu isi nilainya.</p>

      <form onSubmit={save} className="mt-6 max-w-xl space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label htmlFor="class" className="mb-1 block text-sm font-medium text-slate-800">Kelas</label>
          <select
            id="class"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value)
              setForm({ ...form, student_id: '' })
              setMessage('')
            }}
            className={fieldClass}
          >
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="student" className="mb-1 block text-sm font-medium text-slate-800">Siswa</label>
          <select id="student" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className={fieldClass}>
            <option value="">Pilih siswa</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="mb-1 block text-sm font-medium text-slate-800">Mata pelajaran</label>
          <select id="subject" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className={fieldClass}>
            <option value="">Pilih mata pelajaran</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="score" className="mb-1 block text-sm font-medium text-slate-800">Nilai</label>
          <input
            id="score"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            placeholder="0 sampai 100"
            className={fieldClass}
          />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover">
            Simpan nilai
          </button>
          {message && <p className="text-sm text-slate-700">{message}</p>}
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
        <h2 className="border-b border-line px-6 py-4 font-semibold text-slate-900">Riwayat nilai terakhir</h2>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Mata pelajaran</th>
              <th className="px-4 py-3 font-medium">Nilai</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {history.map((g, i) => (
              <tr key={g.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{i + 1}</td>
                <td className="px-4 py-3 text-slate-900">{g.students?.name}</td>
                <td className="px-4 py-3 text-slate-700">{g.subjects?.name}</td>
                <td className="px-4 py-3 text-slate-900">{Number(g.score)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(g.created_at.slice(0, 10))}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Belum ada nilai.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
