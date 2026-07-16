import { supabase } from '../../lib/supabase';

export const handleBulkDelete = async ({ selectedIds, isOfflineMode, fetchReports, setSelectedIds }) => {
  if (selectedIds.length === 0) return;
  if (!confirm(`PERINGATAN: Hapus permanen ${selectedIds.length} laporan dari database?`)) return;

  if (isOfflineMode) {
    const localData = localStorage.getItem('mindcraft_reports');
    if (localData) {
      const parsed = JSON.parse(localData);
      const filtered = parsed.filter(r => !selectedIds.includes(r.id));
      localStorage.setItem('mindcraft_reports', JSON.stringify(filtered));
      await fetchReports();
    }
  } else {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .in('id', selectedIds);
      if (error) throw error;
      await fetchReports();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Gagal menghapus laporan dari database.");
    }
  }
  setSelectedIds([]);
};