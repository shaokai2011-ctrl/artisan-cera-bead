'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('artisan-cart')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const persist = useCallback((newItems) => {
    setItems(newItems)
    localStorage.setItem('artisan-cart', JSON.stringify(newItems))
  }, [])

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      let next
      if (existing) {
        next = prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      } else {
        next = [...prev, { id: product.id, name: product.name, price: product.price, images: product.images, quantity }]
      }
      localStorage.setItem('artisan-cart', JSON.stringify(next))
      return next
    })
  }, [])

  const updateQuantity = useCallback((id, quantity) => {
    persist(items.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i)).filter((i) => i.quantity > 0))
  }, [items, persist])

  const removeItem = useCallback((id) => {
    persist(items.filter((i) => i.id !== id))
  }, [items, persist])

  const clearCart = useCallback(() => {
    persist([])
  }, [persist])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
