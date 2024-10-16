import { useState } from 'react'

export default function PaymentForm({ onSubmit, isProcessing }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expirationDate: '',
    cvv: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
      <div>
        <label htmlFor="cardNumber" className="block mb-1">Card Number</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="cardName" className="block mb-1">Name on Card</label>
        <input
          type="text"
          id="cardName"
          name="cardName"
          value={formData.cardName}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="expirationDate" className="block mb-1">Expiration Date</label>
          <input
            type="text"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
            placeholder="MM/YY"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="cvv" className="block mb-1">CVV</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
      <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
      <button
         type="submit"
         className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
         disabled={isProcessing}
       >
         {isProcessing ? 'Processing...' : 'Place Order'}
       </button>
     </form>
   )
 }