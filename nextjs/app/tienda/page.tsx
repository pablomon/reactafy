import { getProducts } from "@/services/productService";
import ProductCard from "@/components/ProductCard";
import styles from "./page.module.css";
import AuthTest from "@/components/test/AuthTest";
import Pagination from "@/components/Pagination";

export default async function Tienda({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const data = await getProducts(page);

    return (
        <main>
            <h1>Tienda</h1>

            <AuthTest />

            <p>
                Productos encontrados: {data.pagination.total}
            </p>

            <div className={styles.grid}>
                {data.products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>

            <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
            />
        </main>
    );
}