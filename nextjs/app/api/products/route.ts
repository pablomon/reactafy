import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { cached, CacheTag } from "@/services/wpCache";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function GET(request: NextRequest) {
    // Reenvía a WordPress todo lo que llegue (page, category, brand,
    // envase…): los filtros nuevos funcionan sin tocar este fichero.
    const query = new URLSearchParams(request.nextUrl.searchParams);

    if (!query.has("page")) {
        query.set("page", "1");
    }

    if (!query.has("perPage")) {
        query.set("perPage", siteConfig.PRODUCTS_PER_PAGE.toString());
    }

    // Mismas opciones que getProducts(): es la misma URL pedida desde
    // otro sitio. Si solo se cacheara una, el catálogo se comportaría de
    // dos formas según cómo hubiera llegado el visitante.
    const response = await fetch(
        `${API_URL}/products?${query}`,
        cached(CacheTag.Catalogo)
    );

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: response.status }
        );
    }

    return NextResponse.json(await response.json());
}
