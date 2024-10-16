import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Image 
        src={product.image_url || '/placeholder.png'} 
        alt={product.name}
        width={300}
        height={200}
        objectFit="cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
        <Link href={`/products/${product.id}`}>
          <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            View Details
          </a>
        </Link>
      </div>
    </div>
  )
}