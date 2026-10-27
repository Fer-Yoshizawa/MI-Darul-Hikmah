import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) {
      setError('Email atau password salah.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-white p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            MDH
          </div>
          <h1 className="text-lg font-semibold text-slate-900">MI Darul Hikmah</h1>
          <p className="text-sm text-muted">Aplikasi Guru</p>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        />

        <label className="mb-1 block text-sm font-medium text-slate-800" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-line px-3 py-2 text-base focus:border-brand focus:outline-none sm:text-sm"
        />

        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {busy ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
