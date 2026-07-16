export const handleDeleteOne = async (id) => {
  if (!confirm("Hapus permanen laporan ini?")) return;
  if (isOfflineMode) {
    const localData = localStorage.getItem('mindcraft_reports');
    if (localData) {
      const parsed = JSON.parse(localData);
      const filtered = parsed.filter(r => r.id !== id);
      localStorage.setItem('mindcraft_reports', JSON.stringify(filtered));
      await fetchReports();
    }
  } else {
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      await fetchReports();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Gagal menghapus laporan.");
    }
  }
};