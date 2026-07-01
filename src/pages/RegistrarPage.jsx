import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconAcopioMini = L.divIcon({ className: '', html: '<div style="width:20px;height:20px;border-radius:6px;background:#0f3d22;border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;font-size:11px;">🗑️</div>', iconSize: [20,20], iconAnchor: [10,10] })
const CENTRO = [-29.958, -71.343]
const KG_OPCIONES = [
  { id: 1, label: '1–2 kg', valor: 1.5, size: 'pequeño' },
  { id: 2, label: '3–5 kg', valor: 4, size: 'mediano' },
  { id: 3, label: '6–10 kg', valor: 8, size: 'grande' },
  { id: 4, label: '+10 kg', valor: 12, size: 'muy grande' },
]

function ClickHandler({ onSelect }) { useMapEvents({ click: (e) => onSelect(e.latlng) }); return null }
function RecenterMap({ pos }) {
  const map = useMapEvents({})
  useEffect(() => { if (pos) map.setView([pos.lat, pos.lng], map.getZoom()) }, [pos.lat, pos.lng])
  return null
}

export default function RegistrarPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [pos, setPos] = useState(null)
  const [kgSel, setKgSel] = useState(null)
  const [direccion, setDireccion] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [nodos, setNodos] = useState([])
  const [nodoSel, setNodoSel] = useState(null)
  const posManual = nodoSel !== null // si hay nodo seleccionado, no dejar que el GPS lo pise

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => {
        // Solo aplica el GPS si el usuario NO ha elegido un nodo manualmente
        setPos(prev => prev ? prev : { lat: p.coords.latitude, lng: p.coords.longitude })
      },
      () => setPos(prev => prev ? prev : { lat: CENTRO[0], lng: CENTRO[1] })
    )
    supabase.from('nodos_acopio').select('*').eq('activo', true).then(({ data }) => setNodos(data || []))
  }, [])

  async function buscarDireccion() {
    if (!direccion.trim()) return
    setBuscando(true); setError('')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion + ', Coquimbo, Chile')}&format=json&limit=1`)
      const data = await res.json()
      if (data?.length > 0) { setPos({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }); setNodoSel(null) }
      else setError('No se encontró esa dirección. Ajusta el pin en el mapa.')
    } catch { setError('No se pudo buscar la dirección.') }
    setBuscando(false)
  }

  function seleccionarNodo(nodo) {
    const lat = parseFloat(nodo.lat)
    const lng = parseFloat(nodo.lng)
    setNodoSel(nodo)
    setPos({ lat, lng })
    setDireccion(`Nodo de acopio: ${nodo.nombre}`)
  }

  async function handleSubmit() {
    if (!pos) return setError('Marca tu ubicación en el mapa')
    if (!kgSel) return setError('Selecciona los kilos estimados')
    setError(''); setLoading(true)
    // Usar coords del nodo si está seleccionado, para garantizar precisión
    const lat = nodoSel ? parseFloat(nodoSel.lat) : pos.lat
    const lng = nodoSel ? parseFloat(nodoSel.lng) : pos.lng
    const { error } = await supabase.from('puntos').insert({ user_id: user.id, lat, lng, direccion: direccion || null, kg_estimado: kgSel.valor, notas: notas || null, estado: 'pendiente', nodo_acopio_id: nodoSel?.id || null })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true); await refreshProfile(); setTimeout(() => navigate('/'), 2000)
  }

  const creditosEst = kgSel ? Math.floor(kgSel.valor * 20) : null

  if (success) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80dvh', gap: 16, padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>🌿</div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--green)' }}>¡Punto registrado!</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Te notificaremos cuando se recoja. Ganarás ~{creditosEst} BioCredits.</p>
    </div>
  )

  return (
    <div className="page" style={{ padding: 0, paddingBottom: '90px' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Añadir punto</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Busca tu dirección, toca el mapa, o elige un punto de acopio</p>
      </div>
      <div style={{ height: 200, position: 'relative' }}>
        {pos ? (
          <MapContainer center={[pos.lat, pos.lng]} zoom={15} style={{ width: '100%', height: '100%' }} zoomControl={false}>
            <RecenterMap pos={pos} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onSelect={p => { setPos({ lat: p.lat, lng: p.lng }); setNodoSel(null) }} />
            <Marker position={[pos.lat, pos.lng]} />
            {nodos.map(n => <Marker key={n.id} position={[parseFloat(n.lat), parseFloat(n.lng)]} icon={iconAcopioMini} eventHandlers={{ click: () => seleccionarNodo(n) }} />)}
          </MapContainer>
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Obteniendo ubicación...</p>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(10,26,18,0.9)', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: 'var(--text-muted)', zIndex: 500 }}>
          {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Sin ubicación'}
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Dirección</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" type="text" placeholder="Ej: Av. Del Mar 442" value={direccion} onChange={e => { setDireccion(e.target.value); setNodoSel(null) }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarDireccion() } }} style={{ flex: 1 }} />
            <button onClick={buscarDireccion} disabled={buscando || !direccion.trim()} className="btn btn-outline" style={{ width: 'auto', padding: '11px 16px', fontSize: 13 }}>{buscando ? '...' : '📍 Buscar'}</button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Al buscar, el pin se moverá automáticamente.</p>
        </div>
        {nodos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="input-label" style={{ marginBottom: 8 }}>O elige un punto de acopio (Sindempart)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {nodos.map(n => (
                <button key={n.id} onClick={() => seleccionarNodo(n)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', border: nodoSel?.id === n.id ? '1.5px solid #60a5fa' : '0.5px solid var(--border)', background: nodoSel?.id === n.id ? 'rgba(96,165,250,0.1)' : 'var(--bg-card)' }}>
                  <span style={{ fontSize: 18 }}>🗑️</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{n.nombre}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sector {n.sector} · cap. {n.capacidad_kg} kg</p>
                  </div>
                  {nodoSel?.id === n.id && <span style={{ color: '#60a5fa', fontSize: 14 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="input-label" style={{ marginBottom: 8 }}>Kilos estimados</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {KG_OPCIONES.map(op => (
            <button key={op.id} onClick={() => setKgSel(op)} style={{ padding: '11px', borderRadius: 10, cursor: 'pointer', border: kgSel?.id === op.id ? '1.5px solid var(--green)' : '0.5px solid var(--border)', background: kgSel?.id === op.id ? 'rgba(74,222,128,0.12)' : 'var(--bg-card)', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: kgSel?.id === op.id ? 'var(--green)' : 'var(--text)' }}>{op.label}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{op.size}</p>
            </button>
          ))}
        </div>
        <div className="input-group" style={{ marginBottom: 16 }}>
          <label className="input-label">Notas (opcional)</label>
          <textarea className="input" placeholder="Ej: Frente a la puerta verde" value={notas} onChange={e => setNotas(e.target.value)} rows={2} style={{ resize: 'none' }} />
        </div>
        {kgSel && (
          <div style={{ background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ganarás aprox.</p>
              <p style={{ fontSize: 26, fontWeight: 600, color: 'var(--green)' }}>~{creditosEst} pts</p>
            </div>
            <span style={{ fontSize: 32 }}>🌿</span>
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !pos}>{loading ? 'Guardando...' : '📍 Confirmar punto'}</button>
      </div>
    </div>
  )
}
