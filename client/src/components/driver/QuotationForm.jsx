import { useState, useEffect } from 'react';
import API from '../../services/api';

const QuotationForm = ({ booking, onSubmit, onCancel }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle_id, setVehicleId] = useState('');
  const [price, setPrice] = useState('');
  const [estimated_hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // fetch driver's vehicles (we'll create this endpoint later, for now we hardcode or create dummy)
    // For now, assume we have a vehicle list endpoint; we'll mock it
    const fetchVehicles = async () => {
      try {
        const { data } = await API.get('/vehicles'); // to be created
        setVehicles(data);
      } catch {
        // fallback: no vehicles endpoint yet, we'll use a static dropdown
        setVehicles([{ id: 2, model: '575 DI', brand: 'Mahindra' }]); // your test vehicle
      }
    };
    fetchVehicles();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ booking_id: booking.id, vehicle_id, price, estimated_hours, notes });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h3 className="font-bold text-lg mb-3">Submit Quotation for {booking.service_name}</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Vehicle</label>
          <select value={vehicle_id} onChange={(e) => setVehicleId(e.target.value)} className="input-field" required>
            <option value="">Select</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm">Estimated Hours</label>
          <input type="number" value={estimated_hours} onChange={(e) => setHours(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" rows="2" />
        </div>
        <div className="flex space-x-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg flex-1">Submit</button>
          <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-2 rounded-lg flex-1">Cancel</button>
        </div>
      </form>
      <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; }`}</style>
    </div>
  );
};

export default QuotationForm;