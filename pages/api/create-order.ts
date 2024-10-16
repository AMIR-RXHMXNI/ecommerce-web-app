import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user, cart, shippingDetails, paymentDetails, total } = req.body

    try {
      // Validate the session token
      const { user: authenticatedUser, error: authError } = await supabase.auth.api.getUserByCookie(req)

      if (authError || authenticatedUser.id !== user.id) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Start a Supabase transaction
      const { data, error } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_shipping_address: JSON.stringify(shippingDetails),
        p_payment_details: JSON.stringify(paymentDetails),
        p_total_amount: total,
        p_order_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      })

      if (error) throw error

      res.status(200).json({ success: true, orderId: data })
    } catch (error) {
      console.error('Order creation error:', error)
      res.status(500).json({ error: 'An error occurred while processing your order' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}