export default function OrderSummary({ cart, total }) {
    return (
      <div className="bg-gray-100 p-6 rounded">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xl font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }