import { AlertTriangle, X } from 'lucide-react';

export default function ReportFormHeader({ onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
        <h2 className="text-md font-mono font-bold tracking-widest text-white uppercase">Laporkan Bahaya</h2>
      </div>
      <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer transition">
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
