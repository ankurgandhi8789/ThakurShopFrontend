import { useState } from 'react';

export function useGeoLocation() {
  const [location, setLocation]   = useState(null);
  const [geoError, setGeoError]   = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError('Could not detect location. Please allow location access.');
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return { location, geoError, geoLoading, getLocation };
}
