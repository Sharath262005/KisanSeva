import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import QuotationList from './QuotationList';
import ReviewModal from './ReviewModal';   // ✅ new import for review modal

const paymentMode = process.env.REACT_APP_PAYMENT_MODE;   // 'mock' or 'real'

const statusColors = {
  pending: 'bg-yellow-200 text-yellow-800',
  quotation_received: 'bg-blue-200 text-blue-800',
  accepted: 'bg-green-200 text-green-800',
  driver_on_way: 'bg-indigo-200 text-indigo-800',
  in_progress: 'bg-purple-200 text-purple-800',
  completed: 'bg-gray-200 text-gray-800',
  cancelled: 'bg-red-200 text-red-800',
};

const BookingList = ({ refreshTrigger }) => {
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);          // ✅ reviews state
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);        // ✅ review modal state
  const [reviewDriverName, setReviewDriverName] = useState('');    // ✅ driver name for modal
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/farmer');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data } = await API.get('/invoices/farmer');
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {          // ✅ fetch farmer reviews
    try {
      const { data } = await API.get('/reviews/farmer');
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchInvoices();
    fetchReviews();                           // ✅ call on mount
  }, [refreshTrigger]);

  const handleQuotationAccepted = () => {
    fetchBookings();
    fetchInvoices();
    fetchReviews();
  };

  const downloadInvoice = (invoiceId) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Please login again');
    const url = `http://localhost:5000/api/invoices/${invoiceId}/download?token=${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h3 className="text-xl font-bold text-green-800 mb-4">Your Bookings</h3>
      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => {
            const invoice = invoices.find(inv => inv.booking_id === b.id);
            const alreadyReviewed = reviews.find(r => r.booking_id === b.id);  // ✅ check if reviewed

            return (
              <li key={b.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{b.service_name}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-200'}`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(b.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Land: {b.land_area} acres</div>

                {/* View Quotations button */}
                {(b.status === 'quotation_received' || b.status === 'pending') && (
                  <button
                    onClick={() => setSelectedBookingId(b.id)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    View Quotations
                  </button>
                )}

                {/* Pay Now button – only if no invoice exists yet */}
                {!invoice && (
                  <button
                    onClick={() =>
                      navigate(`/${paymentMode === 'mock' ? 'mock-payment' : 'payment'}/${b.id}`)
                    }
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2"
                  >
                    Pay Now
                  </button>
                )}

                {/* Download Invoice button – only if invoice exists */}
                {invoice && (
                  <button
                    onClick={() => downloadInvoice(invoice.id)}
                    className="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm mr-2"
                  >
                    Download Invoice
                  </button>
                )}

                {/* Track Driver button – only for accepted or driver_on_way */}
                {(b.status === 'accepted' || b.status === 'driver_on_way') && (
                  <button
                    onClick={() => navigate(`/farmer/tracking/${b.id}`)}
                    className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm mr-2"
                  >
                    Track Driver
                  </button>
                )}

                {/* Rate Driver button – completed, not yet reviewed */}
                {b.status === 'completed' && !alreadyReviewed && (
                  <button
                    onClick={() => {
                      setReviewBooking(b.id);
                      // The driver's name may come from booking data; if not, we use a fallback
                      setReviewDriverName(b.driver_name || 'the driver');
                    }}
                    className="mt-2 bg-purple-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Rate Driver
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Quotation comparison modal */}
      {selectedBookingId && (
        <QuotationList
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onAccepted={handleQuotationAccepted}
        />
      )}

      {/* Review modal */}
      {reviewBooking && (
        <ReviewModal
          bookingId={reviewBooking}
          driverName={reviewDriverName}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => {
            fetchReviews();      // refresh reviews to hide the button
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

export default BookingList;