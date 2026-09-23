import { getProducts } from "@/services/productService";
import { getProductPrices } from "@/services/pricingService";
import ProductCard from "@/components/ProductCard";
import styles from "./page.module.css";
import AuthTest from "@/components/test/AuthTest";
import Pagination from "@/components/Pagination";
import ProductGrid from "@/components/ProductGrid";

export default async function Tienda({
                                         searchParams,
                                     }: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    const data = await getProducts(page);

    const productIds = data.products.map(
        (product) => product.id
    );

    const pricesPromise = getProductPrices(productIds);

    return (
        <main>
            <h1>Tienda</h1>

            <p>
                Productos encontrados: {data.pagination.total}
            </p>

            <ProductGrid
                initialProducts={data.products}
                initialPage={page}
                totalPages={data.pagination.totalPages}
            />
        </main>
    );
}