import { Money } from "./money";

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
    price: Money;
    fromPrice: Money | null;
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