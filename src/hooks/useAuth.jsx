import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const DOMINIO_INTERNO = '@bioruta.local'
function emailInterno(username) { return `${username.trim().toLowerCase()}${DOMINIO_INTERNO}` }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(username, password, nombre) {
    if (!username || username.trim().length < 3) return { error: { message: 'El usuario debe tener al menos 3 caracteres' } }
    const { data: existente } = await supabase.from('username_lookup').select('username_lower').eq('username_lower', username.trim().toLowerCase()).maybeSingle()
    if (existente) return { error: { message: 'Ese nombre de usuario ya está en uso' } }
    const { error } = await supabase.auth.signUp({
      email: emailInterno(username), password,
      options: { data: { nombre, username: username.trim() } }
    })
    return { error }
  }

  async function signIn(username, password) {
    if (!username) return { error: { message: 'Ingresa tu nombre de usuario' } }
    const { error } = await supabase.auth.signInWithPassword({ email: emailInterno(username), password })
    if (error) return { error: { message: 'Usuario o contraseña incorrectos' } }
    return { error: null }
  }

  async function signOut() { await supabase.auth.signOut(); setProfile(null) }
  async function refreshProfile() { if (user) await fetchProfile(user.id) }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
