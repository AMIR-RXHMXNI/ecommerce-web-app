import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else {
      fetchOrders()
    }
  }, [session])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError('')
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles(full_name, email),
          order_items(
            id,
            quantity,
            price,
            products(name)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId, newStatus) {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      
      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <Layout title="Manage Orders | Admin Dashboard">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">{order.user_profiles.full_name}</td>
                  <td className="py-3 px-4">${order.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}