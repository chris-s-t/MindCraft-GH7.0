import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import HazardMap from './components/HazardMap/HazardMap';
import ReportForm from './components/ReportForm/ReportForm';
import RoutePlanner from './Pages/RoutePlanner';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import GovernmentPanel from './components/GovernmentPanel/GovernmentPanel';
import AdminDashboard from './Pages/AdminDashboard';
import { AlertTriangle, ShieldCheck, Settings, Navigation, AlertCircle } from 'lucide-react';

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
    hazard_level: 'critical',
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

  // Fetch location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Central Jakarta
          setUserLocation({ lat: -6.1754, lng: 106.8272 });
        }
      );
    }
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
        'Jalanan_rusak': 'Jalanan_rusak',
        'Lampu_lalu_lintas': 'Lampu_lalu_lintas',
        'Banjir': 'Banjir',
        'Pohon_tumbang': 'Pohon_tumbang',
        'Other': 'Other'
      };
      const levelMap = {
        'Rendah': 'Rendah',
        'Sedang': 'Sedang',
        'Tinggi': 'Tinggi'
      };
      const statusMap = {
        'Aktif': 'Aktif',
        'Ditangani': 'Ditangani',
        'Selesai': 'Selesai'
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
          'critical': 'Tinggi'
        };
        const statusMapReverse = {
          'pending': 'Aktif',
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
          'critical': 'Tinggi'
        };
        const statusMapReverse = {
          'pending': 'Aktif',
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
            'Ditangani': 'pending',
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
    <main className="w-screen h-screen flex flex-col md:flex-row relative bg-[#060814] text-slate-100 overflow-hidden font-sans">
      {/* 1. Header (Futuristic HUD style) */}
      <header className="absolute top-4 left-4 right-4 z-40 bg-[rgba(10,15,36,0.75)] backdrop-blur-md border border-[var(--border-color)] px-4 py-3 rounded-lg flex items-center justify-between pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--accent-color)] flex items-center justify-center bg-[rgba(var(--accent-color-rgb),0.1)] shadow-[0_0_10px_var(--accent-glow)] animate-pulse">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-color)]" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-extrabold tracking-widest text-white leading-none uppercase select-none">
              MINDCRAFT <span className="text-[var(--accent-color)] neon-text font-black">//</span> SAFEROUTE
            </h1>
            <span className="text-[9px] text-slate-400 font-mono tracking-wider">CROWDSOURCED ROAD HAZARD TRACKING SYSTEM</span>
          </div>
        </div>

        {/* Database Status HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[9px] border px-2 py-0.5 rounded-full bg-slate-950/60" style={{ borderColor: isOfflineMode ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)' }}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOfflineMode ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className={isOfflineMode ? 'text-amber-400' : 'text-emerald-400'}>
              {isOfflineMode ? 'DEMO MODE (LOCAL)' : 'SUPABASE CONNECTED'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] border border-slate-800 px-2 py-0.5 rounded-full bg-slate-950/60 text-slate-300">
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
        />
      </div>

      {/* 3. Floating Left Panel Deck */}
      <div className={`fixed md:absolute bottom-0 md:bottom-4 left-0 md:left-4 right-0 md:right-auto md:top-20 md:w-[460px] z-45 md:z-35 transition-all duration-300 ease-out bg-[rgba(8,12,30,0.95)] md:bg-transparent backdrop-blur-lg md:backdrop-blur-none border-t md:border-t-0 border-[var(--border-color)] rounded-t-2xl md:rounded-t-none flex flex-col pointer-events-auto md:pointer-events-none shadow-2xl md:shadow-none p-4 md:p-0 gap-3 ${isMobileExpanded ? 'h-[75vh]' : 'h-[105px] md:h-auto'}`}>

        {/* Mobile Drag Handle */}
        <div
          className="md:hidden w-full flex flex-col items-center pb-1 cursor-pointer"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="w-12 h-1 bg-slate-700 rounded-full mb-1" />
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
            {isMobileExpanded ? 'Tutup Detail' : 'Ketuk Untuk Detail'}
          </span>
        </div>

        {/* Toggle Menu */}
        <div className="grid grid-cols-3 gap-1 bg-[rgba(10,15,36,0.8)] backdrop-blur-md p-1 rounded-lg border border-[var(--border-color)] pointer-events-auto font-mono text-[10px] tracking-wider shadow-lg">
          <button
            onClick={() => handleTabClick('route')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'route'
              ? 'bg-[var(--accent-color)] text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-950/30'
              }`}
          >
            <Navigation className="w-4 h-4" />
            RUTE
          </button>
          <button
            onClick={() => handleTabClick('gov')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'gov'
              ? 'bg-[var(--accent-color)] text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-950/30'
              }`}
          >
            <ShieldCheck className="w-4 h-4" />
            PEMERINTAH
          </button>
          <button
            onClick={() => handleTabClick('settings')}
            className={`py-2 rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition font-bold ${activePanel === 'settings'
              ? 'bg-[var(--accent-color)] text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-950/30'
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
            />
          )}

          {activePanel === 'gov' && (
            <GovernmentPanel
              reports={allReportsForGov}
              onResolve={handleResolve}
              onOpenAdmin={() => setShowAdminConsole(true)}
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

      {/* 4. Floating Report Trigger Instructions */}
      {!showReportForm && (
        <div className="absolute right-4 top-20 z-30 pointer-events-none hidden lg:block">
          <div className="bg-slate-950/70 backdrop-blur border border-slate-800 p-2.5 rounded shadow-lg max-w-[200px] text-center font-mono text-[9px] text-slate-400 flex flex-col items-center gap-1">
            <AlertCircle className="w-4 h-4 text-[var(--accent-color)] animate-bounce" />
            <span className="text-white font-bold block uppercase tracking-wide">Lapor Cepat</span>
            Klik lokasi mana saja langsung di peta untuk membuka form pelaporan bahaya.
          </div>
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
