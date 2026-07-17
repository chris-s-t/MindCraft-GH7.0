import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Locate } from 'lucide-react'
import HazardMarkers from './HazardMarkers'
import RouteLayer from './RouteLayer'
import UserMarker from './UserMarker'
import TempMarker from './TempMarker'
import { HAZARD_TYPES } from '../../lib/hazardTypes'

export default function HazardMap({
  reports,
  onVote,
  selectedLocation,
  setSelectedLocation,
  activeRoute,
  routeAlternatives,
  userLocation,
  simulatePosition,
  alertRange,
  clickMode,
  setClickMode,
  startCoord,
  setStartCoord,
  destinationCoord,
  setDestinationCoord,
  focusedReport,
}) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersGroupRef = useRef(null)
  const routeLayerRef = useRef(null)
  const alertCirclesRef = useRef(null)
  const [trackUser, setTrackUser] = useState(true)

  const handleCenterOnUser = () => {
    const map = mapRef.current
    const position = simulatePosition || userLocation
    if (map && position) {
      map.setView([position.lat, position.lng], 16)
      setTrackUser(true)
    }
  }

  // Fly/pan to selected report coordinate on map and open its popup
  useEffect(() => {
    if (focusedReport && mapRef.current) {
      setTrackUser(false);
      mapRef.current.flyTo([focusedReport.latitude, focusedReport.longitude], 16, {
        animate: true,
        duration: 1.5
      });

      const openReportPopup = () => {
        if (markersGroupRef.current) {
          const markers = markersGroupRef.current.getLayers();
          const marker = markers.find(m => m.reportId === focusedReport.id);
          if (marker) {
            marker.openPopup();
          }
        }
      };

      openReportPopup();
      const timer = setTimeout(openReportPopup, 300);
      return () => clearTimeout(timer);
    }
  }, [focusedReport]);

  // Keep references to state in a Ref to avoid stale closure issues in Leaflet click handler
  const mapStateRef = useRef({
    clickMode,
    setClickMode,
    setStartCoord,
    setDestinationCoord,
    setSelectedLocation
  })

  useEffect(() => {
    mapStateRef.current = {
      clickMode,
      setClickMode,
      setStartCoord,
      setDestinationCoord,
      setSelectedLocation
    }
  }, [clickMode, setClickMode, setStartCoord, setDestinationCoord, setSelectedLocation])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-6.1754, 106.8272], 13)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Initialize all layer groups here
    markersGroupRef.current = L.layerGroup().addTo(map)
    routeLayerRef.current = L.layerGroup().addTo(map)
    alertCirclesRef.current = L.layerGroup().addTo(map)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      const {
        clickMode: latestClickMode,
        setStartCoord: latestSetStart,
        setDestinationCoord: latestSetDest,
        setClickMode: latestSetMode,
        setSelectedLocation: latestSetSelected
      } = mapStateRef.current;

      if (latestClickMode) {
        const label = latestClickMode === 'start' ? 'Titik Awal (Start)' : 'Titik Tujuan (Destination)';
        const confirmSelect = window.confirm(`Apakah Anda yakin ingin menetapkan koordinat (${lat.toFixed(5)}, ${lng.toFixed(5)}) sebagai ${label}?`);

        if (confirmSelect) {
          if (latestClickMode === 'start') {
            latestSetStart({ lat, lng });
          } else {
            latestSetDest({ lat, lng });
          }
          latestSetMode(null);
        }
      } else {
        latestSetSelected({ lat, lng });
      }
    })

    // Disable auto-tracking on user drag/zoom
    map.on('dragstart', () => {
      setTrackUser(false)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Center on User Location Button */}
      <button
        onClick={handleCenterOnUser}
        className={`absolute top-24 right-4 z-[1000] p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
          trackUser ? 'ring-2 ring-orange-500/20' : ''
        }`}
        title="Pusatkan ke Lokasi Saya"
      >
        <Locate className={`w-6 h-6 text-orange-600 transition-all ${trackUser ? 'animate-pulse scale-110' : 'hover:scale-105'}`} />
      </button>

      {/* Map Legend */}
      <div className="absolute top-40 right-4 z-[1000] bg-white/95 backdrop-blur border border-slate-200/80 p-3 rounded-2xl shadow-md w-36 transition-all duration-200 hover:shadow-lg pointer-events-auto select-none">
        <h5 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1 font-mono">
          LEGENDA PETA
        </h5>
        <div className="flex flex-col gap-2">
          {Object.entries(HAZARD_TYPES).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
              <span 
                className="w-2.5 h-2.5 rounded-full border border-white shadow-sm shrink-0" 
                style={{ backgroundColor: value.color }} 
              />
              <span className="truncate leading-none">{value.label}</span>
            </div>
          ))}
        </div>
      </div>

      <HazardMarkers
        mapRef={mapRef}
        markersGroupRef={markersGroupRef}
        alertCirclesRef={alertCirclesRef}
        reports={reports}
        onVote={onVote}
      />
      <RouteLayer
        mapRef={mapRef}
        routeLayerRef={routeLayerRef}
        activeRoute={activeRoute}
        routeAlternatives={routeAlternatives}
      />
      <UserMarker
        mapRef={mapRef}
        userLocation={userLocation}
        simulatePosition={simulatePosition}
        trackUser={trackUser}
      />
      <TempMarker
        mapRef={mapRef}
        selectedLocation={selectedLocation}
      />
    </div>
  )
}
