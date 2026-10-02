// Caché de Next para las respuestas públicas de WordPress.
//
// Cada respuesta se guarda con una etiqueta y dura hasta una semana.
// Cuando algo cambia en WordPress (un producto, un precio, los ajustes
// de la tienda…), WordPress avisa a /api/revalidate con la etiqueta y
// Next la tira: la siguiente visita vuelve a preguntar a WordPress.
// La semana es solo la red de seguridad por si algún aviso se pierde.
//
// Nunca se cachea nada que dependa de quién mira: precios con sesión,
// carrito, zona de usuario, pedidos.

const WEEK = 60 * 60 * 24 * 7;

// Etiquetas que WordPress puede invalidar
export const CACHE_TAGS = ["catalogo", "tienda"] as const;
export type CacheTag = (typeof CACHE_TAGS)[number];

// Opciones para fetch: fetch(url, cached("catalogo"))
export function cached(tag: CacheTag): RequestInit {
    return { next: { revalidate: WEEK, tags: [tag] } };
}
