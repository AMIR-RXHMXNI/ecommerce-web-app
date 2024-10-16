import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'

type LayoutProps = {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = 'Ecommerce Store' }: LayoutProps) {
  const session = useSession()
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session) {
      checkAdminStatus()
    }
  }, [session])

  async function checkAdminStatus() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', session.user.id)
      .single()

    if (data && !error) {
      setIsAdmin(data.is_admin)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 text-white">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Ecommerce Store
          </Link>
          <div className="space-x-4">
            <Link href="/products" className="hover:text-gray-300">
              Products
            </Link>
            {session ? (
              <>
                <Link href="/cart" className="hover:text-gray-300">
                  Cart
                </Link>
                <Link href="/account" className="hover:text-gray-300">
                  Account
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="hover:text-gray-300">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth" className="hover:text-gray-300">
                Login
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          © {new Date().getFullYear()} Ecommerce Store. All rights reserved.
        </div>
      </footer>
    </div>
  )
}