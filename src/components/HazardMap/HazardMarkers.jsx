import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { HAZARD_TYPES } from '../../lib/hazardTypes'

export default function HazardMarkers({ mapRef, markersGroupRef, alertCirclesRef, reports, onVote }) {
  const markersMapRef = useRef(new Map())

  useEffect(() => {
    const map = mapRef.current
    const markersGroup = markersGroupRef.current
    const alertCircles = alertCirclesRef.current
    if (!map || !markersGroup || !alertCircles) return

    const activeReportIds = new Set()

    reports.forEach((report) => {
      if (report.status === 'resolved') return
      activeReportIds.add(report.id)

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
      popupDiv.className = 'p-1 text-slate-800 w-60 sm:w-72 max-w-xs'
      L.DomEvent.disableClickPropagation(popupDiv)

      const imageHTML = report.photo_url
        ? `<div class="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-32">
             <img src="${report.photo_url}" class="w-full h-full object-cover" alt="Foto Laporan" />
           </div>`
        : ''

      const badgeColor =
        report.hazard_level === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-700' :
        report.hazard_level === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700' :
        report.hazard_level === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
        'bg-slate-50 border-slate-200 text-slate-600'

      popupDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full shrink-0 border border-slate-200" style="background-color: ${typeMeta.color}"></span>
            <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">${typeMeta.label}</span>
          </div>
          <span class="text-[9px] px-1.5 py-0.5 rounded border ${badgeColor} font-mono uppercase font-bold">${report.hazard_level}</span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1 break-words">${report.title}</h4>
        <p class="text-xs text-slate-600 leading-normal line-clamp-3 break-words">${report.description || 'Tidak ada deskripsi'}</p>
        ${imageHTML}
        <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[10px] text-slate-500 font-medium">${new Date(report.created_at).toLocaleDateString('id-ID')}</span>
          <div class="flex gap-2">
            <button id="up-${report.id}" class="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition text-emerald-700 font-mono font-bold cursor-pointer text-[11px]">
              ▲ ${report.upvotes || 0}
            </button>
            <button id="down-${report.id}" class="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded transition text-rose-700 font-mono font-bold cursor-pointer text-[11px]">
              ▼ ${report.downvotes || 0}
            </button>
          </div>
        </div>
      `

      const setupPopupBindings = () => {
        const upBtn = document.getElementById(`up-${report.id}`)
        const downBtn = document.getElementById(`down-${report.id}`)
        if (upBtn) {
          upBtn.onclick = (e) => {
            L.DomEvent.stopPropagation(e)
            onVote(report.id, 'upvotes')
          }
        }
        if (downBtn) {
          downBtn.onclick = (e) => {
            L.DomEvent.stopPropagation(e)
            onVote(report.id, 'downvotes')
          }
        }
      }

      if (markersMapRef.current.has(report.id)) {
        const { marker, circle } = markersMapRef.current.get(report.id)
        
        marker.reportId = report.id
        marker.setIcon(pulseIcon)
        marker.setLatLng([report.latitude, report.longitude])
        marker.setPopupContent(popupDiv)

        circle.setLatLng([report.latitude, report.longitude])
        circle.setStyle({ color: typeMeta.color, fillColor: typeMeta.color })

        marker.off('popupopen')
        marker.on('popupopen', setupPopupBindings)

        if (marker.isPopupOpen()) {
          setupPopupBindings()
        }
      } else {
        const marker = L.marker([report.latitude, report.longitude], { icon: pulseIcon })
          .addTo(markersGroup)
          .bindPopup(popupDiv, {
            maxWidth: 280,
            minWidth: 220,
            className: 'hazard-popup'
          })

        marker.reportId = report.id
        marker.on('popupopen', setupPopupBindings)

        const circle = L.circle([report.latitude, report.longitude], {
          radius: 40,
          color: typeMeta.color,
          weight: 1,
          fillColor: typeMeta.color,
          fillOpacity: 0.05,
          dashArray: '3, 4'
        }).addTo(alertCircles)

        markersMapRef.current.set(report.id, { marker, circle })
      }
    })

    // Remove stale layers
    for (const [id, { marker, circle }] of markersMapRef.current.entries()) {
      if (!activeReportIds.has(id)) {
        markersGroup.removeLayer(marker)
        alertCircles.removeLayer(circle)
        markersMapRef.current.delete(id)
      }
    }
  }, [reports, onVote, mapRef, markersGroupRef, alertCirclesRef])

  return null
}