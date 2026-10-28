// Caché de datos de Next para las respuestas PÚBLICAS de WordPress.
//
// Un único sitio para las dos decisiones que, escritas en cada fetch,
// acabarían divergiendo: cuánto dura el dato y con qué etiqueta se
// invalida.
//
// Cómo funciona:
//   1. Cada respuesta se guarda con una etiqueta y un día de plazo.
//   2. Cuando algo cambia en WordPress, avisa a /api/revalidate con la
//      etiqueta y Next la marca como caducada.
//   3. El día es solo la red de seguridad por si un aviso se pierde.
//
// Nunca se cachea nada que dependa de quién mira: precios con sesión,
// carrito, zona de usuario, pedidos.

const DAY = 60 * 60 * 24;

// Lista cerrada de etiquetas. Las etiquetas de Next son cadenas y
// distinguen mayúsculas: un "Catalogo" mal escrito no da ningún error,
// simplemente no invalida nada. Con este objeto el compilador rechaza
// cualquier etiqueta que no esté aquí.
//
// El objeto y el tipo se llaman igual a propósito: TypeScript guarda los
// valores y los tipos en espacios de nombres distintos, así que
// `CacheTag.Catalogo` es el valor y `CacheTag` a secas es el tipo
// "catalogo" | "tienda".
export const CacheTag = {
    Catalogo: "catalogo",
    Tienda: "tienda",
    // Precios de invitado. Aparte del catálogo a propósito: una regla de
    // descuento de ADP cambia precios sin tocar ningún producto, y
    // viceversa. Con etiquetas separadas se puede tirar una sin la otra.
    Precios: "precios",
    // Banners de la home. Aparte porque los edita otra gente y por otros motivos.
    Banners: "banners",
} as const;

export type CacheTag = (typeof CacheTag)[keyof typeof CacheTag];

// Opciones para fetch:  fetch(url, cached(CacheTag.Catalogo))
export function cached(tag: CacheTag): RequestInit {
    return { next: { revalidate: DAY, tags: [tag] } };
}
