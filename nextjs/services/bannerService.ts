import { siteConfig } from "@/config/site";
import { cached, CacheTag } from "@/services/wpCache";
import type { Banner } from "@/types/banner";

const API_URL =
    `${siteConfig.WORDPRESS_URL}/wp-json/reactafy/v1`;

// Los banners de la home, en el orden en que los ordena WordPress.
export async function getBanners(): Promise<Banner[]> {
    const response = await fetch(
        `${API_URL}/banners`,
        cached(CacheTag.Banners)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch banners");
    }

    return response.json();
}
