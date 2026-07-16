import { HAZARD_TYPES } from '../../lib/hazardTypes';

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
        <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Judul Laporan</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Lubang di lajur kiri"
          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-slate-800 placeholder-slate-400"
          required
        />
      </div>

      {/* Display Name / Address */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Nama Lokasi / Alamat</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Mencari alamat lokasi..."
          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-slate-800 placeholder-slate-400"
          required
        />
      </div>

      {/* Grid: Type & Hazard Level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Jenis Bahaya</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-slate-850"
          >
            {Object.entries(HAZARD_TYPES).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Tingkat Bahaya</label>
          <select
            value={hazardLevel}
            onChange={(e) => setHazardLevel(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-slate-850"
          >
            <option value="low" className="text-slate-500">Rendah (Low)</option>
            <option value="medium" className="text-amber-600">Sedang (Medium)</option>
            <option value="high" className="text-orange-600">Tinggi (High)</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs uppercase tracking-wider text-slate-500 font-sans mb-1">Deskripsi</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan kondisi bahaya secara rinci agar penanganan lebih cepat..."
          rows="3"
          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-[var(--accent-color)] focus:outline-none transition text-slate-800 placeholder-slate-400 resize-none font-sans"
        />
      </div>
    </>
  );
}
