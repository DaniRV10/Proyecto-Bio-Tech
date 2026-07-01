import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    if (modo === 'login') {
      const { error } = await signIn(username, password)
      if (error) setError(error.message)
    } else {
      if (!nombre.trim()) { setError('Ingresa tu nombre'); setLoading(false); return }
      if (!/^[a-zA-Z0-9_.]{3,25}$/.test(username.trim())) {
        setError('El usuario debe tener 3-25 caracteres: letras, números, "_" o "."')
        setLoading(false); return
      }
      const { error } = await signUp(username, password, nombre)
      if (error) setError(error.message)
      else setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 20px', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--green-deeper)', border: '0.5px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <span style={{ fontSize: 32 }}>🌿</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)' }}>Bio-Ruta Digital</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Coquimbo · Recicla y gana</p>
      </div>
      <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 10, padding: 4, marginBottom: 24, border: '0.5px solid var(--border)' }}>
        {['login', 'registro'].map(m => (
          <button key={m} type="button" onClick={() => { setModo(m); setError(''); setSuccess('') }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.15s', background: modo === m ? 'var(--green-dark)' : 'transparent', color: modo === m ? '#fff' : 'var(--text-muted)' }}>
            {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {modo === 'registro' && (
          <div className="input-group">
            <label className="input-label">Nombre</label>
            <input className="input" type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Nombre de usuario</label>
          <input className="input" type="text" placeholder="Ej: Catalina_2025" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck="false" required />
        </div>
        <div className="input-group">
          <label className="input-label">Contraseña</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} autoCapitalize="none" autoCorrect="off" />
          {modo === 'registro' && <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Mínimo 6 caracteres. Distingue mayúsculas y minúsculas.</p>}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 24 }}>20 BioCredits por cada kg de basura orgánica 🌱</p>
    </div>
  )
}
