import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const ActiveJobs = ({ jobs }) => {
  const navigate = useNavigate();

  const startService = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: 'driver_on_way' });
      navigate(`/driver/tracking/${bookingId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start service');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      <h3 className="text-lg font-bold text-green-800 mb-2">Active Jobs</h3>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No active jobs yet.</p>
      ) : (
        jobs.map(job => (
          <div key={job.id} className="border-b py-2">
            <div className="flex justify-between">
              <span className="font-semibold">{job.service_name}</span>
              <span className="text-xs text-green-600 font-medium">{job.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-sm text-gray-600">
              {job.address_text} | {job.land_area} acres
            </div>
            <div className="text-sm text-gray-600">
              Farmer: {job.farmer_name} ({job.farmer_village})
            </div>
            {job.status === 'accepted' && (
              <button
                onClick={() => startService(job.id)}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Start Service
              </button>
            )}
            {job.status === 'driver_on_way' && (
              <button
                onClick={() => navigate(`/driver/tracking/${job.id}`)}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Resume Tracking
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ActiveJobs;