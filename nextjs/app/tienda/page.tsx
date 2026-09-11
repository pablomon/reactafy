import { getProducts } from "@/services/productService";
import ProductCard from "@/components/productCard/ProductCard";
import styles from "./page.module.css";

export default async function Tienda() {
    const data = await getProducts();

    return (
        <main>
            <h1>Tienda</h1>

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
        </main>
    );
}