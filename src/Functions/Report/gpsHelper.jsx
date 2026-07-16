/**
 * Gets the user's current GPS location coordinates
 * @param {Function} onSuccess 
 * @param {Function} onError 
 */
export function getGPSLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation tidak didukung oleh browser Anda.'));
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onSuccess({
        latitude: pos.coords.latitude.toFixed(6),
        longitude: pos.coords.longitude.toFixed(6)
      });
    },
    (err) => {
      onError(err);
    }
  );
}
