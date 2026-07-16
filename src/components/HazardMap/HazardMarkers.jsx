import { useEffect } from 'react'
import L from 'leaflet'
import { HAZARD_TYPES } from '../../lib/hazardTypes'

export default function HazardMarkers({ mapRef, markersGroupRef, alertCirclesRef, reports, onVote }) {
  useEffect(() => {
    const map = mapRef.current
    const markersGroup = markersGroupRef.current
    const alertCircles = alertCirclesRef.current
    if (!map || !markersGroup || !alertCircles) return

    markersGroup.clearLayers()
    alertCircles.clearLayers()

    reports.forEach((report) => {
      if (report.status === 'resolved') return

      const typeMeta = HAZARD_TYPES[report.type] || HAZARD_TYPES.other

      const pulseIcon = L.divIcon({
        className: 'hazard-marker',
        html: `
          <div class="marker-pulse" style="background-color: ${typeMeta.color}; --marker-color-rgb: ${typeMeta.rgb}; width: 16px; height: 16px;">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const popupDiv = document.createElement('div')
      popupDiv.className = 'p-1 text-slate-100 max-w-[240px]'

      const imageHTML = report.photo_url
        ? `<div class="mt-2 rounded overflow-hidden border border-slate-700 bg-slate-900 max-h-32">
             <img src="${report.photo_url}" class="w-full h-full object-cover" alt="Foto Laporan" />
           </div>`
        : ''

      const badgeColor =
        report.hazard_level === 'critical' ? 'bg-red-950 border-red-500 text-red-400' :
        report.hazard_level === 'high' ? 'bg-orange-950 border-orange-500 text-orange-400' :
        report.hazard_level === 'medium' ? 'bg-yellow-950 border-yellow-500 text-yellow-400' :
        'bg-slate-800 border-slate-600 text-slate-400'

      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b border-slate-700/50 pb-1 mb-1">
          <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">${typeMeta.label}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded border ${badgeColor} font-mono uppercase font-bold">${report.hazard_level}</span>
        </div>
        <h4 class="font-bold text-sm text-white leading-tight mb-1">${report.title}</h4>
        <p class="text-xs text-slate-300 leading-normal line-clamp-3">${report.description || 'Tidak ada deskripsi'}</p>
        ${imageHTML}
        <div class="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs">
          <span class="text-[10px] text-slate-400">${new Date(report.created_at).toLocaleDateString('id-ID')}</span>
          <div class="flex gap-2">
            <button id="up-${report.id}" class="flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 px-1.5 py-0.5 rounded transition text-emerald-400 font-mono font-bold cursor-pointer">
              ▲ ${report.upvotes || 0}
            </button>
            <button id="down-${report.id}" class="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 px-1.5 py-0.5 rounded transition text-red-400 font-mono font-bold cursor-pointer">
              ▼ ${report.downvotes || 0}
            </button>
          </div>
        </div>
      `

      const marker = L.marker([report.latitude, report.longitude], { icon: pulseIcon })
        .addTo(markersGroup)
        .bindPopup(popupDiv)

      marker.on('popupopen', () => {
        const upBtn = document.getElementById(`up-${report.id}`)
        const downBtn = document.getElementById(`down-${report.id}`)
        if (upBtn) upBtn.onclick = () => onVote(report.id, 'upvotes')
        if (downBtn) downBtn.onclick = () => onVote(report.id, 'downvotes')
      })

      L.circle([report.latitude, report.longitude], {
        radius: 40,
        color: typeMeta.color,
        weight: 1,
        fillColor: typeMeta.color,
        fillOpacity: 0.05,
        dashArray: '3, 4'
      }).addTo(alertCircles)
    })
  }, [reports, onVote, mapRef, markersGroupRef, alertCirclesRef])

  return null
}