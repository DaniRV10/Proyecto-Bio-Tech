import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { kgACO2 } from '../lib/co2'

export default function HomePage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)
  const [eliminando, setEliminando] = useState(null)
  const [redStats, setRedStats] = useState({ kg: 0, usuarios: 0 })

  useEffect(() => { refreshProfile(); fetchActividad(); fetchRedStats() }, [])

  async function fetchActividad() {
    const { data } = await supabase.from('puntos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
    setActividad(data || []); setLoading(false)
  }

  async function fetchRedStats() {
    const { data } = await supabase.from('profiles').select('kg_total, id')
    if (data) {
      const kg = data.reduce((s, u) => s + parseFloat(u.kg_total || 0), 0)
      const usuarios = data.filter(u => parseFloat(u.kg_total) > 0).length
      setRedStats({ kg, usuarios })
    }
  }

  async function eliminarPunto(id) {
    setEliminando(id)
    const { error } = await supabase.from('puntos').delete().eq('id', id)
    if (!error) setActividad(prev => prev.filter(p => p.id !== id))
    setEliminando(null)
  }

  const estadoBadge = (estado) => {
    if (estado === 'recogido') return <span className="badge badge-green">Recogido ✓</span>
    if (estado === 'pendiente') return <span className="badge badge-amber">Pendiente</span>
    if (estado === 'confirmado') return <span className="badge badge-green">Confirmado</span>
    return <span className="badge">{estado}</span>
  }

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 0 16px' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hola, {profile?.nombre?.split(' ')[0] || profile?.username || 'Usuario'} 👋</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
            Bio-Ruta Digital<br /><span style={{ color: 'var(--green)' }}>Coquimbo</span>
          </h1>
        </div>
        <button onClick={signOut} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Salir</button>
      </div>

      {/* Credits card */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c34, #0f3d22)', borderRadius: 18, padding: '20px', marginBottom: 14, border: '0.5px solid rgba(74,222,128,0.25)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tus BioCredits</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 44, fontWeight: 600, color: 'var(--green)' }}>{profile?.creditos ?? 0}</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>pts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'kg donados', value: (profile?.kg_total ?? 0).toFixed(1) },
            { label: 'entregas', value: profile?.entregas ?? 0 },
            { label: 'equiv. $', value: `$${((profile?.creditos ?? 0) * 10).toLocaleString('es-CL')}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '9px', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Red CO2 impact */}
      <div style={{ background: 'rgba(96,165,250,0.07)', border: '0.5px solid rgba(96,165,250,0.2)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>🌍</span>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Impacto total de la red</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '9px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{redStats.kg.toFixed(1)}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>kg orgánico</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '9px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', lineHeight: 1.2 }}>{kgACO2(redStats.kg)}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>CO₂e evitado</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '9px', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{redStats.usuarios}</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>colaboradores</p>
          </div>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 8, textAlign: 'center' }}>
          FE neto: 0.6913 kg CO₂e/kg · Huella Chile 2024
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div onClick={() => navigate('/registrar')} className="card" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📍</span>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Añadir punto</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Marca tu basura orgánica</p>
        </div>
        <div onClick={() => navigate('/mapa')} className="card" style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>🗺️</span>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Ver mapa</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Puntos activos</p>
        </div>
      </div>

      {/* Recent activity */}
      <p className="section-label">Actividad reciente</p>
      {loading ? <div className="spinner" style={{ margin: '20px auto' }} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 8 }}>
          {actividad.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aún no hay puntos registrados.<br />¡Haz el primero!</p>}
          {actividad.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.estado === 'recogido' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                {p.estado === 'recogido' ? '✓' : '⏳'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.direccion || `${parseFloat(p.lat).toFixed(4)}, ${parseFloat(p.lng).toFixed(4)}`}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.kg_estimado} kg est. · {new Date(p.created_at).toLocaleDateString('es-CL')}</p>
              </div>
              {estadoBadge(p.estado)}
              {p.estado === 'pendiente' && p.user_id === user?.id && (
                <button onClick={() => eliminarPunto(p.id)} disabled={eliminando === p.id} title="Eliminar punto"
                  style={{ background: 'rgba(248,113,113,0.12)', border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--red)', fontSize: 14, flexShrink: 0 }}>
                  {eliminando === p.id ? '…' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}
