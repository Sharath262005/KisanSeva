import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NearbyBookings from '../components/driver/NearbyBookings';
import QuotationForm from '../components/driver/QuotationForm';
import ActiveJobs from '../components/driver/ActiveJobs';
import API from '../services/api';
import {
  connectSocket,
  getSocket,
  onNewBooking,
  onQuotationAccepted,
  disconnectSocket,
} from '../services/socketService';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nearbyBookings, setNearbyBookings] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [docsUploaded, setDocsUploaded] = useState(true);

  const fetchNearbyBookings = async () => {
    try {
      const { data } = await API.get('/bookings/nearby');
      const pending = data.filter(b => b.status === 'pending' || b.status === 'quotation_received');
      setNearbyBookings(pending);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const { data } = await API.get('/bookings/driver');
      setActiveJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Check document uploads
  useEffect(() => {
    const checkDocs = async () => {
      try {
        const { data } = await API.get('/drivers/documents');
        if (!data.aadhaar || !data.driving_license || !data.rc_document) {
          setDocsUploaded(false);
        }
      } catch (err) {
        setDocsUploaded(false);
      }
    };
    checkDocs();
  }, []);

  useEffect(() => {
    fetchNearbyBookings();
    fetchActiveJobs();

    if (user?.id) {
      connectSocket(user.id);
      onNewBooking((data) => {
        alert(`New booking: ${data.message}`);
        fetchNearbyBookings();
      });
      onQuotationAccepted((data) => {
        alert(`Your quotation was accepted for booking #${data.booking_id}`);
        fetchActiveJobs();
        fetchNearbyBookings();
      });

      // Re-fetch data when the socket reconnects (after a token refresh or page reload)
      const socket = getSocket();
      if (socket) {
        socket.on('connect', () => {
          fetchNearbyBookings();
          fetchActiveJobs();
        });
      }
    }

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuotationSubmit = async (quotationData) => {
    try {
      await API.post('/quotations', quotationData);
      alert('Quotation submitted!');
      setShowForm(false);
      fetchNearbyBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚜 KisanSeva Driver</h1>
        <div className="flex gap-2">
          <Link to="/survey" className="bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold">
            📋 Survey
          </Link>
          <Link to="/driver/documents" className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold">
            📄 Docs
          </Link>
          <button onClick={handleLogout} className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold">
            Logout
          </button>
        </div>
      </header>

      {!docsUploaded && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 flex justify-between items-center">
          <span>⚠️ Please upload your Aadhaar, Licence & RC to start getting bookings.</span>
          <Link to="/driver/documents" className="bg-yellow-600 text-white px-4 py-2 rounded ml-4">
            Upload Now
          </Link>
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 mt-4">Welcome, Driver! 🚛</h2>

        {showForm && selectedBooking && (
          <QuotationForm
            booking={selectedBooking}
            onSubmit={handleQuotationSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        <NearbyBookings
          bookings={nearbyBookings}
          onSelect={(booking) => { setSelectedBooking(booking); setShowForm(true); }}
        />

        <ActiveJobs jobs={activeJobs} />
      </main>
    </div>
  );
};

export default DriverDashboard;