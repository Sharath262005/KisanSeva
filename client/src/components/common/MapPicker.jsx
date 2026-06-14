import { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '250px' };
const defaultCenter = { lat: 22.2587, lng: 71.1924 }; // Gujarat center, change as needed

const MapPicker = ({ onLocationChange }) => {
  const [marker, setMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    onLocationChange({ lat, lng });
  }, [onLocationChange]);

  if (!isLoaded) return <div className="h-[250px] bg-gray-200 rounded flex items-center justify-center">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={marker || defaultCenter}
      zoom={12}
      onClick={handleMapClick}
      options={{ fullscreenControl: false, streetViewControl: false }}
    >
      {marker && <Marker position={marker} />}
    </GoogleMap>
  );
};

export default MapPicker;