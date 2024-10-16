import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signIn({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Check your email for the login link!')
    setLoading(false)
  }

  return (
    <div className="flex flex-col space-y-4">
      <form onSubmit={handleLogin} className="flex flex-col space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      <button onClick={handleSignUp} className="bg-green-500 text-white p-2" disabled={loading}>
        {loading ? 'Loading...' : 'Sign Up'}
      </button>
    </div>
  )
}