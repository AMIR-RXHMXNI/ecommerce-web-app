import { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import Image from 'next/image'

type ValidationErrors = {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  image?: string;
}

export default function ProductForm({ product, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price.toString())
      setCategory(product.category)
      setImageUrl(product.image_url)
    }
  }, [product])

  const validateForm = () => {
    const newErrors: ValidationErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!description.trim()) newErrors.description = 'Description is required'
    if (!price || isNaN(parseFloat(price))) newErrors.price = 'Valid price is required'
    if (!category.trim()) newErrors.category = 'Category is required'
    if (!image && !imageUrl) newErrors.image = 'Image is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setErrors({ ...errors, image: undefined })
    } else {
      setErrors({ ...errors, image: 'Please upload a valid image file' })
    }
  }

  const uploadImage = async () => {
    if (!image) return null

    const fileExt = image.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `product-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, image)

    if (uploadError) {
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      let uploadedImageUrl = imageUrl
      if (image) {
        uploadedImageUrl = await uploadImage()
      }

      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        image_url: uploadedImageUrl
      }

      await onSubmit(productData)
    } catch (error) {
      console.error('Error submitting product:', error)
      alert('An error occurred while submitting the product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.01"
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Product Image</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageUpload}
          className={`mt-1 block w-full py-2 px-3 border bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.image ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
      </div>
      {(imageUrl || image) && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Image Preview</label>
          <div className="mt-1">
            <Image
              src={image ? URL.createObjectURL(image) : imageUrl}
              alt="Product preview"
              width={200}
              height={200}
              className="object-cover rounded-md"
            />
          </div>
        </div>
      )}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Submitting...' : (product ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  )
}