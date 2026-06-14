import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 to-green-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold text-green-900 mb-4">🌾 KisanSeva</h1>
      <p className="text-xl text-green-800 mb-8 text-center max-w-md">
        Connecting farmers with trusted agricultural vehicle owners in rural India.
      </p>
      <div className="space-x-4">
        <Link to="/login" className="bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-800">
          Login
        </Link>
        <Link to="/register" className="bg-white text-green-700 px-8 py-3 rounded-full text-lg font-semibold border border-green-700 hover:bg-green-50">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Landing;