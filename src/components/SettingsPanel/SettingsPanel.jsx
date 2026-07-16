// SettingsPanel Component - Customizes ambient colors, audio alert systems, and navigation simulation
import { useState, useEffect } from 'react';
import { Settings, Volume2, ShieldAlert, Play, Square, Sliders, Check } from 'lucide-react';
import { playAlertSynth, speakWarning, resetWarningCache } from '../../utils/audioWarning';
import { getDistance } from '../../utils/routing';

// Google Maps theme presets
const COLOR_PRESETS = [
  { id: 'blue', label: 'Google Blue', color: '#1a73e8', rgb: '26, 115, 232' },
  { id: 'green', label: 'Google Green', color: '#1e8e3e', rgb: '30, 142, 62' },
  { id: 'yellow', label: 'Google Yellow', color: '#f9ab00', rgb: '249, 171, 0' },
  { id: 'red', label: 'Google Red', color: '#d93025', rgb: '217, 48, 37' },
  { id: 'teal', label: 'Google Teal', color: '#00838f', rgb: '0, 131, 143' }
];

export default function SettingsPanel({
  activeRoute,
  onSimulatePositionChange,
  isSimulating,
  setIsSimulating,
  alertRange,
  setAlertRange,
  enableVoice,
  setEnableVoice,
  enableBeeps,
  setEnableBeeps
}) {
  const [selectedColor, setSelectedColor] = useState('blue');
  const [simIntervalId, setSimIntervalId] = useState(null);
  const [simIndex, setSimIndex] = useState(0);
  const [simSpeed, setSimSpeed] = useState(3); // coordinates per tick
  const [detectedHazard, setDetectedHazard] = useState(null);

  // Apply Ambient Color
  const handleColorChange = (preset) => {
    setSelectedColor(preset.id);
    document.documentElement.style.setProperty('--accent-color', preset.color);
    document.documentElement.style.setProperty('--accent-color-rgb', preset.rgb);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${preset.rgb}, 0.15)`);
    document.documentElement.style.setProperty('--accent-glow-strong', `rgba(${preset.rgb}, 0.3)`);
    document.documentElement.style.setProperty('--border-color', '#dadce0');
    document.documentElement.style.setProperty('--border-color-hover', '#bdc1c6');
  };

  // Run Navigation Simulation
  useEffect(() => {
    if (!isSimulating) {
      if (simIntervalId) {
        clearInterval(simIntervalId);
        setSimIntervalId(null);
      }
      setSimIndex(0);
      onSimulatePositionChange(null);
      setDetectedHazard(null);
      return;
    }

    if (!activeRoute || activeRoute.coordinates.length === 0) {
      alert('Silakan pilih rute terlebih dahulu sebelum memulai simulasi.');
      setIsSimulating(false);
      return;
    }

    resetWarningCache(); // Clear spoken logs to re-trigger warnings
    const coords = activeRoute.coordinates;
    setSimIndex(0);
    onSimulatePositionChange({ lat: coords[0][0], lng: coords[0][1] });

    let currentIdx = 0;
    const interval = setInterval(() => {
      // Step forward by speed multiplier
      currentIdx += simSpeed;
      if (currentIdx >= coords.length - 1) {
        currentIdx = coords.length - 1;
        onSimulatePositionChange({ lat: coords[currentIdx][0], lng: coords[currentIdx][1] });
        setIsSimulating(false); // Stop simulation at the destination
        clearInterval(interval);
        speakWarning("Simulasi selesai. Anda telah sampai di tujuan.", "sim-end");
        return;
      }

      const currentPos = { lat: coords[currentIdx][0], lng: coords[currentIdx][1] };
      setSimIndex(currentIdx);
      onSimulatePositionChange(currentPos);

      // Check for hazards along the active route
      if (activeRoute.hazards && activeRoute.hazards.length > 0) {
        let nearestHazard = null;
        let minDistance = Infinity;

        activeRoute.hazards.forEach((hazard) => {
          const dist = getDistance(currentPos.lat, currentPos.lng, hazard.latitude, hazard.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearestHazard = { ...hazard, distance: dist };
          }
        });

        // Trigger warning if within range
        if (nearestHazard && minDistance <= alertRange) {
          setDetectedHazard({
            title: nearestHazard.title,
            type: nearestHazard.type,
            distance: Math.round(minDistance)
          });

          // Play synth warning chirp
          if (enableBeeps) {
            playAlertSynth();
          }

          // Voice warning TTS
          if (enableVoice) {
            const typesIndo = {
              jalanan_rusak: 'jalan rusak',
              lampu_lalu_lintas: 'lampu lalu lintas bermasalah',
              banjir: 'banjir atau genangan air',
              pohon_tumbang: 'pohon tumbang',
              other: 'bahaya jalanan'
            };
            const hazardText = typesIndo[nearestHazard.type] || 'bahaya';
            const speechText = `Peringatan: terdapat ${hazardText} sekitar ${Math.round(minDistance)} meter di depan.`;
            speakWarning(speechText, nearestHazard.id);
          }
        } else {
          setDetectedHazard(null);
        }
      }
    }, 1000);

    setSimIntervalId(interval);

    return () => {
      clearInterval(interval);
    };
  }, [isSimulating, simSpeed]);

  // Handle changing speed in middle of simulation
  useEffect(() => {
    if (isSimulating && simIntervalId) {
      // Re-trigger simulation with new speed without resetting index
      clearInterval(simIntervalId);
      const coords = activeRoute.coordinates;
      let currentIdx = simIndex;

      const interval = setInterval(() => {
        currentIdx += simSpeed;
        if (currentIdx >= coords.length - 1) {
          currentIdx = coords.length - 1;
          onSimulatePositionChange({ lat: coords[currentIdx][0], lng: coords[currentIdx][1] });
          setIsSimulating(false);
          clearInterval(interval);
          speakWarning("Simulasi selesai. Anda telah sampai di tujuan.", "sim-end");
          return;
        }

        const currentPos = { lat: coords[currentIdx][0], lng: coords[currentIdx][1] };
        setSimIndex(currentIdx);
        onSimulatePositionChange(currentPos);

        if (activeRoute.hazards && activeRoute.hazards.length > 0) {
          let nearestHazard = null;
          let minDistance = Infinity;

          activeRoute.hazards.forEach((hazard) => {
            const dist = getDistance(currentPos.lat, currentPos.lng, hazard.latitude, hazard.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearestHazard = { ...hazard, distance: dist };
            }
          });

          if (nearestHazard && minDistance <= alertRange) {
            setDetectedHazard({
              title: nearestHazard.title,
              type: nearestHazard.type,
              distance: Math.round(minDistance)
            });

            if (enableBeeps) playAlertSynth();
            if (enableVoice) {
              const typesIndo = {
                jalanan_rusak: 'jalan rusak',
                lampu_lalu_lintas: 'lampu lalu lintas bermasalah',
                banjir: 'banjir atau genangan air',
                pohon_tumbang: 'pohon tumbang',
                other: 'bahaya jalanan'
              };
              const hazardText = typesIndo[nearestHazard.type] || 'bahaya';
              const speechText = `Peringatan: terdapat ${hazardText} sekitar ${Math.round(minDistance)} meter di depan.`;
              speakWarning(speechText, nearestHazard.id);
            }
          } else {
            setDetectedHazard(null);
          }
        }
      }, 1000);
      setSimIntervalId(interval);
    }
  }, [simSpeed]);

  return (
    <div className="futuristic-panel w-full rounded-lg p-4 pointer-events-auto border-t-2 flex flex-col h-full overflow-hidden" style={{ borderTopColor: 'var(--accent-color)' }}>
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
        <Settings className="w-5 h-5 text-[var(--accent-color)] animate-spin-slow" />
        <h2 className="text-md font-mono font-bold tracking-widest text-white uppercase">Sistem Pengaturan</h2>
      </div>

      <div className="space-y-4 text-sm text-slate-600 flex-1 overflow-y-auto pr-1">
        {/* 1. Accent Color Customizer */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-2">Ambient Ambient Glow</label>
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-800">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleColorChange(preset)}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition transform hover:scale-110 cursor-pointer`}
                style={{
                  backgroundColor: preset.color,
                  borderColor: selectedColor === preset.id ? '#ffffff' : 'rgba(255,255,255,0.1)',
                  boxShadow: selectedColor === preset.id ? `0 0 12px ${preset.color}` : 'none'
                }}
                title={preset.label}
              >
                {selectedColor === preset.id && <Check className="w-4 h-4 text-slate-900 font-bold" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Audio Control Panel */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            Pengaturan Suara
          </label>
          <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 rounded border border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Aktifkan Alarm Beep Synth</span>
              <input
                type="checkbox"
                checked={enableBeeps}
                onChange={(e) => setEnableBeeps(e.target.checked)}
                className="rounded accent-[var(--accent-color)]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs">Aktifkan Voice warning (TTS)</span>
              <input
                type="checkbox"
                checked={enableVoice}
                onChange={(e) => setEnableVoice(e.target.checked)}
                className="rounded accent-[var(--accent-color)]"
              />
            </label>
            
            {/* Alert range slider */}
            <div className="pt-1.5 border-t border-slate-800/60 mt-1">
              <div className="flex justify-between text-[11px] mb-1 font-mono">
                <span className="text-slate-400">Jarak Peringatan:</span>
                <span className="text-white font-bold">{alertRange} meter</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={alertRange}
                onChange={(e) => setAlertRange(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
              />
            </div>
          </div>
        </div>

        {/* 3. Driving Simulator HUD */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            Simulator Perjalanan (GPS)
          </label>
          <div className="bg-slate-50 p-2.5 rounded border border-slate-800 space-y-2">
            {!activeRoute ? (
              <p className="text-xs text-slate-500 text-center py-2 font-mono">
                Rencanakan rute alternatif di panel kiri untuk mengaktifkan simulasi.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {!isSimulating ? (
                    <button
                      onClick={() => setIsSimulating(true)}
                      className="w-full neon-glow-btn rounded py-1.5 flex items-center justify-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      MULAI SIMULASI
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsSimulating(false)}
                      className="w-full bg-red-950/60 border border-red-500 text-red-300 hover:bg-red-900/60 rounded py-1.5 flex items-center justify-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      HENTIKAN SIMULASI
                    </button>
                  )}
                </div>

                {isSimulating && (
                  <div className="space-y-1.5 pt-1 font-mono">
                    {/* Speed Selector */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Kecepatan:</span>
                      <div className="flex gap-1.5">
                        {[1, 3, 5].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setSimSpeed(speed)}
                            className={`px-1.5 py-0.5 rounded border text-[9px] transition ${
                              simSpeed === speed
                                ? 'border-[var(--accent-color)] text-white bg-[var(--accent-glow)]'
                                : 'border-slate-800 text-slate-400 bg-transparent'
                            }`}
                          >
                            {speed === 1 ? 'Lambat' : speed === 3 ? 'Sedang' : 'Cepat'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress HUD bar */}
                    <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                      <div
                        className="bg-[var(--accent-color)] h-full transition-all duration-300"
                        style={{ width: `${(simIndex / activeRoute.coordinates.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Real-time proximity radar alarm panel */}
        {isSimulating && detectedHazard && (
          <div className="bg-red-950/40 border border-red-500 rounded p-2.5 flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="font-mono text-xs">
              <span className="text-red-400 font-bold block uppercase tracking-wider text-[10px]">RADAR WARNING AHEAD!</span>
              <span className="text-slate-100 font-bold block">{detectedHazard.title}</span>
              <span className="text-slate-400 block text-[10px]">Jarak: <span className="text-white font-bold">{detectedHazard.distance}m</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
