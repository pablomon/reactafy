import type { ProductAttribute } from '../types/product'

export function getProductAttribute(
  attributes: ProductAttribute[],
  slug: string
): string | number | undefined {
  return attributes.find(
    attribute => attribute.slug === slug
  )?.value
}