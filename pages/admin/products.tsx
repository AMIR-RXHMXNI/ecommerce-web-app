import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'

const ITEMS_PER_PAGE = 10

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else {
      fetchProducts()
      fetchCategories()
    }
  }, [session, currentPage, searchTerm, categoryFilter, minPrice, maxPrice])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .distinct()
      
      if (error) throw error
      setCategories(data.map(item => item.category))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice))
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice))
      }

      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
      setTotalCount(count)
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('An error occurred while fetching products.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id) {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('An error occurred while deleting the product.')
      }
    }
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (!session) {
    return null
  }

  return (
    <Layout title="Manage Products | Admin Dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link href="/admin/products/new" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
          Add New Product
        </Link>
      </div>
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="flex space-x-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
      </div>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p>Showing {products.length} of {totalCount} products</p>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>{currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}