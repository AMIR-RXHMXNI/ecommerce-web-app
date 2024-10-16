import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import Layout from '../../components/Layout'
import Image from 'next/image'
import ReviewForm from '../../components/ReviewForm'
import ReviewList from '../../components/ReviewList'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabaseClient()
  const session = useSession()

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchReviews()
    }
  }, [id])

  async function fetchProduct() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('An error occurred while fetching the product.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, user_profiles(full_name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setReviews(data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      alert('An error occurred while fetching reviews.')
    }
  }

  if (loading) return <Layout><p>Loading product...</p></Layout>
  if (!product) return <Layout><p>Product not found</p></Layout>

  return (
    <Layout title={`${product.name} | Ecommerce Store`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image 
            src={product.image_url || '/placeholder.png'} 
            alt={product.name}
            width={600}
            height={400}
            objectFit="cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="mb-4">
            <span className="font-semibold">Average Rating:</span> {product.average_rating ? product.average_rating.toFixed(1) : 'No ratings yet'}
          </div>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <ReviewForm productId={id} onReviewSubmitted={fetchReviews} />
        <ReviewList reviews={reviews} />
      </div>
    </Layout>
  )
}