import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', userId)
    .single()
  return data
}

async function fetchClasses() {
  const { data } = await supabase
    .from('classes')
    .select('id, name')
    .order('name')
  return data ?? []
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  // Re-reads the profile and class list from the database.
  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    const [p, c] = await Promise.all([
      fetchProfile(data.session.user.id),
      fetchClasses(),
    ])
    setProfile(p)
    setClasses(c)
  }, [])

  useEffect(() => {
    let active = true

    async function apply(s) {
      if (!s) {
        if (active) {
          setProfile(null)
          setClasses([])
          setLoading(false)
        }
        return
      }
      const [p, c] = await Promise.all([
        fetchProfile(s.user.id),
        fetchClasses(),
      ])
      if (active) {
        setProfile(p)
        setClasses(c)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      apply(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      apply(s)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, loading, classes, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
