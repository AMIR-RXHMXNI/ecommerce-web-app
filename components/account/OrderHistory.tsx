import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

export default function OrderHistory({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('An error occurred while fetching orders.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Order History</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="mb-4 border-b pb-2">
              <p>Order ID: {order.id}</p>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>Total: ${order.total_amount.toFixed(2)}</p>
              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}