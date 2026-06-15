import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useAuth } from '../hooks/useAuth';
import { connectSocket, getSocket } from '../services/socketService';
import API from '../services/api';

const containerStyle = { width: '100%', height: '400px' };

const FarmerTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [driverPos, setDriverPos] = useState(null);
  const [fieldPos, setFieldPos] = useState(null);
  const [status, setStatus] = useState('');
  const mapRef = useRef(null);
  const intervalRef = useRef(null);

  const hasMapKey = !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  // Fetch field location
  useEffect(() => {
    const fetchFieldLocation = async () => {
      try {
        const { data } = await API.get('/bookings/farmer');
        const booking = data.find(b => Number(b.id) === Number(bookingId));
        if (booking && booking.latitude && booking.longitude) {
          setFieldPos({
            lat: parseFloat(booking.latitude),
            lng: parseFloat(booking.longitude),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFieldLocation();
  }, [bookingId]);

  // Polling for driver location every 5 seconds (fallback if socket fails)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { data } = await API.get(`/bookings/${bookingId}/location`);
        if (data.latitude && data.longitude) {
          const newPos = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
          setDriverPos(newPos);
          if (mapRef.current) {
            mapRef.current.panTo(newPos);
          }
        }
      } catch (err) {
        // 404 = no location yet, ignore
      }
    };

    // Immediate fetch
    fetchLocation();
    // Poll every 5 seconds
    intervalRef.current = setInterval(fetchLocation, 5000);
    return () => clearInterval(intervalRef.current);
  }, [bookingId]); // ✅ Correct dependency

  // Socket connection (optional, still listen for real-time updates)
  useEffect(() => {
    if (!getSocket() && user?.id) {
      connectSocket(user.id);
    }
    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => {
      console.log('Farmer socket connected, joining room:', bookingId);
      socket.emit('join_booking_room', bookingId);
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.on('connect', onConnect);
    }

    socket.on('driver_location', ({ latitude, longitude }) => {
      console.log('Farmer received location via socket:', latitude, longitude);
      const newPos = { lat: latitude, lng: longitude };
      setDriverPos(newPos);
      if (mapRef.current) mapRef.current.panTo(newPos);
    });

    socket.on('booking_status_update', (data) => {
      if (Number(data.bookingId) === Number(bookingId)) setStatus(data.status);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('driver_location');
      socket.off('booking_status_update');
    };
  }, [bookingId, user?.id]);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  if (!isLoaded && hasMapKey) return <p>Loading map...</p>;

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <h2 className="text-2xl font-bold text-green-800 mb-4">📍 Driver Live Location</h2>
      <p className="mb-2 text-lg">
        Booking Status: <strong>{status.replace(/_/g, ' ')}</strong>
      </p>

      {hasMapKey ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={driverPos || fieldPos || { lat: 22.2587, lng: 71.1924 }}
          zoom={15}
          onLoad={onMapLoad}
        >
          {fieldPos && (
            <Marker
              position={fieldPos}
              icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            />
          )}
          {driverPos && (
            <Marker
              position={driverPos}
              icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
            />
          )}
        </GoogleMap>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Driver's Current Position (text)</h3>
          {driverPos ? (
            <p className="text-2xl font-bold text-green-700">
              Lat: {driverPos.lat.toFixed(6)}, Lng: {driverPos.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-gray-500">Waiting for driver location...</p>
          )}
          {fieldPos && (
            <p className="text-sm text-gray-600 mt-1">
              Field Location: Lat: {fieldPos.lat.toFixed(6)}, Lng: {fieldPos.lng.toFixed(6)}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-2">Add a Google Maps API key to see the map.</p>
        </div>
      )}

      <button
        onClick={() => navigate('/farmer/dashboard')}
        className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default FarmerTracking;