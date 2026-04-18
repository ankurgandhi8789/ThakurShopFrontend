export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatPhone(phone) {
  const p = phone.replace(/\D/g, '');
  if (p.length === 10) return `+91 ${p.slice(0,5)} ${p.slice(5)}`;
  return phone;
}

export function getInitials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export function openGoogleMaps(location, address, onLoadingChange) {
  const destination = location?.lat
    ? `${location.lat},${location.lng}`
    : encodeURIComponent(address);

  if (!navigator.geolocation) {
    // No GPS support — open without origin, Maps will ask on its own
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    return;
  }

  onLoadingChange?.(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onLoadingChange?.(false);
      const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
        '_blank'
      );
    },
    () => {
      // Permission denied or error — still open Maps, just without origin
      onLoadingChange?.(false);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    },
    { timeout: 8000, maximumAge: 60000 }
  );
}
