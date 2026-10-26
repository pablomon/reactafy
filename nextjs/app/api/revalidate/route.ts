import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

import { siteConfig } from "@/config/site";
import { CacheTag } from "@/services/wpCache";

const NO_STORE = { "Cache-Control": "private, no-store" };

// Lista de etiquetas válidas, como texto: lo que llega por la red es
// texto, no CacheTag.
const VALID_TAGS: string[] = Object.values(CacheTag);

// SHA-256 de ambos lados: siempre 32 bytes, que es lo que exige
// timingSafeEqual (con longitudes distintas lanza una excepción).
function sameSecret(given: string, expected: string): boolean {
    const a = createHash("sha256").update(given).digest();
    const b = createHash("sha256").update(expected).digest();

    return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
    const expected = siteConfig.WORDPRESS_SECRET;
    const given = request.headers.get("x-reactafy-secret") ?? "";

    if (!expected || !sameSecret(given, expected)) {
        return Response.json(
            { message: "No autorizado." },
            { status: 401, headers: NO_STORE }
        );
    }

    const body = await request.json().catch(() => null);
    const asked: unknown = body?.tags;

    if (!Array.isArray(asked) || asked.length === 0) {
        return Response.json(
            { message: "Falta la lista \"tags\"." },
            { status: 400, headers: NO_STORE }
        );
    }

    const invalid = asked.filter((tag) => !VALID_TAGS.includes(tag));

    if (invalid.length > 0) {
        return Response.json(
            { message: "Etiquetas desconocidas.", invalid, valid: VALID_TAGS },
            { status: 400, headers: NO_STORE }
        );
    }

    const tags = [...new Set(asked as CacheTag[])];

    for (const tag of tags) {
        revalidateTag(tag, { expire: 0 });
    }

    return Response.json({ revalidated: tags }, { headers: NO_STORE });
}