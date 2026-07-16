import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function TempMarker({ mapRef, selectedLocation }) {
  const tempMarkerRef = useRef(null)

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Remove previous temp marker if it exists
    if (tempMarkerRef.current) {
      map.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }

    // If a location is selected, place a new temp marker
    if (selectedLocation) {
      const crosshairIcon = L.divIcon({
        className: 'temp-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 border-2 border-dashed border-red-500 rounded-full animate-spin"></div>
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      tempMarkerRef.current = L.marker(
        [selectedLocation.lat, selectedLocation.lng],
        { icon: crosshairIcon }
      ).addTo(map)

      map.panTo([selectedLocation.lat, selectedLocation.lng])
    }
  }, [selectedLocation, mapRef])

  return null
}