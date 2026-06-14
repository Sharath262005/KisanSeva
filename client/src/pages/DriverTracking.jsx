import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { connectSocket, getSocket } from '../services/socketService';
import API from '../services/api';

const DriverTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [fieldPos, setFieldPos] = useState(null);

  useEffect(() => {
    if (!getSocket() && user?.id) {
      connectSocket(user.id);
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('join_booking_room', bookingId);
    }

    const fetchStatusAndField = async () => {
      try {
        const { data } = await API.get(`/bookings/driver`);
        const booking = data.find(b => Number(b.id) === Number(bookingId));
        if (booking) {
          setCurrentStatus(booking.status);
          if (booking.latitude && booking.longitude) {
            setFieldPos({
              lat: parseFloat(booking.latitude),
              lng: parseFloat(booking.longitude),
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatusAndField();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [bookingId, user]);

  const startSharing = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    if (currentStatus !== 'driver_on_way') {
      try {
        await API.put(`/bookings/${bookingId}/status`, { status: 'driver_on_way' });
        setCurrentStatus('driver_on_way');
      } catch (err) {
        alert('Failed to update status');
        return;
      }
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Driver sending location:', latitude, longitude);
        const socket = getSocket();
        if (socket) {
          socket.emit('driver_location_update', { bookingId, latitude, longitude });
        } else {
          console.error('Socket not connected!');
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        alert('Error getting location: ' + error.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    watchIdRef.current = id;
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    navigate('/driver/dashboard');
  };

  const updateStatus = async (newStatus) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setCurrentStatus(newStatus);
      alert(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      if (newStatus === 'completed') {
        stopSharing();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const openNavigation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not available');
      return;
    }
    if (!fieldPos) {
      alert('Field location not loaded yet');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${fieldPos.lat},${fieldPos.lng}`;
        window.open(url, '_blank');
      },
      (error) => {
        alert('Could not get current location: ' + error.message);
      }
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-4">🚛 GPS Tracking</h2>
        <p className="text-gray-600 mb-4">
          Current Status: <strong>{currentStatus.replace(/_/g, ' ')}</strong>
        </p>

        {fieldPos && (
          <button
            onClick={openNavigation}
            className="mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg w-full"
          >
            🧭 Navigate to Field
          </button>
        )}

        {!sharing ? (
          <button
            onClick={startSharing}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full mb-2"
          >
            Start Sharing Location
          </button>
        ) : (
          <p className="text-green-600 font-medium mb-4">📍 Sharing your live location...</p>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => updateStatus('in_progress')}
            disabled={currentStatus === 'completed'}
            className="bg-yellow-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
          >
            In Progress
          </button>
          <button
            onClick={() => updateStatus('completed')}
            disabled={currentStatus === 'completed'}
            className="bg-green-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
          >
            Completed
          </button>
        </div>

        <button
          onClick={stopSharing}
          className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold w-full"
        >
          Stop & Go Back
        </button>
      </div>
    </div>
  );
};

export default DriverTracking;