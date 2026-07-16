import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function UserMarker({ mapRef, userLocation, simulatePosition, trackUser }) {
  const userMarkerRef = useRef(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove previous marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
      userMarkerRef.current = null
    }

    // Simulated position takes priority over real GPS
    const position = simulatePosition || userLocation

    if (position) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg shadow-blue-500/50"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      userMarkerRef.current = L.marker(
        [position.lat, position.lng],
        { icon: userIcon }
      ).addTo(map)

      // Pan to user if in simulation mode or tracking is active
      if (simulatePosition || trackUser) {
        map.panTo([position.lat, position.lng])
      }
    }
  }, [userLocation, simulatePosition, mapRef, trackUser])

  return null
}