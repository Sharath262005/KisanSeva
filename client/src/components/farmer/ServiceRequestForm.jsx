import { useState } from 'react';
import API from '../../services/api';
import MapPicker from '../common/MapPicker';

const ServiceRequestForm = ({ onRequestCreated }) => {
  const [form, setForm] = useState({
    service_type_id: '',
    land_area: '',
    land_dimensions: '',
    latitude: '',
    longitude: '',
    address_text: '',
    preferred_date: '',
    urgency: 'normal',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationMode, setLocationMode] = useState('gps');   // 'gps' or 'manual'

  const hasMapKey = !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => setImages(e.target.files);

  const handleLocationChange = ({ lat, lng }) => {
    setForm({ ...form, latitude: lat, longitude: lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.latitude || !form.longitude) {
      setError('Please enter field location coordinates');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    for (let file of images) formData.append('land_images', file);

    try {
      await API.post('/bookings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Service request submitted!');
      onRequestCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-3">
      <h3 className="text-xl font-bold text-green-800">Request a Service</h3>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium">Service Type</label>
        <select name="service_type_id" onChange={handleChange} className="input-field" required>
          <option value="">Select</option>
          <option value="1">Tractor Cultivation</option>
          <option value="2">Harvester</option>
          <option value="3">Ploughing</option>
          <option value="4">Rotavator</option>
          <option value="5">Seeder</option>
          <option value="6">Drone Spraying</option>
          <option value="7">Water Tanker</option>
          <option value="8">Grain Transportation</option>
          <option value="9">Land Levelling</option>
        </select>
      </div>

      {/* Land Area & Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Land Area (acres)</label>
          <input name="land_area" type="number" step="0.1" onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Preferred Date</label>
          <input name="preferred_date" type="date" onChange={handleChange} className="input-field" required />
        </div>
      </div>

      {/* Location mode selection */}
      <div>
        <label className="block text-sm font-medium">Location Input Method</label>
        <select value={locationMode} onChange={(e) => setLocationMode(e.target.value)} className="input-field">
          <option value="gps">GPS (Map)</option>
          <option value="manual">Manual Coordinates</option>
        </select>
      </div>

      {/* Dynamic location input */}
      {locationMode === 'gps' && hasMapKey ? (
        <div>
          <label className="block text-sm font-medium">Pick Field Location</label>
          <MapPicker onLocationChange={handleLocationChange} />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium">Field Coordinates</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500">Latitude</label>
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="e.g., 22.2587"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Longitude</label>
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="e.g., 71.1924"
              />
            </div>
          </div>
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-sm font-medium">Address (Village / Landmark)</label>
        <input name="address_text" placeholder="Nearby village or landmark" onChange={handleChange} className="input-field" />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" rows="2" onChange={handleChange} className="input-field" />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium">Land Images (optional)</label>
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>

      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </form>
  );
};

export default ServiceRequestForm;