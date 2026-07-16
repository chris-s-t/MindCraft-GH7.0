import { Clock, CheckCircle2 } from 'lucide-react';

export default function GovernmentTabs({ activeTab, onTabChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1.5 rounded border border-slate-800 text-xs font-mono mb-3">
      <button
        onClick={() => onTabChange('active')}
        className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-bold ${activeTab === 'active'
            ? 'bg-[var(--accent-color)] text-slate-950 font-black shadow-lg shadow-[var(--accent-glow)]'
            : 'text-slate-400 hover:text-white'
          }`}
      >
        <Clock className="w-3.5 h-3.5" />
        LAPORAN AKTIF
      </button>
      <button
        onClick={() => onTabChange('resolved')}
        className={`py-1.5 rounded flex items-center justify-center gap-1.5 transition cursor-pointer font-bold ${activeTab === 'resolved'
            ? 'bg-[var(--accent-color)] text-slate-950 font-black shadow-lg shadow-[var(--accent-glow)]'
            : 'text-slate-400 hover:text-white'
          }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        SELESAI (DONE)
      </button>
    </div>
  );
}
