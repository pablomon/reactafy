// Metadatos SEO de Yoast (de un post o de un término), tal como los
// devuelve la API de Reactafy (reactafy_seo_from_yoast en Aguafy Core).
export type Seo = {
    title: string;
    description: string;
    ogImage: string | null;
    noindex: boolean;
};
