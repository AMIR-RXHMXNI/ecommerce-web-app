import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../lib/cartContext'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'
import ShippingForm from '../components/checkout/ShippingForm'
import PaymentForm from '../components/checkout/PaymentForm'
import OrderSummary from '../components/checkout/OrderSummary'

enum CheckoutStep {
  Shipping,
  Payment,
  Confirmation
}

export default function Checkout() {
  const [step, setStep] = useState(CheckoutStep.Shipping)
  const [shippingDetails, setShippingDetails] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { cart, clearCart } = useCart()
  const router = useRouter()

  useEffect(() => {
    const user = supabase.auth.user()
    if (!user) {
      router.push('/auth?redirect=checkout')
    }
  }, [])

  const handleShippingSubmit = (details) => {
    setShippingDetails(details)
    setStep(CheckoutStep.Payment)
  }

  const handlePaymentSubmit = async (details) => {
    setPaymentDetails(details)
    setIsProcessing(true)
    setError(null)

    const user = supabase.auth.user()
    
    if (!user) {
      setError('You must be logged in to complete your order.')
      setIsProcessing(false)
      return
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          cart,
          shippingDetails,
          paymentDetails,
          total,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const { orderId } = await response.json()
      setOrderId(orderId)
      setStep(CheckoutStep.Confirmation)
      clearCart()
    } catch (error) {
      setError('An error occurred while processing your order. Please try again.')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <Layout title="Checkout | Ecommerce Store">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {step === CheckoutStep.Shipping && (
            <ShippingForm onSubmit={handleShippingSubmit} />
          )}
          {step === CheckoutStep.Payment && (
            <PaymentForm onSubmit={handlePaymentSubmit} isProcessing={isProcessing} />
          )}
          {step === CheckoutStep.Confirmation && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h2 className="text-2xl font-semibold mb-4">Order Confirmed!</h2>
              <p>Thank you for your purchase. Your order (ID: {orderId}) has been processed successfully.</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => router.push('/')}
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
        <div>
          <OrderSummary cart={cart} total={total} />
        </div>
      </div>
    </Layout>
  )
}