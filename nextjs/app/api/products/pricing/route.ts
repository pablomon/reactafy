import { NextRequest, NextResponse } from "next/server";
import { getProductPrices } from "@/services/pricingService";

// "Cargar más" pide los precios por aquí. La URL de WordPress,
// el token y el guest=1 los resuelve getProductPrices, igual
// que en el primer render: un único sitio para esa lógica.
export async function GET(request: NextRequest) {
    const ids = (request.nextUrl.searchParams.get("ids") ?? "")
        .split(",")
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);

    if (ids.length === 0) {
        return NextResponse.json(
            { error: "Missing ids" },
            { status: 400 }
        );
    }

    try {
        const prices = await getProductPrices(ids);

        return NextResponse.json(prices, {
            headers: {
                "Cache-Control": "private, no-store",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: 502 }
        );
    }
}
