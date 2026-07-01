import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { kgACO2, FACTOR_CO2_POR_KG } from '../lib/co2'

export default function CreditosPage() {
  const { profile, refreshProfile } = useAuth()
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { refreshProfile(); fetchHistorial() }, [])

  async function fetchHistorial() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const { data } = await supabase.from('puntos').select('id, creditos_otorgados, kg_real, direccion, recogido_at').eq('estado', 'recogido').eq('user_id', authUser.id).order('recogido_at', { ascending: false }).limit(20)
    setHistorial((data || []).map(p => ({ monto: p.creditos_otorgados, desc: `Recojo · ${p.kg_real} kg`, sub: p.direccion || 'Punto de recolección', fecha: p.recogido_at })))
    setLoading(false)
  }

  const creditos = profile?.creditos ?? 0
  const kgTotal = parseFloat(profile?.kg_total ?? 0)

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', padding: '20px 0 16px' }}>Mis BioCredits</h2>

      {/* Balance */}
      <div style={{ background: 'linear-gradient(135deg, #1a5c34, #0f3d22)', borderRadius: 20, padding: '24px 20px', marginBottom: 14, textAlign: 'center', border: '0.5px solid rgba(74,222,128,0.25)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Saldo disponible</p>
        <p style={{ fontSize: 56, fontWeight: 700, color: 'var(--green)', lineHeight: 1 }}>{creditos}</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>BioCredits</p>
        <div style={{ marginTop: 12 }}><span className="badge badge-green">≈ ${(creditos * 10).toLocaleString('es-CL')} en descuentos</span></div>
      </div>

      {/* CO2 personal */}
      <div style={{ background: 'rgba(96,165,250,0.08)', border: '0.5px solid rgba(96,165,250,0.25)', borderRadius: 16, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>🌍</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd' }}>Tu huella de carbono mitigada</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#93c5fd' }}>{kgTotal.toFixed(1)}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>kg orgánico donado</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', lineHeight: 1.2 }}>{kgACO2(kgTotal)}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>CO₂e evitado</p>
          </div>
        </div>
        <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            <b style={{ color: 'rgba(255,255,255,0.6)' }}>Metodología:</b> FE neto = Vertedero (700.210 kg CO₂e/t) − Compostaje (8.912 kg CO₂e/t) = <b style={{ color: '#93c5fd' }}>0.6913 kg CO₂e/kg</b><br />
            Fuente: Huella Chile 2024 — Factores de Emisión
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>ℹ️ ¿Cómo funciona?</p>
        {[['1','Registra tu basura orgánica en el mapa'],['2','El equipo recoge y pesa los residuos'],['3','20 pts por kg se acreditan automáticamente']].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{n}</span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{t}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <p className="section-label">Historial</p>
      {loading ? <div className="spinner" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {historial.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Aún no tienes movimientos.<br />¡Dona tu primera carga!</p>}
          {historial.map((item, i) => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>⬆️</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.desc}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub} · {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CL') : ''}</p>
                </div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>+{item.monto}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}
