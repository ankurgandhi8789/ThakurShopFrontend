import { useState } from 'react';

export function useGeoLocation() {
  const [location, setLocation]     = useState(null);
  const [geoError, setGeoError]     = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoAddress, setGeoAddress] = useState('');

  const reverseGeocode = async (lat, lng) => {
    try {
      // Nominatim with 8s timeout
      const c1 = new AbortController();
      const t1 = setTimeout(() => c1.abort(), 8000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'en' }, signal: c1.signal }
      );
      clearTimeout(t1);
      const data = await res.json();
      const a = data?.address || {};

      const parts = [
        a.house_number,
        a.house_name,
        a.road || a.pedestrian || a.footway || a.path,
        a.hamlet || a.croft,
        a.neighbourhood || a.allotments || a.quarter,
        a.suburb || a.residential,
        a.village || a.town_district,
        a.town || a.city_district,
        a.city || a.municipality,
        a.state_district,
        a.state,
        a.postcode,
      ].filter(Boolean);

      if (parts.length >= 3 && (a.road || a.neighbourhood || a.suburb || a.village)) {
        return parts.join(', ');
      }

      // Fallback — BigDataCloud with 8s timeout
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 8000);
      const res2 = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
        { signal: c2.signal }
      );
      clearTimeout(t2);
      const data2 = await res2.json();

      const merged = [
        a.house_number,
        a.house_name,
        a.road || a.pedestrian || a.footway,
        a.neighbourhood || a.allotments || data2.locality,
        a.suburb || a.residential || data2.city,
        a.village,
        a.town || data2.principalSubdivision,
        a.city || data2.city,
        a.state_district,
        a.state || data2.principalSubdivision,
        a.postcode || data2.postcode,
      ].filter(Boolean);

      return merged.length > 0 ? merged.join(', ') : data?.display_name || '';

    } catch { /* timeout or network error — user fills manually */ }
    return '';
  };

  const getLocation = (onAddress) => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    setLocation(null);
    setGeoAddress('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setGeoAddress(addr);
        onAddress?.(addr);
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setGeoError('');
    setGeoAddress('');
  };

  return { location, geoError, geoLoading, geoAddress, getLocation, clearLocation };
}
