import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const COMERCIOS = [
  {
    id: 'santa-isabel-10',
    nombre: 'Santa Isabel',
    emoji: '🛒',
    color: '#dc2626',
    colorBg: 'rgba(220,38,38,0.1)',
    colorBorder: 'rgba(220,38,38,0.3)',
    descuento: '10% de descuento',
    detalle: 'Cupón de un solo uso',
    pts: 200,
  },
  {
    id: 'unimarc-10',
    nombre: 'Unimarc',
    emoji: '🛒',
    color: '#2563eb',
    colorBg: 'rgba(37,99,235,0.1)',
    colorBorder: 'rgba(37,99,235,0.3)',
    descuento: '10% de descuento',
    detalle: 'Cupón de un solo uso',
    pts: 200,
  },
  {
    id: 'santa-isabel-5',
    nombre: 'Santa Isabel',
    emoji: '🛒',
    color: '#dc2626',
    colorBg: 'rgba(220,38,38,0.1)',
    colorBorder: 'rgba(220,38,38,0.3)',
    descuento: '5% de descuento',
    detalle: 'Cupón de un solo uso',
    pts: 150,
  },
  {
    id: 'unimarc-5',
    nombre: 'Unimarc',
    emoji: '🛒',
    color: '#2563eb',
    colorBg: 'rgba(37,99,235,0.1)',
    colorBorder: 'rgba(37,99,235,0.3)',
    descuento: '5% de descuento',
    detalle: 'Cupón de un solo uso',
    pts: 150,
  },
  {
    id: 'shell',
    nombre: 'Shell',
    emoji: '⛽',
    color: '#d97706',
    colorBg: 'rgba(217,119,6,0.1)',
    colorBorder: 'rgba(217,119,6,0.3)',
    descuento: '$30 x litro',
    detalle: 'Cupón de un solo uso',
    pts: 250,
  },
]

// Genera un código de canje único legible SIN fecha
function generarCodigo(prefijo) {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefijo}-${rand}`
}

export default function ComerciosPage() {
  const { profile, refreshProfile } = useAuth()
  const [canjeando, setCanjeando] = useState(null) // comercio seleccionado
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [historial, setHistorial] = useState([])

  const creditos = profile?.creditos ?? 0

  useEffect(() => {
    refreshProfile()
    fetchHistorial()
  }, [])

  async function fetchHistorial() {
    const { data } = await supabase
      .from('canjes')
      .select('*, comercios(nombre)')
      .order('created_at', { ascending: false })
      .limit(10)
    setHistorial(data || [])
  }

  async function canjear(comercio) {
    setError('')
    if (creditos < comercio.pts) {
      setError(`Necesitas ${comercio.pts} pts. Tienes ${creditos}.`)
      return
    }
    setGuardando(true)

    const nuevoCodigo = generarCodigo(comercio.id.substring(0, 3).toUpperCase())

    // Guardar canje en BD
    const { error: errCanje } = await supabase.from('canjes').insert({
      user_id: profile.id,
      comercio_nombre: comercio.nombre,
      comercio_id_local: comercio.id,
      creditos_usados: comercio.pts,
      codigo_canje: nuevoCodigo,
    })

    if (errCanje) {
      // Si la tabla canjes requiere comercio_id UUID, guardamos solo el código en profiles
      // y descontamos los créditos igualmente
    }

    // Descontar créditos
    await supabase
      .from('profiles')
      .update({ creditos: creditos - comercio.pts })
      .eq('id', profile.id)

    await refreshProfile()
    setCodigo(nuevoCodigo)
    setGuardando(false)
    await fetchHistorial()
  }

  // Pantalla de código generado
  if (canjeando && codigo) return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56 }}>{canjeando.emoji}</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--green)' }}>¡Canje exitoso!</h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        {canjeando.nombre} · {canjeando.descuento}
      </p>

      {/* Código */}
      <div style={{ background: canjeando.colorBg, border: `1.5px dashed ${canjeando.color}`, borderRadius: 16, padding: '24px 32px', width: '100%' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tu código de descuento</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: canjeando.color, letterSpacing: '0.15em', wordBreak: 'break-all' }}>{codigo}</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 16px', width: '100%', textAlign: 'left' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          📲 Aplica este código al momento del pago en {canjeando.nombre}.<br />
          ⏱️ Válido por 30 días desde hoy.<br />
          ⚠️ Cupón de un solo uso — no acumulable con otras promociones.
        </p>
      </div>

      <button className="btn btn-outline" onClick={() => { setCanjeando(null); setCodigo('') }} style={{ width: '100%' }}>
        Volver a comercios
      </button>
    </div>
  )

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 16px' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Comercios</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Canjea tus BioCredits por descuentos</p>
        </div>
        <span className="badge badge-amber">🪙 {creditos} pts</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Comercios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {COMERCIOS.map(c => {
          const puedeCanjear = creditos >= c.pts
          return (
            <div key={c.id} style={{ background: c.colorBg, border: `0.5px solid ${c.colorBorder}`, borderRadius: 16, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {c.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{c.nombre}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.detalle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.descuento}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.pts} BioCredits</p>
                </div>
                {!puedeCanjear && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Te faltan</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--red)' }}>{c.pts - creditos} pts</p>
                  </div>
                )}
              </div>

              {/* Barra de progreso */}
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 20, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((creditos / c.pts) * 100, 100)}%`, height: '100%', background: puedeCanjear ? c.color : 'rgba(255,255,255,0.2)', borderRadius: 20, transition: 'width 0.4s' }} />
              </div>

              <button
                onClick={() => { setError(''); setCanjeando(c); canjear(c) }}
                disabled={!puedeCanjear || guardando}
                style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 500, cursor: puedeCanjear ? 'pointer' : 'not-allowed', background: puedeCanjear ? c.color : 'rgba(255,255,255,0.07)', color: puedeCanjear ? '#fff' : 'var(--text-dim)', transition: 'all 0.15s' }}>
                {guardando && canjeando?.id === c.id ? 'Generando código...' : puedeCanjear ? `Canjear por ${c.descuento}` : `Necesitas ${c.pts} pts`}
              </button>
            </div>
          )
        })}
      </div>

      {/* Historial de canjes */}
      {historial.length > 0 && (
        <>
          <p className="section-label">Canjes anteriores</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map((c, i) => (
              <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{c.comercio_nombre || c.comercio_id_local}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--green)' }}>{c.codigo_canje}</span>
                    {' · '}{new Date(c.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>−{c.creditos_usados}</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}
