import { useState, useEffect, useCallback } from 'react'
import { productsService } from '../services/products.service'

// Hook para cargar una lista de productos con filtros opcionales
export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Serializar params para que sirvan como dependencia estable
  const paramsKey = JSON.stringify(params)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productsService.getProducts(JSON.parse(paramsKey))
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message || 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [paramsKey])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { products, pagination, loading, error, refetch: fetch }
}

// Hook para cargar el detalle de un producto por ID
export function useProduct(productId) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    setError(null)
    try {
      const data = await productsService.getProductById(productId)
      setProduct(data.product)
    } catch (err) {
      setError(err.message || 'Producto no encontrado')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { product, loading, error, refetch: fetch }
}

// Hook para buscar productos por texto
export function useProductSearch(query, limit = 20) {
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (q) => {
    const term = q ?? query
    if (!term || term.trim().length < 2) {
      setResults([])
      setTotal(0)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await productsService.searchProducts(term.trim(), limit)
      setResults(data.results)
      setTotal(data.total)
    } catch (err) {
      setError(err.message || 'Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }, [query, limit])

  useEffect(() => {
    search()
  }, [search])

  return { results, total, loading, error, search }
}
