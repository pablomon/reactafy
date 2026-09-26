import { serializeJsonLd, siteJsonLd } from "@/utils/jsonLd";

export default function Home() {
    return (
        <main>
            {/* Datos estructurados de la empresa y el sitio (Google). */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd()) }}
            />

            <h1>Reactafy</h1>
        </main>
    );
}
