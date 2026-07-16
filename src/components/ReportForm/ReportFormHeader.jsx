import { AlertTriangle, X } from 'lucide-react';

export default function ReportFormHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
        <h2 className="text-md font-sans font-extrabold tracking-wider text-slate-800 uppercase">Laporkan Bahaya</h2>
      </div>
      <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer transition">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
