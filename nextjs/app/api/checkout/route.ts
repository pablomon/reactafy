import { cookies } from "next/headers";

import { WORDPRESS_URL } from "@/services/wordpress";

export async function POST() {

    const cookieStore =
        await cookies();

    const authToken =
        cookieStore.get("authToken")?.value;

    const cartToken =
        cookieStore.get("cartToken")?.value;

        console.log({
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.length,
    hasCartToken: !!cartToken,
});

    // Usuario autenticado
    if (authToken) {

        const response =
            await fetch(
                `${WORDPRESS_URL}/wp-json/reactafy/v1/checkout-handoff`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${authToken}`,
                    },
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            return Response.json(
                data,
                {
                    status:
                        response.status,
                }
            );
        }

        return Response.json({
            code: data.code,
        });
    }

    // Usuario invitado
    if (cartToken) {

        const checkoutUrl =
            `${WORDPRESS_URL}/finalizar-compra/?session=${encodeURIComponent(cartToken)}`;

        return Response.json({
            checkoutUrl,
        });
    }

    // No hay usuario ni carrito
    return Response.json(
        {
            message:
                "No checkout session available",
        },
        {
            status: 400,
        }
    );
}