import type { Product } from '../types/product'
import { getProductAttribute } from '../utils/productAttributes'

interface ProductCardProps {
  product: Product
}

export function ProductCard({
  product,
}: ProductCardProps) {

  const volume = getProductAttribute(
    product.attributes,
    'volumen'
  )

  const quantity = getProductAttribute(
    product.attributes,
    'cantidad'
  )

  return (
    <article>
      {product.image && (
        <img
          src={product.image}
          alt={product.title}
        />
      )}

      <h2>{product.title}</h2>

      <p>
        {volume}
      </p>

      <p>
        {quantity} unidades
      </p>

      <p>
        {product.price} €
      </p>

      {product.fromPrice !== null && (
        <p>
          Desde {product.fromPrice} €
        </p>
      )}

      {product.editorial.isNew && (
        <span>Nuevo</span>
      )}

      {product.editorial.isFeatured && (
        <span>Destacado</span>
      )}

      {product.editorial.isLowStock && (
        <span>Últimas unidades</span>
      )}
    </article>
  )
}