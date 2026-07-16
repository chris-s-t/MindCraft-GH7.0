export default function UrgencyBadge({ level }) {
  switch (level) {
    case 'critical':
      return <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-red-950/80 border border-red-500 text-red-400 font-extrabold animate-pulse">Critical</span>;
    case 'high':
      return <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-orange-950/80 border border-orange-500 text-orange-400 font-bold">High</span>;
    case 'medium':
      return <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-yellow-950/80 border border-yellow-500 text-yellow-400 font-bold">Medium</span>;
    default:
      return <span className="text-[10px] px-1.5 py-0.5 rounded font-mono uppercase bg-slate-800 border border-slate-600 text-slate-400 font-medium">Low</span>;
  }
}
