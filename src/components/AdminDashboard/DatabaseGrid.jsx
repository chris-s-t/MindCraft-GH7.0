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
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center pb-4 mb-4 border-b border-slate-200">
        {/* Left search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan judul, deskripsi, atau alamat..."
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs focus:border-[var(--accent-color)] focus:outline-none text-slate-800 placeholder-slate-400 transition"
          />
        </div>

        {/* Filters right */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Jenis:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none text-slate-700"
            >
              <option value="all">Semua Jenis</option>
              {Object.entries(HAZARD_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Tingkat Bahaya:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none text-slate-700"
            >
              <option value="all">Semua Level</option>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 focus:border-[var(--accent-color)] focus:outline-none text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Ditangani">Ditangani</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded px-4 py-2 mb-4 text-xs animate-slideDown">
          <span className="font-mono text-[var(--accent-color)] font-bold">
            {selectedIds.length} baris data terpilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkResolve}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-300 rounded transition cursor-pointer flex items-center gap-1 font-bold"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Tandai Selesai
            </button>
            <button
              onClick={bulkDelete}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 rounded transition cursor-pointer flex items-center gap-1 font-bold"
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
            <tr className="border-b border-slate-200 font-mono text-slate-500 uppercase tracking-wider text-[10px] bg-slate-100">
              <th className="p-3 w-8">
                <button
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
          <tbody className="divide-y divide-slate-200">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-slate-400 font-sans">
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
                    className={`hover:bg-slate-50 transition ${isChecked ? 'bg-blue-50/50' : ''}`}
                  >
                    {/* Checkbox ID column */}
                    <td className="p-3">
                      <button
                        onClick={() => toggleSelect(r.id)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[var(--accent-color)]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Judul */}
                    <td className="p-3 font-semibold text-slate-800 truncate max-w-xs">{r.title}</td>

                    {/* Jenis */}
                    <td className="p-3">
                      <span
                        className="px-2 py-0.5 rounded-full font-sans text-[9px] border font-bold uppercase"
                        style={{ borderColor: typeMeta.color, color: typeMeta.color, backgroundColor: `${typeMeta.color}15` }}
                      >
                        {typeMeta.type}
                      </span>
                    </td>

                    <td className="p-3 text-slate-500 font-sans text-[10px] truncate max-w-sm" title={r.display_name}>
                      {r.display_name || 'Koordinat Tertentu'}
                    </td>

                    {/* Tingkat Bahaya */}
                    <td className="text-center p-3">
                      {r.hazard_level === 'low' && <span className="text-slate-500">■ Rendah</span>}
                      {r.hazard_level === 'medium' && <span className="text-amber-600 font-semibold">● Sedang</span>}
                      {r.hazard_level === 'high' && <span className="text-red-600 font-bold">▲ Tinggi</span>}
                    </td>

                    {/* Up/Down Votes */}
                    <td className="p-3 text-center font-sans text-slate-600">
                      <span className="text-emerald-600 font-bold">▲ {r.upvotes}</span>
                      <span className="ml-3 text-red-600 font-bold">▲ {r.downvotes}</span>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      {r.status === 'resolved' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          SELESAI
                        </span>
                      ) : r.status === 'working' ? (
                        <span className="text-blue-600 font-bold flex items-center gap-1 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          DITANGANI
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1 text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          AKTIF
                        </span>
                      )}
                    </td>

                    {/* Tanggal Dilaporkan */}
                    <td className="p-3 text-slate-500 text-[10px]">
                      {new Date(r.created_at).toLocaleString('id-ID')}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1 border border-slate-200 rounded bg-white text-slate-500 hover:text-slate-800 hover:border-slate-400 cursor-pointer transition"
                        title="Edit Row"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {r.status !== 'resolved' && r.status !== 'Selesai' && (
                        <button
                          onClick={() => onResolve(r.id)}
                          className="p-1 border border-emerald-200 rounded bg-emerald-50 text-emerald-600 hover:text-emerald-800 hover:border-emerald-400 cursor-pointer transition"
                          title="Tandai Selesai"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne(r.id)}
                        className="p-1 border border-red-200 rounded bg-red-50 text-red-600 hover:text-red-800 hover:border-red-400 cursor-pointer transition"
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