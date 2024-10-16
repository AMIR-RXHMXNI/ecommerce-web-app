// File: pages/account/index.tsx

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else {
      fetchProfile()
    }
  }, [session])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Could not fetch your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <Layout title="My Account | Ecommerce Store">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div>
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Admin Status:</strong> {profile.is_admin ? 'Admin' : 'Regular User'}</p>
        </div>
      ) : (
        <p>No profile found. Please contact support.</p>
      )}
    </Layout>
  )
}