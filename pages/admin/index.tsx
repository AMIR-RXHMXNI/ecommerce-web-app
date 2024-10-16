import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else {
      fetchDashboardStats()
    }
  }, [session])

  async function fetchDashboardStats() {
    try {
      setLoading(true)

      // Fetch total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')

      if (ordersError) throw ordersError

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)

      // Fetch total customers
      const { count: totalCustomers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      alert('An error occurred while fetching dashboard stats.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <Layout title="Admin Dashboard | Ecommerce Store">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {loading ? (
        <p>Loading dashboard stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Products" value={stats.totalProducts} />
          <DashboardCard title="Total Orders" value={stats.totalOrders} />
          <DashboardCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
          <DashboardCard title="Total Customers" value={stats.totalCustomers} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
          <h2 className="text-xl font-semibold">Manage Products</h2>
        </Link>
        <Link href="/admin/orders" className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition-colors">
          <h2 className="text-xl font-semibold">Manage Orders</h2>
        </Link>
        <Link href="/admin/users" className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:bg-purple-600 transition-colors">
          <h2 className="text-xl font-semibold">Manage Users</h2>
        </Link>
      </div>
    </Layout>
  )
}

function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}