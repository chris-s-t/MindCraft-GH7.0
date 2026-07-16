export const handleBulkResolve = async () => {
  if (selectedIds.length === 0) return;
  if (!confirm(`Tandai ${selectedIds.length} laporan sebagai selesai?`)) return;

  if (isOfflineMode) {
    // Offline mock resolve
    for (const id of selectedIds) {
      onResolve(id);
    }
  } else {
    try {
      await supabase
        .from('reports')
        .update({ status: 'Selesai' })
        .in('id', selectedIds);
      await fetchReports();
    } catch (err) {
      console.error("Bulk resolve failed:", err);
      alert("Gagal memperbarui status laporan.");
    }
  }
  setSelectedIds([]);
};