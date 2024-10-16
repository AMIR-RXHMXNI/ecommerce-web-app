// File: pages/admin/users.tsx

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import { Database } from '../../types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const session = useSession()
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/auth')
    } else {
      fetchUsers()
    }
  }, [session])

  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      const usersWithEmail = await Promise.all(
        data.map(async (profile) => {
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', profile.user_id)
            .single()

          if (userError) {
            console.error('Error fetching user email:', userError)
            return { ...profile, email: 'Email not found' }
          }

          return { ...profile, email: userData?.email }
        })
      )

      setUsers(usersWithEmail)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    if (window.confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin rights for this user?`)) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_admin: !currentStatus })
          .eq('user_id', userId)
        
        if (error) throw error
        fetchUsers()
      } catch (error) {
        console.error('Error updating user admin status:', error)
        setError('Failed to update user admin status. Please try again.')
      }
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!session) {
    return null
  }

  return (
    <Layout title="Manage Users | Admin Dashboard">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{user.full_name || 'Name not set'}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <p className="mb-2">Admin: {user.is_admin ? 'Yes' : 'No'}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleAdminStatus(user.user_id, user.is_admin)}
                  className={`px-3 py-1 rounded ${user.is_admin ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => router.push(`/admin/users/${user.user_id}/orders`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View Orders
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}