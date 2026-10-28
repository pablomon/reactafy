// Una imagen de banner (GET /reactafy/v1/banners)
export type BannerImage = {
    url: string;
    // null si WordPress solo conoce la dirección de la imagen y no su tamaño
    width: number | null;
    height: number | null;
    alt: string;
};

export type Banner = {
    id: number;
    // Título del banner en WordPress: se usa de texto alternativo
    title: string;
    desktop: BannerImage;
    // null si el banner no tiene imagen propia para móvil
    mobile: BannerImage | null;
    // null si el banner no lleva enlace
    link: string | null;
};
