import { getProducts } from "@/services/productService";
import { getProductPrices } from "@/services/pricingService";
import ProductGrid from "@/components/ProductGrid";
import styles from "./page.module.css";

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
        <main className={styles.main}>
            {/* Oculto a la vista, pero sigue siendo el título para SEO y lectores de pantalla */}
            <h1 className={styles.visuallyHidden}>Tienda</h1>

            <ProductGrid
                initialProducts={data.products}
                initialPage={page}
                totalPages={data.pagination.totalPages}
                initialPricesPromise={pricesPromise}
            />
        </main>
    );
}