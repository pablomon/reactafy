// Solo el dominio de producción debe aparecer en Google. Cualquier otro
// (aguafy.space, localhost) sirve la misma tienda y competiría con
// aguafy.com por los mismos resultados, así que va con noindex.
const PRODUCTION_URL = "https://aguafy.com";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
    PRODUCTS_PER_PAGE: 15,
    // Pedidos por página en la zona de usuario (el plugin admite hasta 50)
    ORDERS_PER_PAGE: 10,
    WORDPRESS_URL: process.env.NEXT_PUBLIC_WP_URL,
    WORDPRESS_SECRET: process.env.WP_SECRET,

    // Dominio público de la tienda (canonical, enlaces absolutos…).
    SITE_URL,

    // ¿Puede indexarse este despliegue? Lo usan app/robots.ts y los
    // metadatos del layout.
    INDEXABLE: SITE_URL === PRODUCTION_URL,

    SITE_NAME: "Aguafy",


    // Logo de la tienda (header, datos estructurados…).
    LOGO_URL: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/03/logo_aguafy_h.webp`,

    // Perfiles en redes sociales (datos estructurados y, más adelante, footer).
    SOCIAL: {
        FACEBOOK: "https://www.facebook.com/aguafy/",
        INSTAGRAM: "https://www.instagram.com/aguafy_/",
    },
};
