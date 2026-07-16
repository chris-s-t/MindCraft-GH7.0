/**
 * Fetches the display name/address for a given latitude and longitude using Nominatim OSM API
 * @param {string|number} latitude 
 * @param {string|number} longitude 
 * @returns {Promise<string>}
 */
export async function fetchAddress(latitude, longitude) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`);
    if (res.ok) {
      const data = await res.json();
      return data.display_name || `Lokasi (${latitude}, ${longitude})`;
    }
  } catch (err) {
    console.error("Address fetch failed:", err);
  }
  return `Lokasi (${latitude}, ${longitude})`;
}
