import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function resolveSession(session) {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', u.id)
          .single()
        if (!mounted) return
        setProfile(data ?? null)
      } else {
        if (mounted) setProfile(null)
      }
      if (mounted) setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return
        if (event === 'TOKEN_REFRESHED') {
          if (session?.user) setUser(session.user)
          return
        }
        // SIGNED_IN: reset loading so ProtectedRoute shows spinner until profile is ready
        if (event === 'SIGNED_IN') setLoading(true)
        resolveSession(session)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      role:    profile?.role ?? null,
      isAdmin: profile?.role === 'admin',
      loading,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve essere usato dentro AuthProvider')
  return ctx
}
