import { ShieldCheck } from 'lucide-react';

export default function GovernmentHeader({ onOpenAdmin }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
      <ShieldCheck className="w-5 h-5 text-[var(--accent-color)]" />
      <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase flex-1 truncate">Portal Pemerintah</h2>
      <button
        onClick={onOpenAdmin}
        className="px-2 py-1 border border-[var(--accent-color)] bg-[rgba(var(--accent-color-rgb),0.1)] hover:bg-[var(--accent-color)] hover:text-slate-950 font-mono text-[9px] font-bold rounded cursor-pointer transition uppercase text-[var(--accent-color)] shadow-[0_0_8px_var(--accent-glow)] shrink-0"
      >
        KONSOL ADMIN
      </button>
    </div>
  );
}
