import products from '@/data/products.json'

export function getAllProducts() {
  return products
}

export function getFeaturedProducts() {
  return products.filter((p) => p.featured)
}

export function getProductById(id) {
  return products.find((p) => p.id === id) || null
}
