import React, { useState } from 'react'

type OrderEmailNotificationProps = {
  order: any;
  onSendEmail: (subject: string, body: string) => Promise<void>;
}

const OrderEmailNotification: React.FC<OrderEmailNotificationProps> = ({ order, onSendEmail }) => {
  const [subject, setSubject] = useState(`Update on your order #${order.id}`)
  const [body, setBody] = useState(`Dear ${order.user_profiles.full_name},\n\nYour order #${order.id} has been updated. The current status is: ${order.status}.\n\nThank you for your business!\n\nBest regards,\nYour Ecommerce Team`)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      await onSendEmail(subject, body)
      alert('Email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      setError('Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Send Order Update Email</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSendEmail}>
        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>
    </div>
  )
}

export default OrderEmailNotification