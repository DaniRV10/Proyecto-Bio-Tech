import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function ConductorPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [puntos, setPuntos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [kgReal, setKgReal] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { fetchPuntos() }, [])

  async function fetchPuntos() {
    const { data } = await supabase.from('puntos').select('*').in('estado', ['pendiente','confirmado']).order('created_at', { ascending: true })
    setPuntos(data || []); setLoading(false)
  }

  async function marcarRecogido() {
    if (!kgReal || isNaN(kgReal) || parseFloat(kgReal) <= 0) return
    setGuardando(true)
    await supabase.rpc('confirmar_recojo', { p_punto_id: modal.id, p_kg_real: parseFloat(kgReal) })
    setPuntos(prev => prev.filter(p => p.id !== modal.id))
    setModal(null); setKgReal(''); setGuardando(false)
  }

  const kgTotal = puntos.reduce((s, p) => s + parseFloat(p.kg_estimado || 0), 0)

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 0 16px' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Panel del conductor 🚛</p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)' }}>
            Hola, {profile?.nombre?.split(' ')[0] || 'Conductor'}
          </h1>
        </div>
        <button onClick={signOut} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Salir</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { v: puntos.length, l: 'pendientes' },
          { v: kgTotal.toFixed(1), l: 'kg estimados' },
          { v: puntos.filter(p => p.estado === 'confirmado').length, l: 'confirmados' },
        ].map(({ v, l }) => (
          <div key={l} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{v}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</p>
          </div>
        ))}
      </div>

      {/* Route button */}
      <button onClick={() => navigate('/mapa?ruta=1')} className="btn btn-primary" style={{ marginBottom: 20 }}>
        🗺️ Ver ruta óptima de recolección
      </button>

      {/* Points list */}
      <p className="section-label">Puntos a recoger</p>
      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {puntos.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No hay puntos pendientes 🎉</p>}
          {puntos.map((p, i) => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '1.5px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--green)', flexShrink: 0, marginTop: 2 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.direccion || `${parseFloat(p.lat).toFixed(4)}, ${parseFloat(p.lng).toFixed(4)}`}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  📦 {p.kg_estimado} kg est. · {new Date(p.created_at).toLocaleDateString('es-CL')}
                </p>
                {p.notas && <p style={{ fontSize: 11, color: 'var(--amber)', fontStyle: 'italic' }}>📝 {p.notas}</p>}
                <span className={`badge ${p.estado === 'confirmado' ? 'badge-green' : 'badge-amber'}`} style={{ marginTop: 6, display: 'inline-block' }}>{p.estado}</span>
              </div>
              <button onClick={() => { setModal(p); setKgReal(p.kg_estimado?.toString() || '') }}
                style={{ background: 'var(--green-dark)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                ✓ Recoger
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmar recojo */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000, padding: '0 0 0 0' }}>
          <div style={{ background: '#0f2118', borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 430, border: '0.5px solid var(--border)' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Confirmar recolección</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
              {modal.direccion || 'Punto de recolección'}
            </p>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">Kg reales recolectados</label>
              <input className="input" type="number" min="0.1" step="0.1" placeholder="Ej: 3.5" value={kgReal} onChange={e => setKgReal(e.target.value)} style={{ fontSize: 20, textAlign: 'center', fontWeight: 600 }} />
            </div>
            {kgReal && !isNaN(kgReal) && parseFloat(kgReal) > 0 && (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>BioCredits a acreditar</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>+{Math.floor(parseFloat(kgReal) * 20)} pts</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setModal(null); setKgReal('') }} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
              <button onClick={marcarRecogido} disabled={guardando || !kgReal || isNaN(kgReal) || parseFloat(kgReal) <= 0} className="btn btn-primary" style={{ flex: 1 }}>
                {guardando ? 'Guardando...' : '✓ Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
