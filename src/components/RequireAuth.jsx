import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-sm text-muted">Memuat data…</div>
  }
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
