import { getProducts } from "@/services/productService";
import ProductCard from "@/components/ProductCard";
import styles from "./page.module.css";
import AuthTest from "@/components/test/AuthTest";

export default async function Tienda() {
    const data = await getProducts();

        return (
        <main>
            <pre>
                {JSON.stringify(data, null, 2)}
            </pre>
        </main>
    );
    
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
        </main>
    );
}