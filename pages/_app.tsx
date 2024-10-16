import { useState } from 'react'
import { AppProps } from 'next/app'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Database } from '../types/supabase'  // You'll need to generate this type
import { CartProvider } from '../contexts/CartContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>())

  return (
    <SessionContextProvider 
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </SessionContextProvider>
  )
}

export default MyApp