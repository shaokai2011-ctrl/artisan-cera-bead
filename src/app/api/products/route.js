import { getAllProducts } from '@/lib/products'

export async function GET() {
  const products = getAllProducts()
  return Response.json(products)
}
