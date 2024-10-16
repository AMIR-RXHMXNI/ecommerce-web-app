import { useState } from 'react'

export default function SearchBar({ initialValue = '', onSearch }) {
  const [search, setSearch] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(search)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-grow px-4 py-2 border rounded-l"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  )
}
