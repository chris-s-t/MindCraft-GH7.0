import { useEffect, useRef } from 'react'
import L from 'leaflet'
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

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [setSelectedLocation])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

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
      />
      <TempMarker
        mapRef={mapRef}
        selectedLocation={selectedLocation}
      />
    </div>
  )
}