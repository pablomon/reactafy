export const siteConfig = {
    PRODUCTS_PER_PAGE: 20,
    WORDPRESS_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL,
    WORDPRESS_SECRET: process.env.WORDPRESS_SECRET,

    // Mismos valores que la página de ajustes de WordPress (snippet 40:
    // tienda_telefono, tienda_whatsapp, tienda_minimo_mxn). Si cambian allí,
    // hay que cambiarlos aquí. Pendiente: leerlos de un endpoint.
    STORE: {
        PHONE: "5555379880",
        WHATSAPP: "5542406506",
        MIN_ORDER_MXN: 1200,
    },
};
