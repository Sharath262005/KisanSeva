import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { role } = await login(mobile, password);  // now login returns user object with role
      // Redirect based on role
      if (role === 'farmer') navigate('/farmer/dashboard');
      else if (role === 'driver') navigate('/driver/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');  // unknown role
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // ... rest of the JSX stays exactly the same (form, inputs, etc.)
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-2">🌾 KisanSeva</h1>
        <p className="text-gray-600 text-center mb-6">Farmer & Driver Login</p>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
              placeholder="10-digit mobile"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg text-xl font-semibold hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-700 font-semibold">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;