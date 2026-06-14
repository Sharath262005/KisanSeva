import { useState, useEffect } from 'react';
import API from '../../services/api';

const SurveyManagement = () => {
  const [surveys, setSurveys] = useState([]);
  const [year, setYear] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const fetchSurveys = async () => {
    try {
      const { data } = await API.get('/admin/surveys');
      setSurveys(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSurveys(); }, []);

  const handleCreate = async () => {
    try {
      await API.post('/admin/surveys', { year, start_date: start, end_date: end });
      fetchSurveys();
      setYear(''); setStart(''); setEnd('');
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const toggleSurvey = async (id, isOpen) => {
    await API.put(`/admin/surveys/${id}/toggle`, { is_open: !isOpen });
    fetchSurveys();
  };

  const viewAnalytics = async (surveyId) => {
    try {
      const { data } = await API.get(`/admin/surveys/${surveyId}/analytics`);
      setAnalytics(data);
      setSelectedSurvey(surveyId);
    } catch (err) { alert('Failed to load analytics'); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-green-800 mb-4">Pricing Surveys</h2>

      {/* Create new survey */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-wrap gap-3">
        <input placeholder="Year (e.g., 2026)" value={year} onChange={e => setYear(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={start} onChange={e => setStart(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="border p-2 rounded" />
        <button onClick={handleCreate} className="bg-green-600 text-white px-4 py-2 rounded">Create Survey</button>
      </div>

      {/* List surveys */}
      <div className="space-y-3">
        {surveys.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <div className="font-bold">Year: {s.year}</div>
              <div className="text-sm">{s.start_date} to {s.end_date}</div>
              <div className={`text-xs font-medium ${s.is_open ? 'text-green-600' : 'text-red-600'}`}>
                {s.is_open ? 'Open' : 'Closed'}
              </div>
            </div>
            <div className="space-x-2">
              <button onClick={() => toggleSurvey(s.id, s.is_open)} className="bg-blue-500 text-white px-3 py-1 rounded">
                {s.is_open ? 'Close' : 'Open'}
              </button>
              <button onClick={() => viewAnalytics(s.id)} className="bg-gray-600 text-white px-3 py-1 rounded">
                Analytics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Modal */}
      {analytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Survey Analytics</h3>
              <button onClick={() => setAnalytics(null)} className="text-gray-500 text-xl">&times;</button>
            </div>
            <h4 className="font-semibold">Service Averages</h4>
            <table className="w-full text-sm mb-4">
              <thead><tr><th>Service</th><th>Avg Price</th><th>Min</th><th>Max</th><th>Responses</th></tr></thead>
              <tbody>
                {analytics.serviceAverages.map(row => (
                  <tr key={row.service_name}>
                    <td>{row.service_name}</td>
                    <td>₹{parseFloat(row.avg_price).toFixed(0)}</td>
                    <td>₹{row.min_price}</td>
                    <td>₹{row.max_price}</td>
                    <td>{row.response_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="font-semibold">District Averages (Farmers)</h4>
            <table className="w-full text-sm">
              <thead><tr><th>District</th><th>Service</th><th>Avg Price</th></tr></thead>
              <tbody>
                {analytics.districtAverages.map((row, i) => (
                  <tr key={i}>
                    <td>{row.district}</td>
                    <td>{row.service_name}</td>
                    <td>₹{parseFloat(row.avg_price).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;