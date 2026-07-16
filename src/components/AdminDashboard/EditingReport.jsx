import { X } from "lucide-react"
import { HAZARD_TYPES } from '../../lib/hazardTypes';

export default function EditingReport({ handleSaveEdit, setEditingReport, editTitle, setEditTitle, editDesc, setEditDesc, editType, setEditType, editLevel, setEditLevel, editStatus, setEditStatus, isSaving }) {
  return (
    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="futuristic-panel w-full max-w-md p-6 rounded-xl border-t-2 bg-white" style={{ borderTopColor: 'var(--accent-color)' }}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-sm font-sans font-bold tracking-wider uppercase text-slate-800">Edit Laporan Masalah</h3>
          <button
            onClick={() => setEditingReport(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="block text-[10px] uppercase font-sans tracking-wider text-slate-500 mb-1">Judul Laporan</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-slate-800 focus:border-[var(--accent-color)] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-sans tracking-wider text-slate-500 mb-1">Jenis Bahaya</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-2 text-slate-800 focus:border-[var(--accent-color)] focus:outline-none"
              >
                {Object.entries(HAZARD_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-sans tracking-wider text-slate-500 mb-1">Tingkat Bahaya</label>
              <select
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-2 text-slate-800 focus:border-[var(--accent-color)] focus:outline-none"
              >
                <option value="low">Rendah (Low)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="high">Tinggi (High)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-sans tracking-wider text-slate-500 mb-1">Status Laporan</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-2 text-slate-850 focus:border-[var(--accent-color)] focus:outline-none font-bold"
            >
              <option value="Aktif" className="text-amber-600">Aktif (Pending)</option>
              <option value="Ditangani" className="text-blue-600">Ditangani (In Progress)</option>
              <option value="Selesai" className="text-emerald-600">Selesai (Resolved)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-sans tracking-wider text-slate-500 mb-1">Deskripsi Masalah</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows="3"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-2 text-slate-800 focus:border-[var(--accent-color)] focus:outline-none resize-none font-sans"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingReport(null)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 rounded py-2 cursor-pointer font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 neon-glow-btn text-white rounded py-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}