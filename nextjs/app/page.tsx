import BannerCarousel from "@/components/BannerCarousel";
import { getBanners } from "@/services/bannerService";
import { getStore } from "@/services/storeService";
import { serializeJsonLd, siteJsonLd } from "@/utils/jsonLd";

export default async function Home() {
    const [store, banners] = await Promise.all([
        getStore(),
        // Si WordPress falla, la home sigue funcionando, solo que sin banners
        getBanners().catch(() => []),
    ]);

    return (
        <main>
            {/* Datos estructurados de la empresa y el sitio (Google). */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd(store)) }}
            />

            <BannerCarousel banners={banners} />

            <h1>Reactafy</h1>
        </main>
    );
}
