import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user, productId, rating, comment } = req.body

    try {
      // Validate the session token
      const { user: authenticatedUser, error: authError } = await supabase.auth.api.getUserByCookie(req)

      if (authError || authenticatedUser.id !== user.id) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Insert the review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        })

      if (error) throw error

      res.status(200).json({ success: true, review: data[0] })
    } catch (error) {
      console.error('Review submission error:', error)
      res.status(500).json({ error: 'An error occurred while submitting your review' })
    }
  } else if (req.method === 'GET') {
    const { productId } = req.query

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          user_profiles(full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({ success: true, reviews: data })
    } catch (error) {
      console.error('Review fetch error:', error)
      res.status(500).json({ error: 'An error occurred while fetching reviews' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}