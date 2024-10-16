import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../../../../components/Layout'
import ProductForm from '../../../../components/admin/ProductForm'
import ProductInventory from '../../../../components/admin/ProductInventory'

export default function EditProduct() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = router.query
  const supabase = useSupabaseClient()
  const session = useSession()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else if (id) {
      fetchProduct()
    }
  }, [session, id])

  async function fetchProduct() {
    try {
      setLoading(true)
      setError('')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error

      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to fetch product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (productData) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update product')
      }

      alert('Product updated successfully')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error updating product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null // or a loading indicator
  }

  return (
    <Layout title={product ? `Edit ${product.name} | Admin Dashboard` : 'Edit Product'}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {product ? `Edit Product: ${product.name}` : 'Edit Product'}
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        {loading && !product ? (
          <p>Loading product...</p>
        ) : product ? (
          <>
            <ProductForm product={product} onSubmit={handleSubmit} />
            <ProductInventory productId={product.id} />
          </>
        ) : (
          <p>Product not found</p>
        )}
      </div>
    </Layout>
  )
}