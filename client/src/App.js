import MockPaymentPage from './pages/MockPaymentPage';
import DriverDashboard from './pages/DriverDashboard';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import SurveyPage from './pages/SurveyPage';
import PaymentPage from './pages/PaymentPage';
import DriverTracking from './pages/DriverTracking';
import FarmerTracking from './pages/FarmerTracking';
import DriverDocuments from './pages/DriverDocuments';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // allowedRole can be a string or an array of strings
  if (allowedRole) {
    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute allowedRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/tracking/:bookingId"
            element={
              <ProtectedRoute allowedRole="driver">
                <DriverTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/tracking/:bookingId"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute allowedRole="farmer">
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-payment/:bookingId"
            element={
              <ProtectedRoute allowedRole="farmer">
                <MockPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/survey"
            element={
              <ProtectedRoute allowedRole={['farmer', 'driver']}>
                <SurveyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/documents"
            element={
              <ProtectedRoute allowedRole="driver">
                <DriverDocuments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;