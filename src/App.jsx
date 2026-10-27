import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import RequireAuth from './components/RequireAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Attendance from './pages/Attendance'
import Grades from './pages/Grades'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="siswa" element={<Students />} />
              <Route path="absensi" element={<Attendance />} />
              <Route path="nilai" element={<Grades />} />
              <Route path="laporan" element={<Reports />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
