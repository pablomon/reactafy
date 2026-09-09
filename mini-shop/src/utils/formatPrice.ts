/**
 * Aguafy muestra el importe con el código de divisa delante y sin
 * decimales cuando la cifra es redonda: «MXN 85», «MXN 380.50».
 *
 * Se cachean las dos instancias de Intl.NumberFormat porque crearlas
 * es caro y aquí se llaman una vez por tarjeta.
 */
const CON_DECIMALES = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const SIN_DECIMALES = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  currencyDisplay: 'code',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return Number.isInteger(amount)
    ? SIN_DECIMALES.format(amount)
    : CON_DECIMALES.format(amount)
}
