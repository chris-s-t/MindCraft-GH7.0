import { supabase } from '../../lib/supabase';

export const handleSaveEdit = async (e, {
  editingReport, editTitle, editDesc, editType, editLevel, editStatus,
  isOfflineMode, fetchReports, setIsSaving, setEditingReport
}) => {
  e.preventDefault();
  if (!editingReport) return;
  setIsSaving(true);

  const typeMapReverse = {
    'jalanan_rusak': 'Jalanan_rusak',
    'lampu_lalu_lintas': 'Lampu_lalu_lintas',
    'banjir': 'Banjir',
    'pohon_tumbang': 'Pohon_tumbang',
    'other': 'Other'
  };
  const levelMapReverse = {
    'low': 'Rendah',
    'medium': 'Sedang',
    'high': 'Tinggi',
    'critical': 'Tinggi'
  };

  if (isOfflineMode) {
    const localData = localStorage.getItem('mindcraft_reports');
    if (localData) {
      const parsed = JSON.parse(localData);
      const updated = parsed.map(r => r.id === editingReport.id ? {
        ...r,
        title: editTitle,
        description: editDesc,
        type: editType,
        hazard_level: editLevel,
        status: editStatus === 'Selesai' ? 'resolved' : 'pending'
      } : r);
      localStorage.setItem('mindcraft_reports', JSON.stringify(updated));
      await fetchReports();
    }
    setIsSaving(false);
    setEditingReport(null);
  } else {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          judul: editTitle,
          deskripsi: editDesc,
          jenis: typeMapReverse[editType] || 'Other',
          hazard_level: levelMapReverse[editLevel] || 'Sedang',
          status: editStatus
        })
        .eq('id', editingReport.id);

      if (error) throw error;
      await fetchReports();
      setEditingReport(null);
    } catch (err) {
      console.error("Save edit failed:", err);
      alert("Gagal memperbarui laporan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }
};