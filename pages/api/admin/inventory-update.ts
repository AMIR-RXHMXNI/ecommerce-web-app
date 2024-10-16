import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res })

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', session.user.id)
    .single()

  if (!userProfile?.is_admin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method === 'POST') {
    const { orderId, newStatus } = req.body

    // Only update inventory when order status changes to 'Shipped'
    if (newStatus !== 'Shipped') {
      return res.status(200).json({ message: 'No inventory update needed' })
    }

    try {
      // Fetch order items
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (orderItemsError) throw orderItemsError

      // Update inventory for each order item
      for (const item of orderItems) {
        const { error: updateError } = await supabase.rpc('update_product_inventory', {
          p_product_id: item.product_id,
          p_quantity: item.quantity
        })

        if (updateError) throw updateError
      }

      res.status(200).json({ message: 'Inventory updated successfully' })
    } catch (error) {
      console.error('Error updating inventory:', error)
      res.status(500).json({ error: 'An error occurred while updating inventory' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}