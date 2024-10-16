// File: middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    if (req.nextUrl.pathname.startsWith('/admin')) {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .single()

      if (error || !userProfile?.is_admin) {
        console.error('Error fetching user profile or user is not admin:', error)
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*']
}