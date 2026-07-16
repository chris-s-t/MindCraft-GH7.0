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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-6.1754, 106.8272], 13)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Initialize all layer groups here
    markersGroupRef.current = L.layerGroup().addTo(map)
    routeLayerRef.current = L.layerGroup().addTo(map)
    alertCirclesRef.current = L.layerGroup().addTo(map)

    map.on('click', (e) => {
      const { lat, lng } = e.latlng
      setSelectedLocation({ lat, lng })
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
  }, [setSelectedLocation])

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
