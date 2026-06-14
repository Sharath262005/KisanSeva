import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const MockPaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleMockPayment = async () => {
    setLoading(true);
    try {
      await API.post('/payments/mock', { booking_id: bookingId });
      alert('Mock payment successful! Invoice generated.');
      navigate('/farmer/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Mock payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-4">🧪 Mock Payment</h2>
        <p className="text-gray-600 mb-6">
          This simulates a successful payment without real money.
          Click the button below to complete the payment and generate an invoice.
        </p>
        <button
          onClick={handleMockPayment}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Simulate Payment'}
        </button>
        <button
          onClick={() => navigate('/farmer/dashboard')}
          className="mt-3 text-gray-500 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MockPaymentPage;