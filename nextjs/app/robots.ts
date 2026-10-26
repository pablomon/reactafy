import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// robots.txt. Pide a los buscadores que NO rastreen ningún despliegue
// que no sea el de producción: aguafy.space sirve la misma tienda y
// competiría con aguafy.com por los mismos resultados.
//
// Esto evita el rastreo; el noindex de los metadatos (app/layout.tsx)
// evita la indexación. Hacen falta los dos: una página ya conocida por
// Google puede seguir apareciendo aunque se prohíba rastrearla.
export default function robots(): MetadataRoute.Robots {
    if (!siteConfig.INDEXABLE) {
        return {
            rules: {
                userAgent: "*",
                disallow: "/",
            },
        };
    }

    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
    };
}
