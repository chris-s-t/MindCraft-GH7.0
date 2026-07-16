import {
  Search, Trash2, CheckCircle, Edit, CheckSquare, Square
} from 'lucide-react';
import { HAZARD_TYPES } from '../../lib/hazardTypes';
import { handleBulkResolve } from '../../Functions/AdminDashboard/HandleBulkResolve';
import { handleBulkDelete } from '../../Functions/AdminDashboard/HandleBulkDelete';
import { handleDeleteOne } from '../../Functions/AdminDashboard/HandleDeleteOne';

export default function DatabaseGrid({
  reports, filteredReports, fetchReports, isOfflineMode, onResolve,
  openEditModal, selectedIds, setSelectedIds, toggleSelect, toggleSelectAll,
  searchQuery, setSearchQuery,
  filterType, setFilterType,
  filterLevel, setFilterLevel,
  filterStatus, setFilterStatus
}) {

  const bulkResolve = () => handleBulkResolve({ selectedIds, isOfflineMode, onResolve, fetchReports, setSelectedIds });
  const bulkDelete = () => handleBulkDelete({ selectedIds, isOfflineMode, fetchReports, setSelectedIds });
  const deleteOne = (id) => handleDeleteOne(id, { isOfflineMode, fetchReports });

  return (
    <main className="futuristic-panel flex-1 rounded p-5 flex flex-col overflow-hidden min-h-[400px]">
      {/* Filters and Search toolbar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center pb-4 mb-4 border-b border-slate-900">
        {/* Left search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, deskripsi, atau alamat..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded pl-9 pr-4 py-2 text-xs focus:border-[var(--accent-color)] focus:outline-none text-white placeholder-slate-600 transition"
          />
        </div>

        {/* Filters right */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Jenis:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none"
            >
              <option value="all">Semua Jenis</option>
              {Object.entries(HAZARD_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tingkat Bahaya:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none"
            >
              <option value="all">Semua Level</option>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded px-4 py-2 mb-4 text-xs animate-slideDown">
          <span className="font-mono text-[var(--accent-color)] font-bold">
            {selectedIds.length} baris data terpilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkResolve}
              className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded transition cursor-pointer flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Tandai Selesai
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-700 rounded transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Laporan
            </button>
          </div>
        </div>
      )}

      {/* Database Table view */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-900 font-mono text-slate-500 uppercase tracking-wider text-[10px] bg-slate-950/40">
              <th className="p-3 w-8">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  {selectedIds.length === filteredReports.length && filteredReports.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[var(--accent-color)]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="p-3">Judul Masalah</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Lokasi / Alamat</th>
              <th className="p-3">Tingkat Bahaya</th>
              <th className="p-3 text-center">Masyarakat</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tanggal Dilaporkan</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-950">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-600 font-mono">
                  Tidak ada baris data laporan yang cocok.
                </td>
              </tr>
            ) : (
              filteredReports.map((r) => {
                const typeMeta = HAZARD_TYPES[r.type] || HAZARD_TYPES.other;
                const isChecked = selectedIds.includes(r.id);

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-900/20 transition ${isChecked ? 'bg-slate-900/40' : ''}`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() => toggleSelect(r.id)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[var(--accent-color)]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-white truncate max-w-xs">{r.title}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full font-mono text-[9px] border font-bold uppercase"
                        style={{ borderColor: typeMeta.color, color: typeMeta.color, backgroundColor: `${typeMeta.color}15` }}
                      >
                        {typeMeta.label}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[10px] truncate max-w-sm" title={r.display_name}>
                      {r.display_name || 'Koordinat Tertentu'}
                    </td>
                    <td className="p-3">
                      {r.hazard_level === 'high' && <span className="text-orange-400 font-bold">▲ Tinggi</span>}
                      {r.hazard_level === 'medium' && <span className="text-yellow-400">● Sedang</span>}
                      {r.hazard_level === 'low' && <span className="text-slate-400">■ Rendah</span>}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300">
                      <span className="text-emerald-400">▲ {r.upvotes}</span>
                    </td>
                    <td className="p-3">
                      {r.status === 'resolved' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          SELESAI
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1 font-mono text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          AKTIF
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[10px]">
                      {new Date(r.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1 border border-slate-800 rounded bg-slate-950 text-slate-400 hover:text-white cursor-pointer hover:border-slate-700 transition"
                        title="Edit Row"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {r.status !== 'resolved' && (
                        <button
                          onClick={() => onResolve(r.id)}
                          className="p-1 border border-emerald-900 rounded bg-emerald-950/20 text-emerald-400 hover:text-emerald-200 cursor-pointer hover:border-emerald-700 transition"
                          title="Tandai Selesai"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne(r.id)}
                        className="p-1 border border-red-950 rounded bg-red-950/20 text-red-400 hover:text-red-200 cursor-pointer hover:border-red-700 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}