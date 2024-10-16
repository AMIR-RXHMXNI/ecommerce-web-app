export default function ReviewList({ reviews }) {
    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{review.user_profiles.full_name}</span>
              <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-2">Rating: {review.rating} / 5</div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    )
  }