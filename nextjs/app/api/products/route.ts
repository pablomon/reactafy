import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function GET(request: NextRequest) {
    const page =
        request.nextUrl.searchParams.get("page") ?? "1";

    const perPage =
        request.nextUrl.searchParams.get("perPage") ??
        siteConfig.PRODUCTS_PER_PAGE.toString();

    const query = new URLSearchParams({ page, perPage });

    // Filtro opcional por marca ("Cargar más" en /brand/{slug}/).
    const brand = request.nextUrl.searchParams.get("brand");

    if (brand) {
        query.set("brand", brand);
    }

    const response = await fetch(`${API_URL}/products?${query}`);

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: response.status }
        );
    }

    const data = await response.json();

    return NextResponse.json(data);
}