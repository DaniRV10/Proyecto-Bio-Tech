// Cálculo de huella de carbono mitigada
// Fuente: Huella Chile 2024 — Factores de Emisión
// Factor neto evitado = Línea base vertedero (700.210 kg CO₂e/t)
//                     − Factor compostaje     (  8.912 kg CO₂e/t)
//                     = 691.298 kg CO₂e/t
//                     = 0.6913 kg CO₂e/kg residuo orgánico

const FACTOR_CO2_POR_KG = 0.6913 // kg CO₂eq evitado por kg de residuo orgánico

/**
 * Convierte kg de residuo orgánico a CO₂eq evitado, formateado con unidad
 * @param {number} kg
 * @returns {string}
 */
export function kgACO2(kg) {
  const co2 = kg * FACTOR_CO2_POR_KG
  if (co2 < 1) return `${(co2 * 1000).toFixed(1)} g CO₂e`
  if (co2 < 1000) return `${co2.toFixed(3)} kg CO₂e`
  return `${(co2 / 1000).toFixed(4)} ton CO₂e`
}

/**
 * Retorna el valor numérico en kg CO₂eq evitados
 */
export function calcularCO2(kg) {
  return kg * FACTOR_CO2_POR_KG
}

export { FACTOR_CO2_POR_KG }
