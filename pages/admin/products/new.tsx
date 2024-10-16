import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import ProductForm from '../../../components/admin/ProductForm'

export default function AddNewProduct() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (productData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'An error occurred while adding the product.')
      }

      alert('Product added successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error adding product:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Add New Product | Admin Dashboard">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <div className="max-w-2xl mx-auto">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </Layout>
  )
}