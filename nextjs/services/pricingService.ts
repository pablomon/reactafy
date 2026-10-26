import { cookies } from "next/headers";
import {ProductPrice} from "@/types/productPrice";
import {siteConfig} from "@/config/site";
import { cached, CacheTag } from "@/services/wpCache";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Solo para el servidor. Lee la sesión de la cookie:
// - Con sesión: precios del usuario (según su rol en ADP). Nunca se
//   cachean.
// - Sin sesión: precio de invitado (guest=1), igual para todos. Se
//   guarda en la caché de Next (etiqueta "precios") y además LiteSpeed
//   la cachea en WordPress. El endpoint ignora cualquier token con
//   guest=1.
export async function getProductPrices(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const ids = productIds.join(",");

    const authToken =
        (await cookies()).get("authToken")?.value;

    const start = performance.now();

    // guest va SIEMPRE el primero y siempre explícito: el panel de
    // LiteSpeed cachea "?guest=1" y excluye "?guest=0" comparando
    // por el principio de la URL.
    const url = authToken
        ? `${API_URL}/products/pricing?guest=0&ids=${ids}`
        : `${API_URL}/products/pricing?guest=1&ids=${ids}`;

    // El token y la caché se deciden JUNTOS, en una sola expresión: así
    // no existe forma de mandar el token de un usuario en una petición
    // que se guarda, que serviría su precio a otros visitantes.
    const request: RequestInit = authToken
        ? {
            headers: { Authorization: `Bearer ${authToken}` },
            cache: "no-store",
        }
        : cached(CacheTag.Precios);

    const response = await fetch(url, request);

    const fetchTime = performance.now() - start;

    if (!response.ok) {
        throw new Error("Failed to fetch product prices");
    }

    const data = await response.json();

    const totalTime = performance.now() - start;

    console.log("GET PRODUCT PRICES", {
        ids: productIds.length,
        fetch: Math.round(fetchTime),
        json: Math.round(totalTime - fetchTime),
        total: Math.round(totalTime),
    });

    return data;
}

// Precio de INVITADO siempre, haya sesión o no. Para datos públicos,
// como el JSON-LD de la ficha: Google rastrea sin sesión y no deben
// salir en el código fuente los precios de un usuario concreto.
// Misma URL y mismas opciones que getProductPrices sin sesión, así que
// comparten entrada en la caché.
export async function getGuestProductPrices(
    productIds: number[]
): Promise<Record<number, ProductPrice>> {
    if (productIds.length === 0) {
        return {};
    }

    const response = await fetch(
        `${API_URL}/products/pricing?guest=1&ids=${productIds.join(",")}`,
        cached(CacheTag.Precios)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch guest product prices");
    }

    return response.json();
}

