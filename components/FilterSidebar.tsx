import { useState, useEffect } from 'react'

export default function FilterSidebar({ filters, applyFilters }) {
  const [categories, setCategories] = useState([])
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    applyFilters(localFilters)
  }

  return (
    <form onSubmit={handleSubmit} className="w-64 pr-8">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      <div className="mb-4">
        <label htmlFor="category" className="block mb-2">Category</label>
        <select
          id="category"
          name="category"
          value={localFilters.category}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="minPrice" className="block mb-2">Min Price</label>
        <input
          type="number"
          id="minPrice"
          name="minPrice"
          value={localFilters.minPrice}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="maxPrice" className="block mb-2">Max Price</label>
        <input
          type="number"
          id="maxPrice"
          name="maxPrice"
          value={localFilters.maxPrice}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="sort" className="block mb-2">Sort By</label>
        <select
          id="sort"
          name="sort"
          value={localFilters.sort}
          onChange={handleChange}
          className="w-full border rounded px-2 py-1"
        >
          <option value="created_at:desc">Newest</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
          <option value="name:asc">Name: A to Z</option>
          <option value="name:desc">Name: Z to A</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Apply Filters
      </button>
    </form>
  )
}