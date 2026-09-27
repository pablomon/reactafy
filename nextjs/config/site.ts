export const siteConfig = {
    PRODUCTS_PER_PAGE: 15,
    WORDPRESS_URL: process.env.NEXT_PUBLIC_WP_URL,
    WORDPRESS_SECRET: process.env.WP_SECRET,

    // Dominio público de la tienda (canonical, enlaces absolutos…).
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

    SITE_NAME: "Aguafy",

    // Logo de la tienda (header, datos estructurados…).
    LOGO_URL: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/03/logo_aguafy_h.webp`,

    // Perfiles en redes sociales (datos estructurados y, más adelante, footer).
    SOCIAL: {
        FACEBOOK: "https://www.facebook.com/aguafy/",
        INSTAGRAM: "https://www.instagram.com/aguafy_/",
    },
};
