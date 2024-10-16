import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import ProductCard from '../../components/ProductCard'
import SearchBar from '../../components/SearchBar'
import FilterSidebar from '../../components/FilterSidebar'
import Pagination from '../../components/Pagination'

export default function ProductList() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'created_at:desc'
  })

  useEffect(() => {
    fetchProducts()
  }, [router.query])

  async function fetchProducts() {
    setLoading(true)
    const queryParams = new URLSearchParams(router.query as any).toString()
    try {
      const response = await fetch(`/api/products?${queryParams}`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
        setTotalCount(data.count)
        setTotalPages(data.totalPages)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('An error occurred while fetching products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = (newFilters) => {
    setFilters(newFilters)
    router.push({
      pathname: '/products',
      query: { ...newFilters, page: 1 }
    })
  }

  const handlePageChange = (newPage) => {
    router.push({
      pathname: '/products',
      query: { ...router.query, page: newPage }
    })
  }

  return (
    <Layout title="Products | Ecommerce Store">
      <div className="flex flex-col md:flex-row">
        <FilterSidebar filters={filters} applyFilters={applyFilters} />
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">Products</h1>
          <SearchBar
            initialValue={filters.search}
            onSearch={(value) => applyFilters({ ...filters, search: value })}
          />
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <>
              <p className="mb-4">Showing {products.length} of {totalCount} products</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={parseInt(router.query.page as string || '1', 10)}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}