import { useState, useEffect } from 'react';
import API from '../../services/api';

const DriverApproval = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const { data } = await API.get('/admin/drivers/unapproved');
      setPendingDrivers(data);
    } catch (err) { console.error(err); }
  };

  const fetchApproved = async () => {
    try {
      const { data } = await API.get('/admin/drivers/approved');
      setApprovedDrivers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPending();
    fetchApproved();
    setLoading(false);
  }, []);

  const handleApprove = async (driverId) => {
    try {
      await API.put(`/admin/drivers/${driverId}/approve`);
      fetchPending();
      fetchApproved();
    } catch (err) {
      alert('Approval failed');
    }
  };

  const renderDriverCard = (driver, showApprove) => (
    <div key={driver.user_id} className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex-1">
          <div className="font-semibold">{driver.name}</div>
          <div className="text-sm text-gray-600">{driver.village}, {driver.district}</div>
          <div className="text-xs text-gray-500">Mobile: {driver.mobile}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {driver.aadhaar && (
              <a href={`http://localhost:5000/${driver.aadhaar}`} target="_blank" rel="noreferrer"
                 className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Aadhaar</a>
            )}
            {driver.driving_license && (
              <a href={`http://localhost:5000/${driver.driving_license}`} target="_blank" rel="noreferrer"
                 className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Licence</a>
            )}
            {driver.rc_document && (
              <a href={`http://localhost:5000/${driver.rc_document}`} target="_blank" rel="noreferrer"
                 className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">RC</a>
            )}
            {!driver.aadhaar && !driver.driving_license && !driver.rc_document && (
              <span className="text-xs text-gray-400">No documents</span>
            )}
          </div>
        </div>
        {showApprove && (
          <div className="flex gap-2">
            <button onClick={() => handleApprove(driver.user_id)} className="bg-green-600 text-white px-4 py-1 rounded">
              Approve
            </button>
            <button className="bg-red-500 text-white px-4 py-1 rounded">Reject</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
          Pending ({pendingDrivers.length})
        </button>
        <button onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded ${activeTab === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
          Approved ({approvedDrivers.length})
        </button>
      </div>

      {loading ? <p>Loading...</p> :
        activeTab === 'pending' ? (
          pendingDrivers.length === 0 ? <p>No pending drivers.</p> :
          <div className="space-y-3">{pendingDrivers.map(d => renderDriverCard(d, true))}</div>
        ) : (
          approvedDrivers.length === 0 ? <p>No approved drivers.</p> :
          <div className="space-y-3">{approvedDrivers.map(d => renderDriverCard(d, false))}</div>
        )
      }
    </div>
  );
};

export default DriverApproval;