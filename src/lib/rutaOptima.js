import { DEPOSITO } from './deposito.js'

const OSRM_URL = 'https://router.project-osrm.org'

function distanciaHaversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function nearestNeighborFallback(puntos, origen) {
  const visitados = new Set()
  const ruta = [origen]
  let actual = origen
  while (visitados.size < puntos.length) {
    let minDist = Infinity, siguiente = null, idx = -1
    puntos.forEach((p, i) => {
      if (!visitados.has(i)) {
        const d = distanciaHaversine(actual, p)
        if (d < minDist) { minDist = d; siguiente = p; idx = i }
      }
    })
    if (siguiente) { visitados.add(idx); ruta.push(siguiente); actual = siguiente }
  }
  return ruta
}

export async function calcularRutaOptima(puntos, origen = DEPOSITO) {
  if (!puntos || puntos.length === 0) return { ruta: [], geometria: [], distanciaKm: 0, tiempoMin: 0, real: false }

  const todos = [origen, ...puntos]
  const coordsStr = todos.map(p => `${p.lng},${p.lat}`).join(';')

  try {
    // roundtrip=true para que vuelva al depósito al final
    const tripRes = await fetch(`${OSRM_URL}/trip/v1/driving/${coordsStr}?source=first&roundtrip=true&overview=false`)
    const tripData = await tripRes.json()
    if (tripData.code !== 'Ok') throw new Error('OSRM trip error')

    const ordenado = [...todos]
      .map((p, i) => ({ ...p, _orden: tripData.waypoints[i].waypoint_index }))
      .sort((a, b) => a._orden - b._orden)

    // Añade el depósito al final para cerrar el ciclo visualmente
    const conRetorno = [...ordenado, { ...origen, _esRetorno: true }]
    const orderedCoordsStr = conRetorno.map(p => `${p.lng},${p.lat}`).join(';')
    const routeRes = await fetch(`${OSRM_URL}/route/v1/driving/${orderedCoordsStr}?overview=full&geometries=geojson`)
    const routeData = await routeRes.json()
    if (routeData.code !== 'Ok') throw new Error('OSRM route error')

    const route = routeData.routes[0]
    const geometria = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

    return {
      ruta: ordenado,
      geometria,
      distanciaKm: Math.round((route.distance / 1000) * 10) / 10,
      tiempoMin: Math.round(route.duration / 60),
      real: true,
    }
  } catch (err) {
    console.warn('OSRM no disponible, usando fallback:', err)
    const ruta = nearestNeighborFallback(puntos, origen)
    // Cierra el ciclo en fallback también
    const rutaCerrada = [...ruta, origen]
    let distKm = 0
    for (let i = 0; i < rutaCerrada.length - 1; i++) distKm += distanciaHaversine(rutaCerrada[i], rutaCerrada[i + 1])
    return {
      ruta,
      geometria: rutaCerrada.map(p => [p.lat, p.lng]),
      distanciaKm: Math.round(distKm * 10) / 10,
      tiempoMin: Math.round((distKm / 25) * 60 + puntos.length * 3),
      real: false,
    }
  }
}

export { distanciaHaversine as distancia }
