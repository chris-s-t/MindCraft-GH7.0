import { ShieldCheck } from 'lucide-react';

export default function GovernmentHeader({ onOpenAdmin }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
      <ShieldCheck className="w-5 h-5 text-[var(--accent-color)]" />
      <h2 className="text-sm font-sans font-extrabold tracking-wider text-slate-800 uppercase flex-1 truncate">Portal Pemerintah</h2>
      <button
        onClick={onOpenAdmin}
        className="px-2 py-1 border border-[var(--accent-color)] bg-transparent hover:bg-[var(--accent-color)] hover:text-white font-sans text-[9px] font-bold rounded cursor-pointer transition uppercase text-[var(--accent-color)] shrink-0"
      >
        KONSOL ADMIN
      </button>
    </div>
  );
}
