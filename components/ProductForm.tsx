import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductForm({ product, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'price' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1">Product Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="block mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        ></textarea>
      </div>
      <div>
        <label htmlFor="price" className="block mb-1">Price</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          step="0.01"
          min="0"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="category" className="block mb-1">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="image_url" className="block mb-1">Image URL</label>
        <input
          type="url"
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
        {product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  )
}