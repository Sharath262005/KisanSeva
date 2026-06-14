import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/admin/StatsCard';
import DriverApproval from '../components/admin/DriverApproval';
import SurveyManagement from '../components/admin/SurveyManagement';
import PricingManagement from '../components/admin/PricingManagement';
import API from '../services/api';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { key: 'stats', label: '📊 Dashboard' },
    { key: 'drivers', label: '👨‍🌾 Drivers' },
    { key: 'surveys', label: '📋 Surveys' },
    { key: 'pricing', label: '💰 Pricing' },
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🌾 KisanSeva Admin</h1>
        <button onClick={handleLogout} className="bg-white text-green-800 px-4 py-2 rounded-full font-semibold">
          Logout
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen p-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 font-medium ${
                activeTab === tab.key ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-green-800 mb-4">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Farmers" value={stats.farmerCount} color="bg-blue-100 text-blue-800" />
                <StatsCard title="Total Drivers" value={stats.driverCount} color="bg-yellow-100 text-yellow-800" />
                <StatsCard title="Active Bookings" value={stats.activeBookings} color="bg-green-100 text-green-800" />
                <StatsCard title="Pending Drivers" value={stats.pendingDrivers} color="bg-red-100 text-red-800" />
              </div>
            </div>
          )}

          {activeTab === 'drivers' && <DriverApproval />}
          {activeTab === 'surveys' && <SurveyManagement />}
          {activeTab === 'pricing' && <PricingManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;