function StatCard({ text, value, color }) {
  return (
    <div className="futuristic-panel p-4 flex flex-col justify-between rounded border-l-4 border-l-sky-500">
      <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">{text}</span>
      <h2 className="text-2xl font-mono font-black text-white mt-1">{value}</h2>
    </div>
  )
}

export default StatCard;