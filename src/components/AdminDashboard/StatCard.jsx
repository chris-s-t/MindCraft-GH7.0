export default function StatCard({ text, value, color }) {
  // Map common Tailwind color names to actual hex values for inline styles
  const colorMap = {
    'sky-500': '#0ea5e9',
    'amber-500': '#f59e0b',
    'emerald-500': '#10b981',
    'pink-500': '#ec4899',
  };
  const borderColor = colorMap[color] || color;

  return (
    <div className="futuristic-panel p-4 flex flex-col justify-between rounded border-l-4" style={{ borderLeftColor: borderColor }}>
      <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">{text}</span>
      <h2 className="text-2xl font-mono font-black text-white mt-1">{value}</h2>
    </div>
  )
}