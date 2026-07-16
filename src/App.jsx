import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import HazardMap from './components/HazardMap/HazardMap';
import ReportForm from './components/ReportForm/ReportForm';
import RoutePlanner from './Pages/RoutePlanner';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import GovernmentPanel from './components/GovernmentPanel/GovernmentPanel';
import AdminDashboard from './Pages/AdminDashboard';
import { AlertTriangle, ShieldCheck, Settings, Navigation, AlertCircle, HelpCircle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

const MOCK_REPORTS = [
  {
    id: 'mock-1',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    type: 'banjir',
    title: 'Genangan Air Semanggi',
    description: 'Hujan deras mengakibatkan genangan setinggi 30cm di jalan raya Semanggi mengarah ke Kuningan. Lalu lintas padat merayap, harap cari rute alternatif.',
    photo_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80',
    latitude: -6.2195,
    longitude: 106.8150,
    hazard_level: 'high',
    upvotes: 24,
    downvotes: 2,
    status: 'pending'
  },
  {
    id: 'mock-2',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    type: 'jalanan_rusak',
    title: 'Lubang Besar Rasuna Said',
    description: 'Lubang berdiameter sekitar 50cm di lajur tengah. Sangat membahayakan pengendara roda dua, terutama di malam hari karena minim penerangan.',
    photo_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80',
    latitude: -6.2230,
    longitude: 106.8290,
    hazard_level: 'medium',
    upvotes: 12,
    downvotes: 1,
    status: 'pending'
  },
  {
    id: 'mock-3',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    type: 'pohon_tumbang',
    title: 'Pohon Roboh di Menteng',
    description: 'Pohon beringin besar roboh menghalangi seluruh jalan Menteng Raya. Arus lalu lintas dialihkan sementara lewat jalan alternatif.',
    photo_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
    latitude: -6.1950,
    longitude: 106.8320,
    hazard_level: 'high',
    upvotes: 45,
    downvotes: 0,
    status: 'pending'
  },
  {
    id: 'mock-4',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    type: 'lampu_lalu_lintas',
    title: 'Traffic Light Kuningan Padam',
    description: 'Lampu lalu lintas di persimpangan Kuningan mati total. Lalu lintas tidak beraturan, harap berhati-hati saat melintas.',
    photo_url: '',
    latitude: -6.2300,
    longitude: 106.8250,
    hazard_level: 'high',
    upvotes: 18,
    downvotes: 3,
    status: 'pending'
  }
];

async function checkImageNSFW(imageUrl) {
  // Load model once
  const model = await nsfwjs.load()

  // Create an image element
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageUrl

  await new Promise((resolve) => { img.onload = resolve })

  // Classify
  const predictions = await model.classify(img)

  // predictions looks like:
  // [{ className: 'Porn', probability: 0.92 }, { className: 'Safe', probability: 0.05 }, ...]

  const unsafe = predictions.find(
    (p) => ['Porn', 'Hentai', 'Sexy'].includes(p.className) && p.probability > 0.7
  )

  return !!unsafe // returns true if NSFW
}

export default function App() {
  const [reports, setReports] = useState([]);
  const [resolvedReports, setResolvedReports] = useState(() => {
    const saved = localStorage.getItem('mindcraft_resolved_reports');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Layout UI states
  const [activePanel, setActivePanel] = useState('route'); // 'route' | 'gov' | 'settings'
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [showQuickReportTooltip, setShowQuickReportTooltip] = useState(false);
  const [clickMode, setClickMode] = useState(null); // 'start' | 'destination' | null
  const [focusedReport, setFocusedReport] = useState(null);

  const handleTabClick = (panel) => {
    setActivePanel(panel);
    setIsMobileExpanded(true);
  };

  // Map & Navigation states
  const [startCoord, setStartCoord] = useState(null);
  const [destinationCoord, setDestinationCoord] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeAlternatives, setRouteAlternatives] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [simulatePosition, setSimulatePosition] = useState(null);

  // Audio warning preferences
  const [alertRange, setAlertRange] = useState(200);
  const [enableVoice, setEnableVoice] = useState(true);
  const [enableBeeps, setEnableBeeps] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch location in real-time
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: -6.1754, lng: 106.8272 });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error watching geolocation:", error);
        setUserLocation((curr) => curr || { lat: -6.1754, lng: 106.8272 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Fetch reports from Supabase (fallback to LocalStorage)
  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*');

      if (error) throw error;

      // Define mappings based on new strict DDL enums
      const typeMap = {
        'Jalanan_rusak': 'jalanan_rusak',
        'Lampu_lalu_lintas': 'lampu_lalu_lintas',
        'Banjir': 'banjir',
        'Pohon_tumbang': 'pohon_tumbang',
        'Other': 'other'
      };
      const levelMap = {
        'Rendah': 'low',
        'Sedang': 'medium',
        'Tinggi': 'high'
      };
      const statusMap = {
        'Aktif': 'pending',
        'Ditangani': 'working',
        'Selesai': 'resolved'
      };

      if (data && data.length > 0) {
        // Map from DB format to App format
        const mappedData = data.map(dbItem => ({
          id: dbItem.id,
          created_at: dbItem.created_at,
          type: typeMap[dbItem.jenis] || 'other',
          title: dbItem.judul,
          description: dbItem.deskripsi,
          photo_url: dbItem.foto_url,
          latitude: dbItem.lat,
          longitude: dbItem.lng,
          display_name: dbItem.display_name || `Lokasi (${dbItem.lat}, ${dbItem.lng})`,
          hazard_level: levelMap[dbItem.hazard_level] || 'medium',
          upvotes: dbItem.upvotes || 0,
          downvotes: dbItem.downvotes || 0,
          status: statusMap[dbItem.status] || 'pending'
        }));

        setReports(mappedData);
        localStorage.setItem('mindcraft_reports', JSON.stringify(mappedData));
        setIsOfflineMode(false);
      } else {
        // Table exists but empty, seed with initial mock data mapped to new DB format
        const typeMapReverse = {
          'jalanan_rusak': 'Jalanan_rusak',
          'lampu_lalu_lintas': 'Lampu_lalu_lintas',
          'banjir': 'Banjir',
          'pohon_tumbang': 'Pohon_tumbang',
          'other': 'Other'
        };
        const levelMapReverse = {
          'low': 'Rendah',
          'medium': 'Sedang',
          'high': 'Tinggi',
        };
        const statusMapReverse = {
          'pending': 'Aktif',
          'working': 'Ditangani',
          'resolved': 'Selesai'
        };

        const dbMockData = MOCK_REPORTS.map(r => ({
          jenis: typeMapReverse[r.type] || 'Other',
          judul: r.title,
          deskripsi: r.description,
          foto_url: r.photo_url,
          lat: r.latitude,
          lng: r.longitude,
          display_name: r.display_name || `Lokasi (${r.latitude}, ${r.longitude})`,
          hazard_level: levelMapReverse[r.hazard_level] || 'Sedang',
          upvotes: r.upvotes,
          downvotes: r.downvotes,
          status: statusMapReverse[r.status] || 'Aktif',
          created_at: r.created_at
        }));

        try {
          const { error: seedError } = await supabase.from('reports').insert(dbMockData);
          if (seedError) {
            console.warn("Could not seed Supabase database due to RLS policies. Continuing with empty DB.", seedError);
          }
        } catch (e) {
          console.warn("Failed seeding database:", e);
        }

        // Re-fetch
        const { data: seededData } = await supabase.from('reports').select('*');
        if (seededData && seededData.length > 0) {
          const mappedSeeded = seededData.map(dbItem => ({
            id: dbItem.id,
            created_at: dbItem.created_at,
            type: typeMap[dbItem.jenis] || 'other',
            title: dbItem.judul,
            description: dbItem.deskripsi,
            photo_url: dbItem.foto_url,
            latitude: dbItem.lat,
            longitude: dbItem.lng,
            display_name: dbItem.display_name || `Lokasi (${dbItem.lat}, ${dbItem.lng})`,
            hazard_level: levelMap[dbItem.hazard_level] || 'medium',
            upvotes: dbItem.upvotes || 0,
            downvotes: dbItem.downvotes || 0,
            status: statusMap[dbItem.status] || 'pending'
          }));
          setReports(mappedSeeded);
        } else {
          setReports([]);
        }
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn("Failed fetching Supabase data, falling back to LocalStorage:", err);
      setIsOfflineMode(true);

      const localData = localStorage.getItem('mindcraft_reports');
      if (localData) {
        setReports(JSON.parse(localData));
      } else {
        setReports(MOCK_REPORTS);
        localStorage.setItem('mindcraft_reports', JSON.stringify(MOCK_REPORTS));
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Submit hazard report
  const handleReportSubmit = async (newReport) => {
    if (newReport.photo_url) {
      const isNSFW = await checkImageNSFW(newReport.photo_url);
      if (isNSFW) {
        alert("Penyampaian Laporan Ditolak: Foto yang Anda lampirkan terdeteksi mengandung konten tidak pantas atau NSFW. Harap gunakan foto asli terkait kondisi jalanan.");
        return; // Hentikan penyimpanan data
      }
    }

    const tempId = `rep-${Date.now()}`;
    const reportToSave = {
      ...newReport,
      id: isOfflineMode ? tempId : undefined,
      created_at: new Date().toISOString()
    };

    if (isOfflineMode) {
      const updated = [reportToSave, ...reports];
      setReports(updated);
      localStorage.setItem('mindcraft_reports', JSON.stringify(updated));
    } else {
      try {
        // Map App format to DB format
        const typeMapReverse = {
          'jalanan_rusak': 'Jalanan_rusak',
          'lampu_lalu_lintas': 'Lampu_lalu_lintas',
          'banjir': 'Banjir',
          'pohon_tumbang': 'Pohon_tumbang',
          'other': 'Other'
        };
        const levelMapReverse = {
          'low': 'Rendah',
          'medium': 'Sedang',
          'high': 'Tinggi',
        };
        const statusMapReverse = {
          'pending': 'Aktif',
          'working': 'Ditangani',
          'resolved': 'Selesai'
        };

        const dbReport = {
          jenis: typeMapReverse[reportToSave.type] || 'Other',
          judul: reportToSave.title,
          deskripsi: reportToSave.description,
          foto_url: reportToSave.photo_url,
          lat: reportToSave.latitude,
          lng: reportToSave.longitude,
          display_name: reportToSave.display_name,
          hazard_level: levelMapReverse[reportToSave.hazard_level] || 'Sedang',
          upvotes: reportToSave.upvotes,
          downvotes: reportToSave.downvotes,
          status: statusMapReverse[reportToSave.status] || 'Aktif',
          created_at: reportToSave.created_at
        };

        const { data, error } = await supabase
          .from('reports')
          .insert([dbReport])
          .select();

        if (error) throw error;

        if (data) {
          // Map DB response back to App format
          const typeMap = {
            'Jalanan_rusak': 'jalanan_rusak',
            'Lampu_lalu_lintas': 'lampu_lalu_lintas',
            'Banjir': 'banjir',
            'Pohon_tumbang': 'pohon_tumbang',
            'Other': 'other'
          };
          const levelMap = {
            'Rendah': 'low',
            'Sedang': 'medium',
            'Tinggi': 'high'
          };
          const statusMap = {
            'Aktif': 'pending',
            'Ditangani': 'working',
            'Selesai': 'resolved'
          };

          const insertedReport = {
            id: data[0].id,
            created_at: data[0].created_at,
            type: typeMap[data[0].jenis] || 'other',
            title: data[0].judul,
            description: data[0].deskripsi,
            photo_url: data[0].foto_url,
            latitude: data[0].lat,
            longitude: data[0].lng,
            display_name: data[0].display_name,
            hazard_level: levelMap[data[0].hazard_level] || 'medium',
            upvotes: data[0].upvotes || 0,
            downvotes: data[0].downvotes || 0,
            status: statusMap[data[0].status] || 'pending'
          };
          setReports([insertedReport, ...reports]);
        }
      } catch (err) {
        console.error("Supabase insert failed:", err);
        alert(`Gagal menyimpan laporan ke Supabase: \nError: ${err.message || err} \nDetail: ${err.details || 'Tidak ada'} \nHint: ${err.hint || 'Tidak ada'}\n\nLaporan Anda sementara disimpan di browser (LocalStorage).`);
        const updated = [{ ...reportToSave, id: tempId }, ...reports];
        setReports(updated);
        localStorage.setItem('mindcraft_reports', JSON.stringify(updated));
      }
    }

    // Clear selections
    setSelectedLocation(null);
    setShowReportForm(false);
  };

  // Upvote/Downvote handler
  const handleVote = async (id, voteField) => {
    const updatedReports = reports.map((r) => {
      if (r.id === id) {
        return { ...r, [voteField]: (r[voteField] || 0) + 1 };
      }
      return r;
    });
    setReports(updatedReports);
    localStorage.setItem('mindcraft_reports', JSON.stringify(updatedReports));

    if (!isOfflineMode) {
      try {
        const currentReport = reports.find(r => r.id === id);
        if (currentReport) {
          const newVal = (currentReport[voteField] || 0) + 1;
          await supabase
            .from('reports')
            .update({ [voteField]: newVal })
            .eq('id', id);
        }
      } catch (err) {
        console.error("Voting sync failed:", err);
      }
    }
  };

  // Mark hazard as resolved (Government Action)
  const handleResolve = async (id) => {
    const updatedReports = reports.map((r) => {
      if (r.id === id) {
        return { ...r, status: 'resolved' };
      }
      return r;
    });
    setReports(updatedReports);
    localStorage.setItem('mindcraft_reports', JSON.stringify(updatedReports));

    // Update locally resolved reports as well for offline display sync
    const reportToResolve = reports.find(r => r.id === id);
    if (reportToResolve) {
      const resolvedItem = { ...reportToResolve, status: 'resolved' };
      const newResolvedList = [resolvedItem, ...resolvedReports];
      setResolvedReports(newResolvedList);
      localStorage.setItem('mindcraft_resolved_reports', JSON.stringify(newResolvedList));
    }

    if (!isOfflineMode) {
      try {
        await supabase
          .from('reports')
          .update({ status: 'Selesai' })
          .eq('id', id);
      } catch (err) {
        console.error("Resolution sync failed:", err);
      }
    }
  };

  // Trigger report form on coordinates selection
  useEffect(() => {
    if (selectedLocation) {
      setShowReportForm(true);
    }
  }, [selectedLocation]);

  const allReportsForGov = [
    ...reports,
    ...resolvedReports.filter(rr => !reports.some(r => r.id === rr.id)).map(r => ({ ...r, status: 'resolved' }))
  ];

  return (
    <main className="w-screen h-screen flex flex-col md:flex-row relative bg-[var(--bg-dark)] text-slate-800 overflow-hidden font-sans">
      {/* 1. Header (Google Maps clean search/header style) */}
      <header className="absolute top-4 left-4 right-4 z-40 bg-[var(--bg-panel)] border border-[var(--border-color)] px-4 py-3 rounded-xl flex items-center justify-between pointer-events-auto shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--accent-color)] flex items-center justify-center bg-[rgba(var(--accent-color-rgb),0.06)] shadow-[0_0_10px_var(--accent-glow)]">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-color)]" />
          </div>
          <div>
            <h1 className="text-sm font-sans font-black tracking-wider text-slate-800 leading-none uppercase select-none">
              MINDCRAFT <span className="text-[var(--accent-color)] font-black">//</span> SAFEROUTE
            </h1>
            <span className="text-[11px] text-slate-500 font-mono tracking-wider">SISTEM PELAPORAN BAHAYA JALAN BERBASIS KOMUNITAS</span>
          </div>
        </div>

        {/* Database Status HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[9px] border px-2 py-0.5 rounded-full bg-slate-100/80 border-slate-200" style={{ color: isOfflineMode ? '#b45309' : '#047857' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOfflineMode ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>
              {isOfflineMode ? 'DEMO MODE (LOCAL)' : 'DATABASE TERHUBUNG'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] border border-slate-200 px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-600">
            <span>HAZARDS: {reports.filter(r => r.status !== 'resolved').length} AKTIF</span>
          </div>
        </div>
      </header>

      {/* 2. Interactive Map (Full background) */}
      <div className="absolute inset-0 z-0">
        <HazardMap
          reports={reports}
          onVote={handleVote}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          startCoord={startCoord}
          setStartCoord={setStartCoord}
          destinationCoord={destinationCoord}
          setDestinationCoord={setDestinationCoord}
          activeRoute={activeRoute}
          routeAlternatives={routeAlternatives}
          userLocation={userLocation}
          simulatePosition={simulatePosition}
          alertRange={alertRange}
          clickMode={clickMode}
          setClickMode={setClickMode}
          focusedReport={focusedReport}
        />
      </div>

      {/* 3. Floating Left Panel Deck */}
      <div className={`fixed md:absolute bottom-0 md:bottom-4 left-0 md:left-4 right-0 md:right-auto md:top-20 md:w-[460px] z-45 md:z-35 transition-all duration-300 ease-out bg-[var(--bg-panel)] md:bg-transparent backdrop-blur-lg md:backdrop-blur-none border-t md:border-t-0 border-[var(--border-color)] rounded-t-2xl md:rounded-t-none flex flex-col pointer-events-auto md:pointer-events-none shadow-2xl md:shadow-none p-4 md:p-0 gap-3 md:h-[calc(100vh-96px)] ${isMobileExpanded ? 'h-[75vh]' : 'h-[105px]'}`}>

        {/* Mobile Drag Handle */}
        <div
          className="md:hidden w-full flex flex-col items-center pb-1 cursor-pointer"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="w-12 h-1 bg-slate-300 rounded-full mb-1" />
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            {isMobileExpanded ? 'Tutup Detail' : 'Ketuk Untuk Detail'}
          </span>
        </div>

        {/* Toggle Menu */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-[var(--border-color)] pointer-events-auto font-mono text-[10px] tracking-wider shadow-sm">
          <button
            onClick={() => handleTabClick('route')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'route'
              ? 'bg-[var(--accent-color)] text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
          >
            <Navigation className="w-4 h-4" />
            RUTE
          </button>
          <button
            onClick={() => handleTabClick('gov')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'gov'
              ? 'bg-[var(--accent-color)] text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            PEMERINTAH
          </button>
          <button
            onClick={() => handleTabClick('settings')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'settings'
              ? 'bg-[var(--accent-color)] text-white shadow-sm font-black'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
          >
            <Settings className="w-4 h-4" />
            PENGATURAN
          </button>
        </div>

        {/* Panel Container */}
        <div className={`flex-1 overflow-hidden pointer-events-auto select-text flex flex-col justify-start pb-4 md:pb-0 ${isMobileExpanded ? 'flex' : 'hidden md:flex'}`}>
          {activePanel === 'route' && (
            <RoutePlanner
              reports={reports}
              startCoord={startCoord}
              setStartCoord={setStartCoord}
              destinationCoord={destinationCoord}
              setDestinationCoord={setDestinationCoord}
              activeRoute={activeRoute}
              setActiveRoute={setActiveRoute}
              routeAlternatives={routeAlternatives}
              setRouteAlternatives={setRouteAlternatives}
              userLocation={userLocation}
              clickMode={clickMode}
              setClickMode={setClickMode}
              onSelectReport={setFocusedReport}
            />
          )}

          {activePanel === 'gov' && (
            <GovernmentPanel
              reports={allReportsForGov}
              onResolve={handleResolve}
              onOpenAdmin={() => setShowAdminConsole(true)}
              onSelectReport={setFocusedReport}
            />
          )}

          {activePanel === 'settings' && (
            <SettingsPanel
              activeRoute={activeRoute}
              onSimulatePositionChange={setSimulatePosition}
              isSimulating={isSimulating}
              setIsSimulating={setIsSimulating}
              alertRange={alertRange}
              setAlertRange={setAlertRange}
              enableVoice={enableVoice}
              setEnableVoice={setEnableVoice}
              enableBeeps={enableBeeps}
              setEnableBeeps={setEnableBeeps}
            />
          )}
        </div>
      </div>

      {/* 4. Floating Report Trigger Instructions (Google Maps Style Help Popover) */}
      {!showReportForm && (
        <div className="absolute right-[14px] bottom-[92px] z-35 flex items-center pointer-events-none">
          {/* Tooltip Popover (Appears on hover to the left/top-left of the question mark button) */}
          {showQuickReportTooltip && (
            <div className="absolute right-[38px] bottom-0 z-40 bg-white border border-slate-200 p-3 rounded-xl shadow-lg w-[220px] text-xs text-slate-600 animate-fadeIn pointer-events-auto">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-[var(--accent-color)] animate-bounce" />
                Lapor Cepat
              </div>
              <p className="leading-snug text-slate-500">
                Klik lokasi mana saja langsung di peta untuk membuka form pelaporan bahaya.
              </p>
            </div>
          )}

          {/* Circular Question Mark Help Button */}
          <button
            type="button"
            onMouseEnter={() => setShowQuickReportTooltip(true)}
            onMouseLeave={() => setShowQuickReportTooltip(false)}
            onClick={() => setShowQuickReportTooltip(!showQuickReportTooltip)}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-md hover:shadow-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer pointer-events-auto"
            title="Petunjuk Lapor Cepat"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Report Overlay Modal (Pops up when coordinate is clicked on map) */}
      {showReportForm && (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md">
            <ReportForm
              selectedLocation={selectedLocation}
              onClose={() => {
                setSelectedLocation(null);
                setShowReportForm(false);
              }}
              onSubmit={handleReportSubmit}
              userLocation={userLocation}
            />
          </div>
        </div>
      )}

      {/* 6. Fullscreen Database Management Console */}
      {showAdminConsole && (
        <AdminDashboard
          reports={allReportsForGov}
          fetchReports={fetchReports}
          onResolve={handleResolve}
          isOfflineMode={isOfflineMode}
          onClose={() => setShowAdminConsole(false)}
        />
      )}
    </main>
  );
}
