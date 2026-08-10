import type {
  Product,
  ProductsResponse,
} from '../types/product'

const API_URL =
  '/api/wp-json/reactafy/v1/products'
const AUTH_TOKEN_KEY = 'reactafy.authToken'

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)

  return token
    ? { Authorization: `Bearer ${token}` }
    : {}
}

type GetProductsParams = {
  page: number
  limit: number
  category?: string
}

export async function getProduct(
  id: string
): Promise<Product> {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching product'
    )
  }

  const data: Product =
    await response.json()

  return data
}

export async function getProducts({
  page,
  limit,
  category,
}: GetProductsParams): Promise<ProductsResponse> {

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(limit),
  })

  if (category) {
    params.set(
      'category',
      category
    )
  }

  const response = await fetch(
    `${API_URL}?${params}`,
    {
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching products'
    )
  }

  const data: ProductsResponse =
    await response.json()

  return data
}

export async function getCategories(): Promise<string[]> {
  const response = await fetch(
    '/api/wp-json/wc/store/v1/products/categories'
  )

  if (!response.ok) {
    throw new Error(
      'Error fetching categories'
    )
  }

  const data = await response.json()

  return data.map(
    (category: { slug: string }) =>
      category.slug
  )
}
