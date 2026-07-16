import { Clock, CheckCircle2 } from 'lucide-react';

export default function GovernmentTabs({ activeTab, onTabChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-sans mb-3 text-slate-600">
      <button
        onClick={() => onTabChange('active')}
        className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-bold ${activeTab === 'active'
            ? 'bg-[var(--accent-color)] text-white font-bold shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
          }`}
      >
        <Clock className="w-3.5 h-3.5" />
        LAPORAN AKTIF
      </button>
      <button
        onClick={() => onTabChange('resolved')}
        className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-bold ${activeTab === 'resolved'
            ? 'bg-[var(--accent-color)] text-white font-bold shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
          }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        SELESAI (DONE)
      </button>
    </div>
  );
}
