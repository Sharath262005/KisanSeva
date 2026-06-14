import { useState, useEffect } from 'react';
import API from '../../services/api';

const QuotationList = ({ bookingId, onClose, onAccepted }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const { data } = await API.get(`/bookings/${bookingId}/quotations`);
        setQuotations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, [bookingId]);

  const handleAccept = async (quotationId) => {
    setAccepting(quotationId);
    try {
      await API.put(`/quotations/${quotationId}/accept`);
      alert('Quotation accepted! Booking confirmed.');
      onAccepted();  // refresh booking list
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Accept failed');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-800">Quotations Received</h3>
          <button onClick={onClose} className="text-gray-500 text-xl">&times;</button>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : quotations.length === 0 ? (
          <p className="text-gray-500 text-center">No quotations yet.</p>
        ) : (
          quotations.map(q => (
            <div key={q.id} className="border rounded-lg p-3 mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{q.driver_name}</span>
                <span className="text-lg font-bold text-green-700">₹{q.price}</span>
              </div>
              <div className="text-sm text-gray-600">
                {q.vehicle_brand} {q.vehicle_model} &bull; Est. {q.estimated_hours} hrs
              </div>
              {q.notes && <div className="text-sm text-gray-500 mt-1">Note: {q.notes}</div>}
              <button
                onClick={() => handleAccept(q.id)}
                disabled={accepting === q.id}
                className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {accepting === q.id ? 'Accepting...' : 'Accept This Quote'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuotationList;