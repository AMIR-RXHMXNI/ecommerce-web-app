import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      console.log('Attempting sign in for email:', email)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      
      if (authError) throw authError

      console.log('Sign in successful:', authData)
      
      // Fetch user profile to check admin status
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', authData.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([{ user_id: authData.user.id, is_admin: false }])
          
          if (insertError) throw insertError
          
          router.push('/account')
        } else {
          throw profileError
        }
      } else {
        console.log('User profile:', profileData)
        if (profileData.is_admin) {
          router.push('/admin')
        } else {
          router.push('/account')
        }
      }
    } catch (error) {
      console.error('Error during sign in:', error)
      setMessage(`An error occurred during sign in: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      console.log('Attempting sign up for email:', email)
      const { data, error } = await supabase.auth.signUp({ email, password })
      
      if (error) throw error

      console.log('Sign up successful:', data)
      
      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{ user_id: data.user.id, is_admin: false }])

        if (profileError) throw profileError
      }

      setMessage('Please check your email for the confirmation link to complete your registration!')
    } catch (error) {
      console.error('Error during sign up:', error)
      setMessage(`An error occurred during sign up: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Authentication | Ecommerce Store">
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Sign In / Sign Up</h1>
        {message && (
          <p className="mb-4 text-red-500">{message}</p>
        )}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}