import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete("authToken");
    cookieStore.delete("cartToken");

    return Response.json({
        success: true,
    });
}