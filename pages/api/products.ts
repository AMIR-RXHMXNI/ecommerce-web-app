import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

const ITEMS_PER_PAGE = 12

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { search, category, minPrice, maxPrice, sort, page = '1' } = req.query

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      if (category) {
        query = query.eq('category', category)
      }

      if (minPrice) {
        query = query.gte('price', minPrice)
      }

      if (maxPrice) {
        query = query.lte('price', maxPrice)
      }

      if (sort) {
        const [field, order] = sort.split(':')
        query = query.order(field, { ascending: order === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const pageNumber = parseInt(page as string, 10)
      const start = (pageNumber - 1) * ITEMS_PER_PAGE
      query = query.range(start, start + ITEMS_PER_PAGE - 1)

      const { data, error, count } = await query

      if (error) throw error

      res.status(200).json({ success: true, products: data, count })
    } catch (error) {
      console.error('Product fetch error:', error)
      res.status(500).json({ error: 'An error occurred while fetching products' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}