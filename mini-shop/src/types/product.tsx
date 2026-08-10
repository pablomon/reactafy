export interface ProductAttribute {
  slug: string;
  name: string;
  value: string | number;
}

export interface ProductCategory {
  id: number;
  slug: string;
  name: string;
  parentId: number;
}

export interface ProductBrand {
  id: number;
  slug: string;
  name: string;
}

export interface ProductTag {
  id: number;
  slug: string;
  name: string;
  parentId: number;
}

export interface ProductEditorial {
  isFeatured: boolean;
  isNew: boolean;
  isLowStock: boolean;
}

export interface ProductStock {
  status: 'in_stock' | 'out_of_stock' | 'on_backorder' | 'unknown';
}

export interface ProductGroup {
  id: number;
  name: string;
  products: number[];
}

export interface Product {
  id: number;
  sku: string;
  title: string;
  image: string | null;

  isActive: boolean;

  group: ProductGroup;

  categories: ProductCategory[];

  brand: ProductBrand | null;

  tags: ProductTag[];

  editorial: ProductEditorial;

  attributes: ProductAttribute[];

  stock: ProductStock;

  price: number;
  fromPrice: number | null;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}