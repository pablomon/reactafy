import type { Seo } from "./seo";

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
    // null si el grupo no tiene marca asignada en Woo
    brand: ProductBrand | null;
    tags: ProductTag[];
    editorial: ProductEditorial;
    attributes: ProductAttribute[];
    stock: ProductStock;
    // SEO de Yoast (del grupo). Solo llega en /products/resolve.
    seo?: Seo;
};

export type ProductsPagination = {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
};

// Una opción de una faceta: { slug: "lata", name: "Lata", count: 38 }
// count 0 = no hay productos con esa opción y los filtros actuales.
export type FacetOption = {
    slug: string;
    name: string;
    count: number;
};

// Una faceta: Marca, Envase, Volumen… (salen de Woo, no hay lista fija)
export type Facet = {
    slug: string;
    name: string;
    options: FacetOption[];
};

// Subcategoría para los chips de navegación, con su número de productos.
export type Subcategory = {
    slug: string;
    name: string;
    count: number;
};

export type ProductsResponse = {
    products: Product[];
    pagination: ProductsPagination;
    facets: Facet[];
    subcategories: Subcategory[];
};

// Otro producto del mismo grupo, para los selectores de la ficha
// ("Elige tu volumen: 330 ml · 500 ml"). Ligero: sin precio ni ACF.
export type GroupProduct = {
    id: number;
    slug: string;
    attributes: ProductAttribute[];
    stock: ProductStock;
};

// Lo que devuelve /products/resolve: el producto + los datos que solo
// necesita la ficha. Intersección (&): lo de Product y además esto.
export type ProductDetail = Omit<Product, "brand"> & {
    // HTML limpio (wp_kses_post en WordPress)
    description: string;
    groupProducts: GroupProduct[];
    // "Te puede interesar"
    upsells: Product[];
    brand: (ProductBrand & { description: string }) | null;
};
