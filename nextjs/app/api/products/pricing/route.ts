import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {siteConfig} from "@/config/site";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function GET(request: NextRequest) {
    const ids = request.nextUrl.searchParams.get("ids");

    if (!ids) {
        return NextResponse.json(
            { error: "Missing ids" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();

    const authToken = cookieStore.get("authToken")?.value;

    const response = await fetch(
        `${API_URL}/products/pricing?ids=${ids}`,
        {
            headers: authToken
                ? {
                    Authorization: `Bearer ${authToken}`,
                }
                : {},
            cache: "no-store",
        }
    );

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch prices" },
            { status: response.status }
        );
    }

    const data = await response.json();

    return NextResponse.json(data, {
        headers: {
            "Cache-Control": "private, no-store",
        },
    });
}