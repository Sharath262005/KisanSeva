import { useState } from 'react';
import API from '../../services/api';

const ReviewModal = ({ bookingId, driverName, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await API.post('/reviews', { booking_id: bookingId, rating, comment });
      alert('Review submitted!');
      onSubmitted();   // refresh parent
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
        <h3 className="text-lg font-bold text-green-800 mb-2">Rate Driver</h3>
        <p className="text-gray-600 mb-4">
          How was your experience with <strong>{driverName}</strong>?
        </p>

        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl mx-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows="3"
          className="input-field mb-4"
        />

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded flex-1">
            Cancel
          </button>
        </div>
      </div>
      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </div>
  );
};

export default ReviewModal;