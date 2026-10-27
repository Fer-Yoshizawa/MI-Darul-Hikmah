import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const GENDER_LABEL = { L: 'Laki-laki', P: 'Perempuan' }

export default function Students() {
  const { classes } = useAuth()
  const [students, setStudents] = useState([])
  const [query, setQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('L')
  const [classId, setClassId] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, gender, class_id, classes(name)')
      .order('name')
    if (error) setError(error.message)
    else setStudents(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function addStudent(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nama siswa wajib diisi.')
      return
    }
    if (!classId) {
      setError('Pilih kelas terlebih dahulu.')
      return
    }

    const { error } = await supabase
      .from('students')
      .insert({ name: trimmed, gender, class_id: Number(classId) })
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setGender('L')
    setError('')
    load()
  }

  async function removeStudent(id, studentName) {
    const ok = window.confirm(
      `Hapus ${studentName}? Absensi dan nilai siswa ini ikut terhapus.`
    )
    if (!ok) return
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  const visible = students.filter((s) => {
    const byName = s.name.toLowerCase().includes(query.trim().toLowerCase())
    const byClass = classFilter === 'all' || s.class_id === Number(classFilter)
    return byName && byClass
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Data Siswa</h1>
      <p className="mt-1 text-sm text-muted">Daftar siswa di kelas Anda.</p>

      <form onSubmit={addStudent} className="mt-6 grid gap-3 rounded-xl border border-line bg-white p-4 sm:flex sm:flex-wrap sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap siswa"
          className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        >
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        >
          <option value="">Pilih kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover">
          Tambah siswa
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama siswa"
            className="w-full max-w-xs rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
          >
            <option value="all">Semua kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kelas</th>
              <th className="px-4 py-3 font-medium">Jenis kelamin</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s, i) => (
              <tr key={s.id} className="border-t border-line">
                <td className="px-4 py-3 text-muted">{i + 1}</td>
                <td className="px-4 py-3 text-slate-900">{s.name}</td>
                <td className="px-4 py-3 text-slate-700">{s.classes?.name ?? '-'}</td>
                <td className="px-4 py-3 text-slate-700">{GENDER_LABEL[s.gender]}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeStudent(s.id, s.name)}
                    className="inline-flex items-center gap-1 text-red-700 hover:underline"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  {students.length === 0 ? 'Belum ada siswa di kelas ini.' : 'Tidak ada siswa yang cocok.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
