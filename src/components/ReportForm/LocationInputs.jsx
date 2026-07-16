import { MapPin } from 'lucide-react';

export default function LocationInputs({
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  onUseGPS
}) {
  return (
    <div className="border border-slate-200 rounded bg-slate-50 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-sans font-bold uppercase text-slate-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[var(--accent-color)]" />
          Koordinat Lokasi
        </span>
        <button
          type="button"
          onClick={onUseGPS}
          className="text-[10px] text-[var(--accent-color)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold animate-pulse"
        >
          Gunakan GPS Anda
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-slate-500 font-medium">Lat: </span>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="-6.12345"
            className="bg-transparent border-b border-slate-300 hover:border-slate-450 focus:border-[var(--accent-color)] focus:outline-none w-24 text-slate-800"
            required
          />
        </div>
        <div>
          <span className="text-slate-500 font-medium">Lng: </span>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="106.12345"
            className="bg-transparent border-b border-slate-300 hover:border-slate-450 focus:border-[var(--accent-color)] focus:outline-none w-24 text-slate-800"
            required
          />
        </div>
      </div>
      <p className="text-[10px] text-slate-450 mt-1">
        *Tips: Klik langsung pada area peta untuk memilih titik secara akurat.
      </p>
    </div>
  );
}
