import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function OrderHistory({ user }) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items (
            product_id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setOrders(data)
      }
    } catch (error) {
      alert(error.message)
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
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Order #{order.id}</span>
                <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="mb-2">Status: {order.status}</div>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.product_id} className="flex justify-between">
                    <span>{item.products.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-right font-semibold">
                Total: ${order.total_amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}