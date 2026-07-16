import { Database, RefreshCw, X } from "lucide-react"

function Header({ handleRefresh, isRefreshing, onClose }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded border border-[var(--accent-color)] flex items-center justify-center bg-[rgba(var(--accent-color-rgb),0.1)] shadow-[0_0_15px_var(--accent-glow)]">
          <Database className="w-5 h-5 text-[var(--accent-color)]" />
        </div>
        <div>
          <h1 className="text-lg font-mono font-extrabold tracking-widest text-white uppercase leading-none">
            KONSOL ADMINISTRATOR <span className="text-[var(--accent-color)] neon-text font-black">//</span> DATABASE
          </h1>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider">MUNICIPAL WEB CONSOLE - MINDRAFT SAFEROUTE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 border border-slate-800 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition flex items-center gap-1.5 font-mono text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          REFRESH
        </button>
        <button
          onClick={onClose}
          className="p-2 border border-red-900 rounded bg-red-950/20 hover:bg-red-950/60 text-red-400 hover:text-red-200 cursor-pointer transition flex items-center gap-1.5 font-mono text-xs"
        >
          <X className="w-3.5 h-3.5" />
          TUTUP KONSOL
        </button>
      </div>
    </header>
  )
}

export default Header;