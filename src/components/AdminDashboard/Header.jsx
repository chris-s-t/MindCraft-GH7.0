import { Database, RefreshCw, X } from "lucide-react"

function Header({ handleRefresh, isRefreshing, onClose }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded border border-[var(--accent-color)] flex items-center justify-center bg-[rgba(var(--accent-color-rgb),0.06)] shadow-[0_0_15px_var(--accent-glow)]">
          <Database className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div>
          <h1 className="text-lg font-sans font-black tracking-wider text-slate-800 uppercase leading-none">
            KONSOL ADMINISTRATOR <span className="text-[var(--accent-color)] font-black">//</span> DATABASE
          </h1>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider">MUNICIPAL WEB CONSOLE - MINDRAFT VIASAFE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 border border-slate-200 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 cursor-pointer transition flex items-center gap-1.5 font-mono text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
        <button
          onClick={onClose}
          className="p-2 border border-red-200 rounded bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 cursor-pointer transition flex items-center gap-1.5 font-mono text-xs"
        >
          <X className="w-3.5 h-3.5" />
          TUTUP KONSOL
        </button>
      </div>
    </header>
  )
}

export default Header;