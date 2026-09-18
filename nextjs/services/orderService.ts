import type { Order } from "@/types/order";

import { WORDPRESS_URL } from "@/services/wordpress";

const API_URL =
    `${WORDPRESS_URL}/wp-json/reactafy/v1`;

export async function getOrder(
    id: string,
    authToken: string
): Promise<Order> {

    const response = await fetch(
        `${API_URL}/orders/${id}`,
        {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch order"
        );
    }

    return response.json();
}