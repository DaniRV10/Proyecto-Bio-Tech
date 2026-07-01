import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabase'
import { calcularRutaOptima } from '../lib/rutaOptima'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DEPOSITO, DEPOSITO_LATLNG } from '../lib/deposito'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const iconVerde = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#4ade80;border:2px solid #fff;box-shadow:0 0 6px rgba(74,222,128,0.6)"></div>', iconSize: [14,14], iconAnchor: [7,7] })
const iconAmbar = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#fbbf24;border:2px solid #fff"></div>', iconSize: [14,14], iconAnchor: [7,7] })
const iconBase = L.divIcon({ className: '', html: '<div style="width:18px;height:18px;border-radius:50%;background:#1a8c4e;border:3px solid #4ade80;box-shadow:0 0 10px rgba(74,222,128,0.8)"></div>', iconSize: [18,18], iconAnchor: [9,9] })
const iconAcopio = L.divIcon({ className: '', html: '<div style="width:22px;height:22px;border-radius:6px;background:#0f3d22;border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 6px rgba(96,165,250,0.5)">🗑️</div>', iconSize: [22,22], iconAnchor: [11,11] })

const CENTRO = [-29.958, -71.343]

export default function MapaPage() {
  const { profile } = useAuth()
  const esConductor = profile?.rol === 'conductor'
  const [puntos, setPuntos] = useState([])
  const [nodos, setNodos] = useState([])
  const [ruta, setRuta] = useState(null)
  const [geometria, setGeometria] = useState([])
  const [mostrarRuta, setMostrarRuta] = useState(false)
  const [stats, setStats] = useState(null)
  const [calculando, setCalculando] = useState(false)
  const location = useLocation()

  useEffect(() => {
    fetchPuntos(); fetchNodos()
    if (esConductor && location.search.includes('ruta=1')) calcularRuta()
  }, [])

  async function fetchPuntos() {
    const { data } = await supabase.from('puntos').select('*').in('estado', ['pendiente','confirmado'])
    setPuntos(data || [])
  }
  async function fetchNodos() {
    const { data } = await supabase.from('nodos_acopio').select('*').eq('activo', true)
    setNodos(data || [])
  }

  async function calcularRuta() {
    setCalculando(true)
    const resultado = await calcularRutaOptima(
      puntos.map(p => ({ ...p, lat: parseFloat(p.lat), lng: parseFloat(p.lng) }))
    )
    setRuta(resultado.ruta); setGeometria(resultado.geometria); setStats(resultado); setMostrarRuta(true); setCalculando(false)
  }

  const kgTotal = puntos.reduce((s, p) => s + parseFloat(p.kg_estimado || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', paddingBottom: 0 }}>
      <div style={{ padding: '12px 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', borderBottom: '0.5px solid var(--border)', zIndex: 10 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Puntos activos</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{puntos.length} puntos · {kgTotal.toFixed(1)} kg total</p>
        </div>
        {esConductor && (
          <button onClick={mostrarRuta && ruta ? () => { setMostrarRuta(false); setRuta(null); setStats(null); setGeometria([]) } : calcularRuta}
            disabled={calculando} className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
            {calculando ? 'Calculando...' : mostrarRuta && ruta ? 'Ocultar ruta' : '🗺️ Ruta óptima'}
          </button>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={DEPOSITO_LATLNG} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          <Marker position={DEPOSITO_LATLNG} icon={iconBase}><Popup><b>{DEPOSITO.nombre}</b><br />Punto de partida del camión</Popup></Marker>
          {nodos.map(n => (
            <Marker key={n.id} position={[parseFloat(n.lat), parseFloat(n.lng)]} icon={iconAcopio}>
              <Popup><b>{n.nombre}</b><br />Sector {n.sector}<br />Capacidad: {n.capacidad_kg} kg</Popup>
            </Marker>
          ))}
          {puntos.map(p => {
            const orden = mostrarRuta && ruta ? ruta.findIndex(r => r.id === p.id) : -1
            return (
              <Marker key={p.id} position={[parseFloat(p.lat), parseFloat(p.lng)]}
                icon={orden > 0 ? L.divIcon({ className: '', html: `<div style="width:22px;height:22px;border-radius:50%;background:#1a5c34;border:2px solid #4ade80;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff">${orden}</div>`, iconSize: [22,22], iconAnchor: [11,11] }) : (p.estado === 'confirmado' ? iconVerde : iconAmbar)}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <b>{p.direccion || 'Punto de recolección'}</b><br />
                    {orden > 0 && <><span>🚛 Parada #{orden}</span><br /></>}
                    <span>📦 {p.kg_estimado} kg est.</span><br />
                    <span>● {p.estado}</span>
                  </div>
                </Popup>
              </Marker>
            )
          })}
          {mostrarRuta && geometria.length > 1 && <Polyline positions={geometria} color="#4ade80" weight={4} opacity={0.85} />}
        </MapContainer>

        <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(10,26,18,0.92)', borderRadius: 10, padding: '8px 12px', border: '0.5px solid var(--border)', zIndex: 500, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />Listo para recoger</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />Pendiente confirm.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 10 }}>🗑️</span>Nodo de acopio (Sindempart)</div>
        </div>
      </div>

      {mostrarRuta && stats && (
        <div style={{ background: 'var(--bg)', borderTop: '0.5px solid var(--border)', padding: '14px 16px', zIndex: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 10 }}>
            Ruta calculada {stats.real ? '🛣️ por calles reales' : '⚠️ línea recta (sin OSRM)'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[{ v: stats.distanciaKm, l: 'km totales' }, { v: `~${stats.tiempoMin}`, l: 'minutos' }, { v: kgTotal.toFixed(1), l: 'kg a recoger' }].map(({ v, l }) => (
              <div key={l} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '9px', textAlign: 'center' }}>
                <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--green)' }}>{v}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
