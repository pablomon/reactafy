// URL de WordPress, compartida por servidor y cliente.
//
// Lleva el prefijo NEXT_PUBLIC_ porque CheckoutButton la usa en el
// navegador, y Next solo expone al cliente esas variables. No es un
// secreto: es la dirección pública del sitio.
//
// Next la incrusta al compilar, así que cambiarla exige un build nuevo.
const url = process.env.NEXT_PUBLIC_WORDPRESS_URL;

// Sin valor por defecto a propósito: si falta la variable en
// producción, es mejor fallar en el acto que acabar hablando con
// staging sin que nadie se entere.
if (!url) {
    throw new Error(
        "Falta NEXT_PUBLIC_WORDPRESS_URL (ver .env.example)"
    );
}

export const WORDPRESS_URL = url.replace(/\/+$/, "");
