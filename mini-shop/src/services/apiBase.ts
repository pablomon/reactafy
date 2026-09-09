/**
 * Base de la API.
 *
 * En desarrollo vale `/api`, que el proxy de Vite reescribe hacia
 * WordPress (ver vite.config.ts). Ese proxy NO existe una vez
 * desplegado: en producción hay que apuntar al host real, lo que se
 * hace con VITE_API_BASE en el fichero .env.production.
 *
 * La API de Aguafy devuelve `access-control-allow-origin` reflejando
 * el origen que la llama, así que el dominio cruzado funciona sin
 * configuración extra.
 */
export const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? '/api'
