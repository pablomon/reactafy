import type { Product } from "@/types/product";
import { getProductPrices } from "@/services/pricingService";
import ProductCard from "@/components/ProductCard";

interface ProductPricesProps {
    products: Product[];
}

export default async function ProductPrices({
                                                products,
                                            }: ProductPricesProps) {
    const productIds = products.map(
        (product) => product.id
    );

    const prices = await getProductPrices(productIds);

    return (
        <>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    price={prices[product.id]}
                />
            ))}
        </>
    );
}