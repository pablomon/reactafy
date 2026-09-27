import { getStore } from "@/services/storeService";
import { serializeJsonLd, siteJsonLd } from "@/utils/jsonLd";

export default async function Home() {
    const store = await getStore();

    return (
        <main>
            {/* Datos estructurados de la empresa y el sitio (Google). */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd(store)) }}
            />

            <h1>Reactafy</h1>
        </main>
    );
}
