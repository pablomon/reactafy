import { siteConfig } from "@/config/site";

// Datos estructurados (schema.org, formato JSON-LD) comunes a la tienda.

const SITE_URL = new URL("/", siteConfig.SITE_URL).toString();

// @id: identificadores únicos (URLs con #, no hace falta que existan
// como página) para enlazar entidades sin repetirlas.
const ORGANIZATION_ID = `${SITE_URL}#organization`;
const WEBSITE_ID = `${SITE_URL}#website`;

// La empresa y el sitio web. Va en la home.
export function siteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": ORGANIZATION_ID,
                name: siteConfig.SITE_NAME,
                url: SITE_URL,
                logo: siteConfig.LOGO_URL,
                sameAs: Object.values(siteConfig.SOCIAL),
                contactPoint: {
                    "@type": "ContactPoint",
                    // Formato internacional: +52 y los 10 dígitos.
                    telephone: `+52${siteConfig.STORE.PHONE}`,
                    contactType: "customer service",
                    areaServed: "MX",
                    availableLanguage: "es",
                },
            },
            {
                "@type": "WebSite",
                "@id": WEBSITE_ID,
                url: SITE_URL,
                name: siteConfig.SITE_NAME,
                inLanguage: "es-MX",
                publisher: { "@id": ORGANIZATION_ID },
            },
        ],
    };
}

// El JSON va dentro de <script>: si algún texto contuviera "</script>",
// cerraría la etiqueta. Se escapa "<" (recomendación de la guía JSON-LD
// de Next).
export function serializeJsonLd(data: object): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
