export const siteConfig = {
    PRODUCTS_PER_PAGE: 15,
    // Pedidos por página en la zona de usuario (el plugin admite hasta 50)
    ORDERS_PER_PAGE: 10,
    WORDPRESS_URL: process.env.NEXT_PUBLIC_WP_URL,
    WORDPRESS_SECRET: process.env.WP_SECRET,

    // Dominio público de la tienda (canonical, enlaces absolutos…).
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

    SITE_NAME: "Aguafy",

    // Modo demo para enseñar el trabajo al cliente en aguafy.space
    // (NEXT_PUBLIC_DEMO_MODE=demo): solo tienda, carrito sin pago y
    // cuenta; el resto redirige a /tienda/ (ver proxy.ts).
    // NEXT_PUBLIC_: el botón de pago también lo necesita en el navegador.
    // Se fija al hacer el build: cambiarlo requiere volver a desplegar.
    DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "demo",

    // Logo de la tienda (header, datos estructurados…).
    LOGO_URL: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/03/logo_aguafy_h.webp`,

    // Perfiles en redes sociales (datos estructurados y, más adelante, footer).
    SOCIAL: {
        FACEBOOK: "https://www.facebook.com/aguafy/",
        INSTAGRAM: "https://www.instagram.com/aguafy_/",
    },
};
