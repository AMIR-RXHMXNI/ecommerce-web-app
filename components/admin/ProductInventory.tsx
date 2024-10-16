import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

type ProductInventory = {
  id: string;
  product_id: string;
  quantity: number;
  last_updated: string;
}

export default function ProductInventory({ productId }) {
  const [inventory, setInventory] = useState<ProductInventory | null>(null)
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = useSupabaseClient()

  useEffect(() => {
    fetchInventory()
  }, [productId])

  async function fetchInventory() {
    try {
      setLoading(true)
      setError('')
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (error) throw error

      setInventory(data)
      setQuantity(data.quantity.toString())
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError('Failed to fetch inventory information')
    } finally {
      setLoading(false)
    }
  }

  async function updateInventory(e) {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      const updatedQuantity = parseInt(quantity)
      if (isNaN(updatedQuantity) || updatedQuantity < 0) {
        throw new Error('Invalid quantity')
      }

      const { data, error } = await supabase
        .from('product_inventory')
        .upsert({
          product_id: productId,
          quantity: updatedQuantity,
          last_updated: new Date().toISOString()
        })
        .select()

      if (error) throw error

      setInventory(data[0])
      alert('Inventory updated successfully')
    } catch (error) {
      console.error('Error updating inventory:', error)
      setError('Failed to update inventory')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading inventory...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="mt-6 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
      <form onSubmit={updateInventory} className="space-y-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity in Stock</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Inventory
        </button>
      </form>
      {inventory && (
        <p className="mt-4 text-sm text-gray-500">
          Last updated: {new Date(inventory.last_updated).toLocaleString()}
        </p>
      )}
    </div>
  )
}