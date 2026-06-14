import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const serviceTypes = [
  { id: 1, name: 'Tractor Cultivation' },
  { id: 2, name: 'Harvester' },
  { id: 3, name: 'Ploughing' },
  { id: 4, name: 'Rotavator' },
  { id: 5, name: 'Seeder' },
  { id: 6, name: 'Drone Spraying' },
  { id: 7, name: 'Water Tanker' },
  { id: 8, name: 'Grain Transportation' },
  { id: 9, name: 'Land Levelling' },
];

const SurveyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const { data } = await API.get('/surveys/active');
        setSurvey(data);
      } catch (err) {
        setError('No active survey right now.');
      }
    };
    fetchSurvey();
  }, []);

  const handleChange = (serviceId, field, value) => {
    setFormData(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
  };

  const handleSubmitService = async (serviceId) => {
    const data = formData[serviceId];
    if (!data || !data.suggested_price) {
      alert('Please enter suggested price');
      return;
    }
    try {
      await API.post(`/surveys/${survey.id}/responses`, {
        service_type_id: serviceId,
        suggested_price: data.suggested_price,
        fuel_cost_opinion: data.fuel_cost_opinion || null,
        labor_cost_opinion: data.labor_cost_opinion || null,
        maintenance_cost: data.maintenance_cost || null,
        seasonal_difficulty: data.seasonal_difficulty || null,
        prev_year_comparison: data.prev_year_comparison || '',
        reason: data.reason || ''
      });
      setMessage(`Response for ${serviceTypes.find(s => s.id === serviceId)?.name} submitted!`);
      // clear this service form
      setFormData(prev => {
        const newData = { ...prev };
        delete newData[serviceId];
        return newData;
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting response');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-green-800">🌾 Pricing Survey</h2>
        <p className="mt-4 text-gray-600">{error}</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-green-800 text-center mb-2">📋 Yearly Pricing Survey</h1>
      <p className="text-center text-gray-600 mb-6">
        Help set fair prices for agricultural services. Your input matters!
      </p>

      {message && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{message}</div>}

      <div className="space-y-6">
        {serviceTypes.map(st => (
          <div key={st.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-green-800 mb-3">{st.name}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm">Suggested Price (₹/acre) *</label>
                <input
                  type="number"
                  value={formData[st.id]?.suggested_price || ''}
                  onChange={e => handleChange(st.id, 'suggested_price', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm">Fuel Cost Opinion</label>
                <input
                  type="number"
                  value={formData[st.id]?.fuel_cost_opinion || ''}
                  onChange={e => handleChange(st.id, 'fuel_cost_opinion', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm">Labor Cost Opinion</label>
                <input
                  type="number"
                  value={formData[st.id]?.labor_cost_opinion || ''}
                  onChange={e => handleChange(st.id, 'labor_cost_opinion', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm">Maintenance Cost</label>
                <input
                  type="number"
                  value={formData[st.id]?.maintenance_cost || ''}
                  onChange={e => handleChange(st.id, 'maintenance_cost', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm">Seasonal Difficulty (1-10)</label>
                <input
                  type="number" min="1" max="10"
                  value={formData[st.id]?.seasonal_difficulty || ''}
                  onChange={e => handleChange(st.id, 'seasonal_difficulty', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm">Previous Year Comparison</label>
                <input
                  type="text"
                  value={formData[st.id]?.prev_year_comparison || ''}
                  onChange={e => handleChange(st.id, 'prev_year_comparison', e.target.value)}
                  className="input-field"
                  placeholder="Higher/Lower/Same"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm">Reason for Suggested Price</label>
                <textarea
                  rows="2"
                  value={formData[st.id]?.reason || ''}
                  onChange={e => handleChange(st.id, 'reason', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={() => handleSubmitService(st.id)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg w-full"
            >
              Submit for {st.name}
            </button>
          </div>
        ))}
      </div>

      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </div>
  );
};

export default SurveyPage;