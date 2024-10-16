import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', session.user.id)
    .single()

  if (!userProfile?.is_admin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'POST') {
    const { name, description, price, category, image_url } = req.body

    // Server-side validation
    if (!name || typeof name !== 'string' || name.length < 3) {
      return res.status(400).json({ error: 'Invalid name' })
    }
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Invalid description' })
    }
    if (!price || typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Invalid price' })
    }
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Invalid category' })
    }
    if (!image_url || typeof image_url !== 'string') {
      return res.status(400).json({ error: 'Invalid image URL' })
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, description, price, category, image_url }])
        .select()

      if (error) throw error

      return res.status(200).json(data[0])
    } catch (error) {
      console.error('Error adding product:', error)
      return res.status(500).json({ error: 'An error occurred while adding the product' })
    }
  } else if (req.method === 'PUT') {
    // Similar validation and update logic for editing products
    // ...
  } else {
    res.setHeader('Allow', ['POST', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}