import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { addDays, mondayOf, todayISO, formatDate } from '../lib/dates'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const STATUS_OPTIONS = [
  { value: '', label: '-' },
  { value: 'H', label: 'H (Hadir)' },
  { value: 'I', label: 'I (Izin)' },
  { value: 'S', label: 'S (Sakit)' },
  { value: 'A', label: 'A (Alpa)' },
]

const cellKey = (studentId, date) => `${studentId}|${date}`

export default function Attendance() {
  const { classes } = useAuth()
  const [week, setWeek] = useState(mondayOf(todayISO()))
  const [classId, setClassId] = useState('')
  const [students, setStudents] = useState([])
  const [saved, setSaved] = useState({})
  const [draft, setDraft] = useState({})
  const [message, setMessage] = useState('')

  const dates = DAYS.map((_, i) => addDays(week, i))

  // Default to the first assigned class.
  useEffect(() => {
    if (!classId && classes.length) setClassId(String(classes[0].id))
  }, [classes, classId])

  async function load() {
    if (!classId) {
      setStudents([])
      setSaved({})
      setDraft({})
      setMessage('')
      return
    }
    const [{ data: st }, { data: att }] = await Promise.all([
      supabase
        .from('students')
        .select('id, name')
        .eq('class_id', Number(classId))
        .order('name'),
      supabase
        .from('attendance')
        .select('student_id, attendance_date, status')
        .gte('attendance_date', week)
        .lte('attendance_date', addDays(week, 5)),
    ])
    setStudents(st ?? [])
    setSaved(
      Object.fromEntries(
        (att ?? []).map((r) => [cellKey(r.student_id, r.attendance_date), r.status])
      )
    )
    setDraft({})
    setMessage('')
  }

  useEffect(() => {
    load()
  }, [week, classId])

  function setCell(studentId, date, status) {
    setDraft((d) => ({ ...d, [cellKey(studentId, date)]: status }))
  }

  async function save() {
    const rows = Object.entries(draft)
      .filter(([k]) => !(k in saved) || saved[k] !== draft[k])
      .filter(([, status]) => status !== '')
      .map(([k, status]) => {
        const [student_id, attendance_date] = k.split('|')
        return { student_id: Number(student_id), attendance_date, status }
      })

    if (rows.length === 0) {
      setMessage('Belum ada perubahan.')
      return
    }

    const { error } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'student_id,attendance_date' })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Absensi tersimpan.')
      load()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Absensi</h1>
      <p className="mt-1 text-sm text-muted">
        Isi absensi untuk satu minggu sekolah, Senin sampai Sabtu.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-line bg-white p-4">
        <div>
          <label htmlFor="class" className="mb-1 block text-sm font-medium text-slate-800">
            Kelas
          </label>
          <select
            id="class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="week" className="mb-1 block text-sm font-medium text-slate-800">
            Pilih tanggal dalam minggu
          </label>
          <input
            id="week"
            type="date"
            value={week}
            onChange={(e) => e.target.value && setWeek(mondayOf(e.target.value))}
            className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
          />
        </div>
        <p className="text-sm text-muted">
          {formatDate(dates[0])} sampai {formatDate(dates[5])}
        </p>
        <button
          onClick={save}
          className="ml-auto rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Simpan absensi
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-slate-700">{message}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="sticky left-0 z-10 bg-surface px-4 py-3 font-medium">No</th>
              <th className="sticky left-[48px] z-10 bg-surface px-4 py-3 font-medium">Nama</th>
              {DAYS.map((d) => (
                <th key={d} className="px-3 py-3 font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className="border-t border-line">
                <td className="sticky left-0 z-10 bg-white px-4 py-2 text-muted">{i + 1}</td>
                <td className="sticky left-[48px] z-10 border-r border-line bg-white px-4 py-2 text-slate-900">{s.name}</td>
                {dates.map((date) => {
                  const k = cellKey(s.id, date)
                  const value = k in draft ? draft[k] : saved[k] ?? ''
                  return (
                    <td key={date} className="px-3 py-2">
                      <select
                        value={value}
                        onChange={(e) => setCell(s.id, date, e.target.value)}
                        className="w-full rounded-md border border-line bg-white px-2 py-1.5 text-base focus:border-brand focus:outline-none sm:text-sm"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                  )
                })}
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  Tambahkan siswa terlebih dahulu di menu Data Siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
