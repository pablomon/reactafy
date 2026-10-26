import { siteConfig } from "@/config/site";
import type { Store } from "@/types/store";

const API_URL = `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Ajustes de la tienda (teléfono, WhatsApp, pedido mínimo…).
//
// Se puede llamar desde cualquier Server Component (layout, header,
// pie, ficha): Next memoiza los fetch idénticos dentro de una misma
// petición, así que a WordPress solo le llega uno por página.
//
// Además se guarda una hora en la caché de datos de Next: son ajustes
// que casi nunca cambian, y así no se pregunta a WordPress en cada
// visita. Si cambias el teléfono en WP, tarda como mucho una hora en
// verse (o al volver a desplegar).
export async function getStore(): Promise<Store> {
    const response = await fetch(`${API_URL}/store`, {
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch store settings");
    }

    return response.json();
}
