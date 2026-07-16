import { useState } from 'react';
import { Navigation, Compass, MapPin, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { getRouteAlternatives } from '../utils/routing';

const JAKARTA_PRESETS = [
  { name: 'Monas (Jakarta Pusat)', lat: -6.1754, lng: 106.8272 },
  { name: 'Bundaran HI', lat: -6.1919, lng: 106.8230 },
  { name: 'Semanggi Interchange', lat: -6.2195, lng: 106.8122 },
  { name: 'Kuningan Crossroad', lat: -6.2300, lng: 106.8250 },
  { name: 'Senayan (GBK)', lat: -6.2184, lng: 106.8018 },
  { name: 'Menteng Park', lat: -6.1963, lng: 106.8320 }
];

export default function RoutePlanner({ reports,
  startCoord,
  setStartCoord,
  destinationCoord,
  setDestinationCoord,
  activeRoute,
  setActiveRoute,
  routeAlternatives,
  setRouteAlternatives,
  userLocation }
) {
  const [clickMode, setClickMode] = useState(null); // 'start' | 'destination' | null
  const [loading, setLoading] = useState(false);

  const handlePresetSelect = (preset, target) => {
    if (target === 'start') {
      setStartCoord({ lat: preset.lat, lng: preset.lng });
    } else {
      setDestinationCoord({ lat: preset.lat, lng: preset.lng });
    }
  };

  const handleUseGPS = (target) => {
    if (userLocation) {
      if (target === 'start') setStartCoord(userLocation);
      else setDestinationCoord(userLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (target === 'start') setStartCoord(loc);
          else setDestinationCoord(loc);
        },
        (err) => {
          alert('Gagal melacak lokasi GPS: ' + err.message);
        }
      );
    }
  };

  const handleCalculateRoute = async () => {
    if (!startCoord || !destinationCoord) {
      return alert('Mohon tentukan koordinat Titik Awal dan Tujuan terlebih dahulu.');
    }

    setLoading(true);
    try {
      // Filter out resolved reports for routing safety check
      const activeHazards = reports.filter(r => r.status !== 'resolved');

      const routes = await getRouteAlternatives(startCoord, destinationCoord, activeHazards);
      setRouteAlternatives(routes);

      // Auto-select the first route (OSRM returns safest/fastest first due to sorting in routing.js)
      setActiveRoute(routes[0]);
    } catch (err) {
      alert('Gagal menghitung rute alternatif: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearRoute = () => {
    setStartCoord(null);
    setDestinationCoord(null);
    setActiveRoute(null);
    setRouteAlternatives([]);
    setClickMode(null);
  };

  return (
    <div className="futuristic-panel w-full rounded-lg p-4 pointer-events-auto border-t-2" style={{ borderTopColor: 'var(--accent-color)' }}>
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
        <Navigation className="w-5 h-5 text-[var(--accent-color)] animate-pulse" />
        <h2 className="text-md font-mono font-bold tracking-widest text-white uppercase">Perencana Rute</h2>
      </div>

      <div className="space-y-3.5 text-xs text-slate-300">
        {/* Start Coordinates Setup */}
        <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
          <div className="flex items-center justify-between">
            <span className="font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Titik Awal (Start)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleUseGPS('start')}
                className="text-[9px] text-emerald-400 hover:underline cursor-pointer font-bold"
              >
                GPS Saya
              </button>
            </div>
          </div>
          {startCoord ? (
            <p className="font-mono text-[10px] text-slate-200">
              Lat: {startCoord.lat.toFixed(5)}, Lng: {startCoord.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 italic">Belum ditentukan...</p>
          )}

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-[9px] text-slate-500 w-full font-mono">Preset Cepat:</span>
            {JAKARTA_PRESETS.slice(0, 3).map((p, idx) => (
              <button
                key={`start-p-${idx}`}
                onClick={() => handlePresetSelect(p, 'start')}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition text-slate-400 hover:text-white"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Coordinates Setup */}
        <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded border border-slate-850">
          <div className="flex items-center justify-between">
            <span className="font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Titik Tujuan (Destination)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleUseGPS('destination')}
                className="text-[9px] text-rose-400 hover:underline cursor-pointer font-bold"
              >
                GPS Saya
              </button>
            </div>
          </div>
          {destinationCoord ? (
            <p className="font-mono text-[10px] text-slate-200">
              Lat: {destinationCoord.lat.toFixed(5)}, Lng: {destinationCoord.lng.toFixed(5)}
            </p>
          ) : (
            <p className="text-[10px] text-slate-500 italic">Belum ditentukan...</p>
          )}

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-[9px] text-slate-500 w-full font-mono">Preset Cepat:</span>
            {JAKARTA_PRESETS.slice(3, 6).map((p, idx) => (
              <button
                key={`dest-p-${idx}`}
                onClick={() => handlePresetSelect(p, 'destination')}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition text-slate-400 hover:text-white"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Map Clicking Selector Toggle */}
        <div className="flex gap-2 bg-slate-950/20 p-1.5 rounded border border-slate-900">
          <span className="text-[10px] text-slate-500 font-mono self-center">Set lewat klik peta:</span>
          <button
            onClick={() => setClickMode(clickMode === 'start' ? null : 'start')}
            className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition border cursor-pointer ${clickMode === 'start'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow shadow-emerald-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            Mulai
          </button>
          <button
            onClick={() => setClickMode(clickMode === 'destination' ? null : 'destination')}
            className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition border cursor-pointer ${clickMode === 'destination'
              ? 'bg-rose-950/80 border-rose-500 text-rose-400 shadow shadow-rose-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            Tujuan
          </button>
        </div>

        {/* Helper instruction for map click */}
        {clickMode && (
          <div className="bg-[var(--accent-glow)] border border-[var(--accent-color)] rounded p-2 text-center text-[10px] font-semibold text-white animate-pulse">
            Klik lokasi mana saja di peta untuk menentukan Titik {clickMode === 'start' ? 'Awal' : 'Tujuan'}.
          </div>
        )}

        {/* Action triggers */}
        <div className="flex gap-2">
          {activeRoute && (
            <button
              onClick={handleClearRoute}
              className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded px-3.5 py-2 cursor-pointer font-bold font-mono text-center"
              title="Reset Rute"
            >
              RESET
            </button>
          )}
          <button
            onClick={handleCalculateRoute}
            disabled={loading || !startCoord || !destinationCoord}
            className="flex-1 neon-glow-btn rounded py-2 cursor-pointer font-mono font-bold text-center flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed uppercase"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                MENGHITUNG...
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                Cari Rute Aman
              </>
            )}
          </button>
        </div>

        {/* Route Alternatives Selection List */}
        {routeAlternatives.length > 0 && (
          <div className="space-y-2.5 pt-3.5 border-t border-slate-800">
            <span className="block text-xs uppercase tracking-wider text-slate-400 font-mono font-bold">
              Rute Alternatif Ditemukan
            </span>
            <div className="space-y-2">
              {routeAlternatives.map((route) => {
                const isActive = activeRoute && route.id === activeRoute.id;
                const km = (route.distance / 1000).toFixed(1);
                const minutes = Math.ceil(route.duration / 60);

                return (
                  <div
                    key={route.id}
                    onClick={() => setActiveRoute(route)}
                    className={`p-2.5 rounded border cursor-pointer transition ${isActive
                      ? 'border-[var(--accent-color)] bg-slate-900/60 shadow-[0_0_8px_var(--accent-glow)]'
                      : 'border-slate-850 hover:border-slate-750 bg-slate-950/20'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-100">{route.name}</span>
                      <span className="font-mono text-xs text-slate-300">
                        {km} km • {minutes} mnt
                      </span>
                    </div>

                    {/* Safety tags */}
                    {route.isSafe ? (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded w-max">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>RUTE AMAN (Bebas Bahaya)</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-orange-400 font-semibold bg-orange-950/40 border border-orange-900/40 px-1.5 py-0.5 rounded w-max">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span>TERDAPAT {route.hazards.length} POTENSI BAHAYA</span>
                        </div>
                        {/* List hazard names in route */}
                        <div className="flex flex-wrap gap-1 text-[9px] text-slate-500 font-mono">
                          {route.hazards.map((h, hIdx) => {
                            const hazardMeta = {
                              jalanan_rusak: 'Jalan Rusak',
                              lampu_lalu_lintas: 'Lampu Mati',
                              banjir: 'Banjir',
                              pohon_tumbang: 'Pohon Tumbang',
                              other: 'Bahaya Lain'
                            };
                            return (
                              <span key={`h-tag-${hIdx}`} className="bg-slate-950 border border-slate-900 px-1 rounded">
                                • {hazardMeta[h.type] || 'Bahaya'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}