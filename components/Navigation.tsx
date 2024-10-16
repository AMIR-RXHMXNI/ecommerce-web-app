// File: components/Navigation.tsx

import Link from 'next/link'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session) {
      checkAdminStatus()
    }
  }, [session])

  async function checkAdminStatus() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single()

      if (error) throw error
      setIsAdmin(data.is_admin)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      {session ? (
        <>
          <Link href="/account">Account</Link>
          {isAdmin && <Link href="/admin">Admin Dashboard</Link>}
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </>
      ) : (
        <Link href="/auth">Sign In</Link>
      )}
    </nav>
  )
}