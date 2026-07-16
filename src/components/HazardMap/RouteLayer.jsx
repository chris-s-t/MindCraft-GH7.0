import { useEffect } from 'react'
import L from 'leaflet'

export default function RouteLayer({ mapRef, routeLayerRef, activeRoute, routeAlternatives }) {
  useEffect(() => {
    const map = mapRef.current
    const routeLayer = routeLayerRef.current
    if (!map || !routeLayer) return

    routeLayer.clearLayers()

    if (routeAlternatives && routeAlternatives.length > 0) {
      routeAlternatives.forEach((alt) => {
        if (activeRoute && alt.id === activeRoute.id) return

        const color = alt.isSafe ? '#475569' : '#b45309'

        L.polyline(alt.coordinates, {
          color: color,
          weight: 4,
          opacity: 0.4,
          dashArray: alt.isSafe ? '' : '5, 8'
        }).addTo(routeLayer)
      })
    }

    if (activeRoute) {
      const color = activeRoute.isSafe ? 'var(--accent-color)' : '#f97316'

      L.polyline(activeRoute.coordinates, {
        color: color,
        weight: 9,
        opacity: 0.15
      }).addTo(routeLayer)

      const mainPath = L.polyline(activeRoute.coordinates, {
        color: color,
        weight: 4,
        opacity: 0.9,
        dashArray: activeRoute.isSafe ? '' : '6, 6'
      }).addTo(routeLayer)

      map.fitBounds(mainPath.getBounds(), { padding: [50, 50] })

      const startPoint = activeRoute.coordinates[0]
      const startIcon = L.divIcon({
        className: 'start-marker',
        html: `<div class="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-4 ring-emerald-500/30"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
      L.marker(startPoint, { icon: startIcon }).addTo(routeLayer)
        .bindPopup('<span class="text-xs font-bold font-mono text-emerald-400">TITIK AWAL</span>')

      const endPoint = activeRoute.coordinates[activeRoute.coordinates.length - 1]
      const endIcon = L.divIcon({
        className: 'end-marker',
        html: `<div class="w-4 h-4 bg-rose-500 border-2 border-white rounded-full ring-4 ring-rose-500/30 animate-pulse"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
      L.marker(endPoint, { icon: endIcon }).addTo(routeLayer)
        .bindPopup('<span class="text-xs font-bold font-mono text-rose-400">TUJUAN</span>')
    }
  }, [activeRoute, routeAlternatives, mapRef, routeLayerRef])

  return null
}