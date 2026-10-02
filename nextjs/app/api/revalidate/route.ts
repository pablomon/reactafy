import { revalidateTag } from "next/cache";

import { siteConfig } from "@/config/site";
import { CACHE_TAGS, type CacheTag } from "@/services/wpCache";

// WordPress avisa aquí cuando cambia algo:
//   POST /api/revalidate/   X-Reactafy-Secret: …   { "tags": ["catalogo"] }
// Se tiran de la caché las respuestas con esas etiquetas. La siguiente
// visita las vuelve a pedir a WordPress.
//
// Solo con el secreto compartido (WP_SECRET, el mismo del registro):
// si no, cualquiera podría vaciar la caché sin parar.
export async function POST(request: Request) {
    const secret = siteConfig.WORDPRESS_SECRET;

    if (!secret || request.headers.get("x-reactafy-secret") !== secret) {
        return Response.json({ message: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const asked: unknown[] = Array.isArray(body?.tags) ? body.tags : [];

    // Solo etiquetas que existen
    const tags = asked.filter((tag): tag is CacheTag =>
        CACHE_TAGS.includes(tag as CacheTag)
    );

    for (const tag of tags) {
        // expire: 0 → la siguiente visita espera al dato nuevo, en vez de
        // ver una vez el antiguo mientras se actualiza por detrás
        revalidateTag(tag, { expire: 0 });
    }

    return Response.json({ revalidated: tags });
}
