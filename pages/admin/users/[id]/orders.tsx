
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../../../../components/Layout'

export default function UserOrders() {
  const [orders, setOrders] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else if (id) {
      fetchUserAndOrders()
    }
  }, [session, id])

  async function fetchUserAndOrders() {
    try {
      setLoading(true)
      setError('')

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', id)
        .single()

      if (userError) throw userError
      setUser(userData)

      // Fetch user's orders
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

      if (orderError) throw orderError
      setOrders(orderData)
    } catch (error) {
      console.error('Error fetching user and orders:', error)
      setError('Failed to fetch user details and orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return <Layout title="User Orders | Admin Dashboard"><p>Loading...</p></Layout>
  }

  if (error) {
    return (
      <Layout title="User Orders | Admin Dashboard">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`Orders for ${user?.full_name} | Admin Dashboard`}>
      <h1 className="text-3xl font-bold mb-6">Orders for {user?.full_name}</h1>
      {orders.length === 0 ? (
        <p>This user has no orders.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Order #{order.id}</h2>
              <p className="mb-2">Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p className="mb-2">Total: ${order.total_amount.toFixed(2)}</p>
              <p className="mb-2">Status: {order.status}</p>
              <button
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                View Order Details
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}