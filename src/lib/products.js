import products from '@/data/products.json'

export function getAllProducts() {
  return products.filter((p) => p.active !== false)
}

export function getFeaturedProducts() {
  return products.filter((p) => p.featured && p.active !== false)
}

export function getProductById(id) {
  return products.find((p) => p.id === id && p.active !== false) || null
}
