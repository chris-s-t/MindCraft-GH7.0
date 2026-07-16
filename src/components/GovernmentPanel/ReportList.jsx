import { ThumbsUp } from 'lucide-react';
import { HAZARD_TYPES } from '../../lib/hazardTypes';
import UrgencyBadge from './UrgencyBadge';

export default function ReportList({ sortedReports, selectedReport, onSelectReport, selectedReportId }) {
  return (
    <div className={`overflow-y-auto space-y-2 border-r md:border-r border-slate-200/60 pr-1.5 ${selectedReportId ? 'hidden md:block' : 'block'}`}>
      
      {/* Legend / Status Indicators */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1.5 mb-3 bg-slate-50 border border-slate-200/80 rounded text-[9px] font-sans text-slate-500 select-none">
        <span className="font-bold uppercase mr-1">Status:</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Aktif
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Ditangani
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Selesai
        </span>
      </div>

      {sortedReports.length === 0 ? (
        <p className="text-xs text-slate-500 font-sans text-center py-8">
          Tidak ada laporan dalam kategori ini.
        </p>
      ) : (
        sortedReports.map((report) => {
          const typeMeta = HAZARD_TYPES[report.type] || HAZARD_TYPES.other;
          const isSelected = selectedReport && report.id === selectedReport.id;

          const isResolved = report.status === 'resolved' || report.status === 'Selesai';
          const isWorking = report.status === 'working' || report.status === 'Ditangani';
          const borderStatusClass = isResolved
            ? 'border-l-4 border-l-emerald-500'
            : isWorking
            ? 'border-l-4 border-l-blue-500'
            : 'border-l-4 border-l-amber-500';

          return (
            <div
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              className={`p-2 rounded border cursor-pointer transition flex items-start justify-between gap-1.5 ${borderStatusClass} ${isSelected
                ? 'border-y-[var(--accent-color)] border-r-[var(--accent-color)] bg-blue-50/50 shadow-sm'
                : 'border-slate-200 hover:border-y-slate-300 hover:border-r-slate-300 bg-slate-50/30'
                }`}
            >
              <div className="space-y-1 max-w-[70%]">
                <span className="text-[9px] uppercase tracking-wider font-bold block" style={{ color: typeMeta.color }}>
                  {typeMeta.label}
                </span>
                <h4 className="text-xs font-semibold text-slate-800 leading-tight truncate">{report.title}</h4>
                <span className="text-[9px] text-slate-500 font-sans block truncate">
                  {report.display_name || 'Koordinat Tertentu'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <UrgencyBadge level={report.hazard_level} />
                {/* Tiny upvote badge */}
                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <ThumbsUp className="w-3 h-3 text-emerald-400" />
                  <span>{report.upvotes || 0}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}