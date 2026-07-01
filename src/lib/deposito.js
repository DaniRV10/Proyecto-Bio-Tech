// =============================================
// PUNTO DE PARTIDA DEL CAMIÓN (Base / Depósito)
// Cambia estas coordenadas según la ubicación real de la base
// =============================================

export const DEPOSITO = {
  lat: -29.958,   // <-- Cambia aquí la latitud
  lng: -71.343,   // <-- Cambia aquí la longitud
  nombre: 'Base de operaciones',
}

// Array para Leaflet (que usa [lat, lng])
export const DEPOSITO_LATLNG = [DEPOSITO.lat, DEPOSITO.lng]
