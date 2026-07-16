import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Locate } from 'lucide-react'
import HazardMarkers from './HazardMarkers'
import RouteLayer from './RouteLayer'
import UserMarker from './UserMarker'
import TempMarker from './TempMarker'

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

  // Fly/pan to selected report coordinate on map
  useEffect(() => {
    if (focusedReport && mapRef.current) {
      mapRef.current.flyTo([focusedReport.latitude, focusedReport.longitude], 16, {
        animate: true,
        duration: 1.5
      });
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
