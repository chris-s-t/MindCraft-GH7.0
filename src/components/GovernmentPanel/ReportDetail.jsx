import { Clock, Eye, MapPin, ChevronRight } from 'lucide-react';
import { HAZARD_TYPES } from '../../lib/hazardTypes';
import UrgencyBadge from './UrgencyBadge';

export default function ReportDetail({ selectedReport, selectedReportId, onClearSelection, onResolve }) {
  if (!selectedReport) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12 pl-0 md:pl-1">
        <Clock className="w-8 h-8 mb-2 animate-pulse" />
        <p className="text-[11px] font-mono text-center">
          Pilih salah satu laporan di daftar sebelah kiri untuk melihat rincian detailnya.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-y-auto pl-0 md:pl-1 ${selectedReportId ? 'block' : 'hidden md:block'}`}>
      {selectedReportId && (
        <button
          onClick={onClearSelection}
          className="md:hidden text-[var(--accent-color)] hover:underline font-mono text-[9px] flex items-center justify-center gap-1 mb-3 border border-slate-800 py-1.5 rounded bg-slate-950/60 w-full"
        >
          ← KEMBALI KE DAFTAR LAPORAN
        </button>
      )}

      <div className="space-y-3.5 text-xs text-slate-300">
        <div className="border-b border-slate-800/80 pb-2 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono" style={{ color: (HAZARD_TYPES[selectedReport.type] || HAZARD_TYPES.other).color }}>
              {(HAZARD_TYPES[selectedReport.type] || HAZARD_TYPES.other).label}
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">{selectedReport.title}</h3>
          </div>
          <UrgencyBadge level={selectedReport.hazard_level} />
        </div>

        {/* Description */}
        <div className="bg-slate-950/40 border border-slate-900 rounded p-2.5">
          <span className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Deskripsi Laporan</span>
          <p className="text-slate-300 leading-normal font-sans">{selectedReport.description || 'Tidak ada deskripsi rinci.'}</p>
        </div>

        {/* Image Preview */}
        {selectedReport.photo_url && (
          <div className="border border-slate-800 rounded bg-slate-950/60 overflow-hidden relative group">
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <img
              src={selectedReport.photo_url}
              alt="Bukti Laporan"
              className="w-full max-h-40 object-cover"
            />
          </div>
        )}

        {/* Info Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/20 p-2 rounded border border-slate-900">
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500">Tanggal Lapor:</span>
            <span className="text-slate-200">{new Date(selectedReport.created_at).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500">Koordinat:</span>
            <span className="text-slate-200 flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-[var(--accent-color)]" />
              {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 sm:col-span-2">
            <span className="text-slate-500">Nama Lokasi / Alamat:</span>
            <span className="text-slate-200 break-words leading-tight">{selectedReport.display_name || 'Koordinat Tertentu'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500">Dukungan Masyarakat:</span>
            <span className="text-slate-200 flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-400">▲ {selectedReport.upvotes || 0} Up</span>
              <span className="text-red-400">▼ {selectedReport.downvotes || 0} Down</span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-500">Status Tindak Lanjut:</span>
            <span className={`uppercase font-bold ${selectedReport.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedReport.status === 'resolved' ? 'Selesai ditangani' : 'Menunggu tindakan'}
            </span>
          </div>
        </div>

        {/* Action Button (only if active) */}
        {selectedReport.status !== 'resolved' && (
          <button
            onClick={() => onResolve(selectedReport.id)}
            className="w-full bg-emerald-950 border border-emerald-500 text-emerald-300 hover:bg-emerald-900/60 transition duration-200 rounded py-2 text-center font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/30"
          >
            <ChevronRight className="w-4 h-4 animate-pulse" />
            TANDAI SELESAI DITANGANI
          </button>
        )}
      </div>
    </div>
  );
}
