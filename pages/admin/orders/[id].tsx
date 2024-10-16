import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Layout from '../../../components/Layout'
import OrderInvoice from '../../../components/admin/OrderInvoice'
import OrderEmailNotification from '../../../components/admin/OrderEmailNotification'

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
]

export default function OrderDetail() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)
  const router = useRouter()
  const { id } = router.query
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else if (id) {
      fetchOrder()
    }
  }, [session, id])

  async function fetchOrder() {
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
            products(id, name)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Failed to fetch order details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(newStatus) {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id)
      
      if (error) throw error

      // Call the inventory update API
      const response = await fetch('/api/admin/inventory-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: id, newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update inventory')
      }

      fetchOrder()
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function sendEmail(subject, body) {
    // In a real application, you would integrate with an email service here
    // For this example, we'll just log the email details and simulate sending
    console.log('Sending email:', { to: order.user_profiles.email, subject, body })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (!session) {
    return null
  }

  if (loading) {
    return <Layout title="Order Detail | Admin Dashboard"><p>Loading order details...</p></Layout>
  }

  if (error) {
    return (
      <Layout title="Order Detail | Admin Dashboard">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>{error}</p>
        </div>
      </Layout>
    )
  }

  if (!order) {
    return <Layout title="Order Detail | Admin Dashboard"><p>Order not found</p></Layout>
  }

  return (
    <Layout title={`Order ${order.id} | Admin Dashboard`}>
      {/* ... (rest of the component remains the same) ... */}
    </Layout>
  )
}