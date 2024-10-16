import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

export default function AdminLayout({ children }) {
  const session = useSession()
  const router = useRouter()

  if (typeof window !== 'undefined' && !session) {
    router.push('/auth')
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-4">
          <Link href="/admin" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Dashboard
          </Link>
          <Link href="/admin/products" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Products
          </Link>
          <Link href="/admin/orders" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Orders
          </Link>
          <Link href="/admin/users" className="block py-2 px-4 text-gray-700 hover:bg-gray-200">
            Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}