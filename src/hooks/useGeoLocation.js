import { useState } from 'react';

export function useGeoLocation() {
  const [location, setLocation]     = useState(null);
  const [geoError, setGeoError]     = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        let msg = 'Could not detect location.';
        if (err.code === 1) msg = 'Location access denied. Please allow location permission.';
        if (err.code === 2) msg = 'Location unavailable. Please try again.';
        if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setGeoError(msg);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,  // uses GPS chip instead of WiFi/IP
        timeout: 15000,            // wait up to 15s for accurate fix
        maximumAge: 0,             // never use cached position — always fresh
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setGeoError('');
  };

  return { location, geoError, geoLoading, getLocation, clearLocation };
}
