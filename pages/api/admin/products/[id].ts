
import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })

  // Check if user is authenticated
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

  const { id } = req.query

  if (req.method === 'PUT') {
    const { name, description, price, category, image_url } = req.body

    // Server-side validation
    const errors = []
    if (!name || typeof name !== 'string' || name.length < 3) {
      errors.push('Invalid name (minimum 3 characters required)')
    }
    if (!description || typeof description !== 'string') {
      errors.push('Invalid description')
    }
    if (!price || typeof price !== 'number' || price <= 0) {
      errors.push('Invalid price (must be a positive number)')
    }
    if (!category || typeof category !== 'string') {
      errors.push('Invalid category')
    }
    if (!image_url || typeof image_url !== 'string') {
      errors.push('Invalid image URL')
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({ name, description, price, category, image_url })
        .eq('id', id)
        .select()

      if (error) throw error

      if (data.length === 0) {
        return res.status(404).json({ error: 'Product not found' })
      }

      return res.status(200).json(data[0])
    } catch (error) {
      console.error('Error updating product:', error)
      return res.status(500).json({ error: 'An error occurred while updating the product' })
    }
  } else {
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}