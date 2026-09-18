import { getProduct } from "@/services/productService";
import styles from "./page.module.css";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/utils/formatPrice";

type ProductPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProductPage(
    props: ProductPageProps
) {
    const params = await props.params;
    const id = params.id;

    const product = await getProduct(id);
    return (
        <main className={styles.container}>
            <div className={styles.product}>
                <div className={styles.imageBox}>
                    <img
                        className={styles.image}
                        src={product.image}
                        alt={product.title}
                        width={500}
                        height={500}
                    />
                </div>

                <div className={styles.info}>
                    <h1 className={styles.title}>
                        {product.title}
                    </h1>

                    {product.brand && (
                        <p className={styles.brand}>
                            {product.brand.name}
                        </p>
                    )}

                    <div className={styles.attributes}>
                        {product.attributes.map((attribute) => (
                            <p key={attribute.slug}>
                                {attribute.name}: {attribute.value}
                            </p>
                        ))}
                    </div>

                    <p className={styles.price}>
                        {formatPrice(product.price)} €
                    </p>

                    <p className={styles.sku}>
                        SKU: {product.sku}
                    </p>

                    <AddToCartButton productId={product.id}/>
                </div>
            </div>
        </main>
    );
}