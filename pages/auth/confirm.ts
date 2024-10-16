import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: req.query.token_hash as string,
    type: 'email',
  })

  if (error) {
    return res.status(401).json({ error: error.message })
  }

  return res.redirect(302, '/')
}