import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Trash2, Edit2 } from 'lucide-react';
import StarRating from './StarRating.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchProductReviews,
  createReviewApi,
  updateReviewApi,
  deleteReviewApi,
} from '../services/api.js';

export default function ReviewsSection({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProductReviews(productId);
      setReviews(res.data.reviews);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const myReview = reviews.find((r) => r.user === user?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to write a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateReviewApi(editingId, { rating, comment });
        toast.success('Review updated');
      } else {
        await createReviewApi({ productId, rating, comment });
        toast.success('Review submitted');
      }
      setComment('');
      setRating(5);
      setEditingId(null);
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReviewApi(id);
      toast.success('Review deleted');
      if (editingId === id) {
        setEditingId(null);
        setComment('');
        setRating(5);
      }
      loadReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review');
    }
  };

  return (
    <div className="mt-10">
      <h3 className="section-title text-2xl">Customer Reviews</h3>

      {isAuthenticated && !myReview && (
        <form onSubmit={handleSubmit} className="card mt-4 space-y-3 p-5">
          <p className="font-medium">Write a review</p>
          <StarRating rating={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this coffee..."
            className="input-field min-h-[80px]"
          />
          <button type="submit" disabled={submitting} className="btn-primary !px-5 !py-2 text-sm">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleSubmit} className="card mt-4 space-y-3 p-5">
          <p className="font-medium">Edit your review</p>
          <StarRating rating={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field min-h-[80px]"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary !px-5 !py-2 text-sm">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setComment('');
                setRating(5);
              }}
              className="btn-secondary !px-5 !py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-coffee-bean">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-coffee-bean">No reviews yet. Be the first to review this coffee!</p>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <StarRating rating={review.rating} readOnly size={14} />
                </div>
                {user && review.user === user._id && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(review)} className="text-coffee-mocha">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(review._id)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-coffee-espresso/80 dark:text-coffee-cream/80">
                {review.comment}
              </p>
              <p className="mt-1 text-xs text-coffee-bean">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
