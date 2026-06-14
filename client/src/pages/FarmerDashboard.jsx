import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ServiceRequestForm from '../components/farmer/ServiceRequestForm';
import BookingList from '../components/farmer/BookingList';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Re-fetch bookings when the dashboard first appears
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRequestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🚜 KisanSeva</h1>
        <div className="flex gap-2">
          <Link to="/survey" className="bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold">
            📋 Survey
          </Link>
          <button onClick={handleLogout} className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold">
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-green-800 mt-4">Welcome, Farmer! 👨‍🌾</h2>
        <ServiceRequestForm onRequestCreated={handleRequestCreated} />
        <BookingList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default FarmerDashboard;