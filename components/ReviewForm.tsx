import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const user = supabase.auth.user()
    if (!user) {
      alert('You must be logged in to submit a review')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          productId,
          rating,
          comment
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      setRating(5)
      setComment('')
      onReviewSubmitted()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('An error occurred while submitting your review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="mb-4">
        <label htmlFor="rating" className="block mb-2">Rating</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value} Star{value !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="comment" className="block mb-2">Comment</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
        ></textarea>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}