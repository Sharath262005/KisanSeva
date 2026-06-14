import { useState, useEffect } from 'react';
import API from '../../services/api';

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

const PublishPricesForm = ({ onPublished }) => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [prices, setPrices] = useState({});
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const { data } = await API.get('/admin/surveys');
        setSurveys(data);
      } catch (err) { console.error(err); }
    };
    fetchSurveys();
  }, []);

  const handlePriceChange = (serviceId, field, value) => {
    setPrices(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], [field]: value }
    }));
  };

  const handlePublish = async () => {
    if (!selectedSurvey) {
      alert('Select a survey');
      return;
    }
    const payload = serviceTypes.map(st => ({
      service_type_id: st.id,
      standard_price: prices[st.id]?.standard_price || 0,
      min_price: prices[st.id]?.min_price || 0,
      max_price: prices[st.id]?.max_price || 0,
      district: district || null,
      village: village || null
    }));

    try {
      await API.post(`/admin/surveys/${selectedSurvey}/publish`, { prices: payload });
      alert('Prices published!');
      onPublished();
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      <h3 className="text-lg font-bold text-green-800 mb-3">Publish New Prices</h3>
      <div className="flex gap-3 mb-3">
        <select value={selectedSurvey} onChange={e => setSelectedSurvey(e.target.value)} className="input-field">
          <option value="">Select Survey</option>
          {surveys.map(s => <option key={s.id} value={s.id}>{s.year} ({s.start_date} to {s.end_date})</option>)}
        </select>
        <input placeholder="District (optional)" value={district} onChange={e => setDistrict(e.target.value)} className="input-field" />
        <input placeholder="Village (optional)" value={village} onChange={e => setVillage(e.target.value)} className="input-field" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {serviceTypes.map(st => (
          <div key={st.id} className="border p-3 rounded">
            <div className="font-semibold text-sm mb-2">{st.name}</div>
            <div className="flex gap-2">
              <input type="number" placeholder="Standard" className="input-field text-sm"
                onChange={e => handlePriceChange(st.id, 'standard_price', e.target.value)} />
              <input type="number" placeholder="Min" className="input-field text-sm"
                onChange={e => handlePriceChange(st.id, 'min_price', e.target.value)} />
              <input type="number" placeholder="Max" className="input-field text-sm"
                onChange={e => handlePriceChange(st.id, 'max_price', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={handlePublish} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg w-full">
        Publish Prices
      </button>
      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </div>
  );
};

export default PublishPricesForm;