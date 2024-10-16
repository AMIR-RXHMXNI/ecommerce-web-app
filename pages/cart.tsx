import { useCart } from '../contexts/CartContext'
import Layout from '../components/Layout'
import Link from 'next/link'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Layout title="Cart | Ecommerce Store">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-gray-200 px-2 py-1 rounded"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="bg-gray-200 px-2 py-1 rounded"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="text-red-500 ml-4"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-2xl font-bold">Total: ${total.toFixed(2)}</p>
            <div className="mt-4 space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <Link href="/checkout">
                <a className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
                  Proceed to Checkout
                </a>
              </Link>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}