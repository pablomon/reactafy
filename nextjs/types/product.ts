export type ProductAttribute = {
    slug: string;
    name: string;
    value: string | number;
};

export type ProductCategory = {
    id: number;
    slug: string;
    name: string;
    parentId: number;
};

export type ProductTag = {
    id: number;
    slug: string;
    name: string;
    parentId: number;
};

export type ProductBrand = {
    id: number;
    slug: string;
    name: string;
};

export type ProductGroup = {
    id: number;
    // Slug del grupo en la URL: /producto/{slug}/…
    slug: string;
    name: string;
    products: number[];
};

export type ProductEditorial = {
    isFeatured: boolean;
    isNew: boolean;
    isLowStock: boolean;
};

export type ProductStock = {
    status: string;
};

// Metadatos SEO de Yoast (del grupo). Solo llegan en /products/resolve.
export type ProductSeo = {
    title: string;
    description: string;
    ogImage: string | null;
    noindex: boolean;
};

export type Product = {
    id: number;
    // Identifica al producto dentro de su grupo: "24-lata-500-ml".
    // null si en Woo le falta algún atributo (no tiene URL propia).
    slug: string | null;
    sku: string;
    title: string;
    image: string;
    isActive: boolean;
    group: ProductGroup;
    categories: ProductCategory[];
    brand: ProductBrand;
    tags: ProductTag[];
    editorial: ProductEditorial;
    attributes: ProductAttribute[];
    stock: ProductStock;
    seo?: ProductSeo;
};

export type ProductsPagination = {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
};

export type ProductsResponse = {
    products: Product[];
    pagination: ProductsPagination;
};
