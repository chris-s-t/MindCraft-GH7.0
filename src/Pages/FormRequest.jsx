// ReportForm Component - Floating form panel for reporting road hazards
import { useState, useEffect } from 'react';
import { MapPin, Camera, AlertTriangle, X, Upload } from 'lucide-react';
import { HAZARD_TYPES } from '../lib/hazardTypes';

export default function ReportForm({ selectedLocation, onClose, onSubmit, userLocation }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('jalanan_rusak');
  const [description, setDescription] = useState('');
  const [hazardLevel, setHazardLevel] = useState('medium');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync coords from map selection or GPS
  useEffect(() => {
    if (selectedLocation) {
      setLatitude(selectedLocation.lat.toFixed(6));
      setLongitude(selectedLocation.lng.toFixed(6));
    } else if (userLocation) {
      setLatitude(userLocation.lat.toFixed(6));
      setLongitude(userLocation.lng.toFixed(6));
    }
  }, [selectedLocation, userLocation]);

  // Geocoding lookup
  useEffect(() => {
    if (!latitude || !longitude) return;

    const lookupAddress = async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`);
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.display_name || `Lokasi (${latitude}, ${longitude})`);
        } else {
          setDisplayName(`Lokasi (${latitude}, ${longitude})`);
        }
      } catch (err) {
        console.error("Address fetch failed:", err);
        setDisplayName(`Lokasi (${latitude}, ${longitude})`);
      }
    };

    const timer = setTimeout(lookupAddress, 600);
    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  // Read file and convert to Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const handleUseGPS = () => {
    if (userLocation) {
      setLatitude(userLocation.lat.toFixed(6));
      setLongitude(userLocation.lng.toFixed(6));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
        },
        (err) => {
          alert('Gagal mendapatkan lokasi GPS Anda: ' + err.message);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Judul laporan tidak boleh kosong.');
    if (!latitude || !longitude) return alert('Koordinat lokasi diperlukan. Klik di peta atau gunakan GPS.');

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        type,
        description,
        hazard_level: hazardLevel,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        display_name: displayName,
        photo_url: photo || null,
        upvotes: 0,
        downvotes: 0,
        status: 'pending'
      });
      onClose();
    } catch (err) {
      alert('Gagal mengirimkan laporan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="futuristic-panel w-full max-h-[90vh] overflow-y-auto rounded-lg p-4 pointer-events-auto border-t-2" style={{ borderTopColor: 'var(--accent-color)' }}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
          <h2 className="text-md font-mono font-bold tracking-widest text-white uppercase">Laporkan Bahaya</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-sm text-slate-300">
        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Judul Laporan</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Lubang di lajur kiri"
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600"
            required
          />
        </div>

        {/* Display Name / Geocoding Address */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Nama Lokasi / Alamat</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Mencari alamat lokasi..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600"
            required
          />
        </div>

        {/* Grid: Type & Hazard Level */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Jenis Bahaya</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white"
            >
              {Object.entries(HAZARD_TYPES).map(([key, meta]) => (
                <option key={key} value={key} className="bg-slate-950 text-white">
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Tingkat Bahaya</label>
            <select
              value={hazardLevel}
              onChange={(e) => setHazardLevel(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white"
            >
              <option value="low" className="bg-slate-950 text-slate-400">Rendah (Low)</option>
              <option value="medium" className="bg-slate-950 text-yellow-400">Sedang (Medium)</option>
              <option value="high" className="bg-slate-950 text-orange-400">Tinggi (High)</option>
              <option value="critical" className="bg-slate-950 text-red-400">Kritis (Critical)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kondisi bahaya secara rinci agar penanganan lebih cepat..."
            rows="3"
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600 resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Lampiran Foto</label>
          {photo ? (
            <div className="relative rounded overflow-hidden border border-slate-800 bg-slate-950 h-32 flex items-center justify-center group">
              <img src={photo} alt="Upload preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="border border-dashed border-slate-800 hover:border-[var(--accent-color)] rounded bg-slate-950/30 h-20 flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-slate-300">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs">Klik untuk unggah foto bahaya</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* GPS Coordinates */}
        <div className="border border-slate-800/80 rounded bg-slate-950/40 p-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              Koordinat Lokasi
            </span>
            <button
              type="button"
              onClick={handleUseGPS}
              className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Gunakan GPS Anda
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div>
              <span className="text-slate-500">Lat: </span>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="-6.12345"
                className="bg-transparent border-b border-slate-800 hover:border-slate-700 focus:border-[var(--accent-color)] focus:outline-none w-20 text-white"
                required
              />
            </div>
            <div>
              <span className="text-slate-500">Lng: </span>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="106.12345"
                className="bg-transparent border-b border-slate-800 hover:border-slate-700 focus:border-[var(--accent-color)] focus:outline-none w-20 text-white"
                required
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            *Tips: Klik langsung pada area peta untuk memilih titik secara akurat.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded py-2 cursor-pointer font-semibold transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 neon-glow-btn text-white rounded py-2 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  );
}