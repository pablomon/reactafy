import { siteConfig } from "@/config/site";
import type { Store } from "@/types/store";
import { cached } from "@/services/wpCache";

const API_URL = `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Ajustes de la tienda (teléfono, WhatsApp, pedido mínimo…).
//
// Se puede llamar desde cualquier Server Component (layout, header,
// pie, ficha): Next memoiza los fetch idénticos dentro de una misma
// petición, así que a WordPress solo le llega uno por página.
//
// Además se guarda en la caché de Next (etiqueta "tienda"): WordPress
// avisa cuando cambian los ajustes (ver services/wpCache.ts).
export async function getStore(): Promise<Store> {
    const response = await fetch(`${API_URL}/store`, cached("tienda"));

    if (!response.ok) {
        throw new Error("Failed to fetch store settings");
    }

    return response.json();
}
