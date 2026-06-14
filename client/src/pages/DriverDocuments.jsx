import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const DriverDocuments = () => {
  const navigate = useNavigate();
  const [aadhaar, setAadhaar] = useState(null);
  const [license, setLicense] = useState(null);
  const [rc, setRc] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (aadhaar) formData.append('aadhaar', aadhaar);
    if (license) formData.append('license', license);
    if (rc) formData.append('rc', rc);

    setUploading(true);
    try {
      await API.post('/drivers/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Documents uploaded successfully');
      navigate('/driver/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-4">📄 Upload Documents</h2>
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Aadhaar Card (Image)</label>
          <input type="file" accept="image/*" onChange={e => setAadhaar(e.target.files[0])} />
        </div>
        <div>
          <label className="block text-sm font-medium">Driving Licence (Image)</label>
          <input type="file" accept="image/*" onChange={e => setLicense(e.target.files[0])} />
        </div>
        <div>
          <label className="block text-sm font-medium">Vehicle RC (Image)</label>
          <input type="file" accept="image/*" onChange={e => setRc(e.target.files[0])} />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </form>
      <button
        onClick={() => navigate('/driver/dashboard')}
        className="mt-4 text-gray-600 underline block text-center"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default DriverDocuments;