import { HAZARD_TYPES } from '../HazardMap';

export default function HazardDetailsInputs({
  title,
  setTitle,
  displayName,
  setDisplayName,
  type,
  setType,
  hazardLevel,
  setHazardLevel,
  description,
  setDescription
}) {
  return (
    <>
      {/* Title */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Judul Laporan</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Lubang di lajur kiri"
          className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600"
          required
        />
      </div>

      {/* Display Name / Address */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Nama Lokasi / Alamat</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Mencari alamat lokasi..."
          className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600"
          required
        />
      </div>

      {/* Grid: Type & Hazard Level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Jenis Bahaya</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white"
          >
            {Object.entries(HAZARD_TYPES).map(([key, meta]) => (
              <option key={key} value={key} className="bg-slate-950 text-white">
                {meta.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Tingkat Bahaya</label>
          <select
            value={hazardLevel}
            onChange={(e) => setHazardLevel(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white"
          >
            <option value="low" className="bg-slate-950 text-slate-400">Rendah (Low)</option>
            <option value="medium" className="bg-slate-950 text-yellow-400">Sedang (Medium)</option>
            <option value="high" className="bg-slate-950 text-orange-400">Tinggi (High)</option>
            <option value="critical" className="bg-slate-950 text-red-400">Kritis (Critical)</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-400 font-mono mb-1">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan kondisi bahaya secara rinci agar penanganan lebih cepat..."
          rows="3"
          className="w-full bg-slate-950/60 border border-slate-800 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-white placeholder-slate-600 resize-none"
        />
      </div>
    </>
  );
}
