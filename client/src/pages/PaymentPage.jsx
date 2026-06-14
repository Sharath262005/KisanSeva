import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRazorpay = async () => {
      try {
        const { data } = await API.post('/payments/create-order', { booking_id: bookingId });
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'KisanSeva',
          description: 'Agricultural Service Payment',
          handler: async function (response) {
            // Verify payment
            await API.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
            });
            alert('Payment successful!');
            navigate('/farmer/dashboard');
          },
          modal: {
            ondismiss: function () {
              alert('Payment cancelled');
              navigate('/farmer/dashboard');
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        alert('Failed to initiate payment');
        navigate('/farmer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadRazorpay();
  }, [bookingId, navigate]);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      {loading && <p className="text-xl">Redirecting to payment gateway...</p>}
    </div>
  );
};

export default PaymentPage;