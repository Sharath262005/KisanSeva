import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    mobile: '', password: '', role: 'farmer', name: '',
    village: '', district: '', state: '', language: 'hi'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/farmer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-4">🌱 Create Account</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" placeholder="Full Name" onChange={handleChange} className="input-field" required />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} className="input-field" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input-field" required />
          <select name="role" onChange={handleChange} className="input-field" required>
            <option value="farmer">Farmer</option>
            <option value="driver">Driver</option>
          </select>
          <input name="village" placeholder="Village" onChange={handleChange} className="input-field" />
          <input name="district" placeholder="District" onChange={handleChange} className="input-field" />
          <input name="state" placeholder="State" onChange={handleChange} className="input-field" />
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg text-xl font-semibold hover:bg-green-700">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-green-700 font-semibold">Login</Link>
        </p>
      </div>
      <style>{`.input-field { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }`}</style>
    </div>
  );
};

export default Register;