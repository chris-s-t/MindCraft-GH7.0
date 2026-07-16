import { useMemo } from "react"

// Filter reports — must be called inside a React component
export function useFilteredReports(reports, searchQuery, filterType, filterLevel, filterStatus) {
  return useMemo(() => {
    return reports.filter(r => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.display_name && r.display_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesLevel = filterLevel === 'all' || r.hazard_level === filterLevel;
      const matchesStatus =
        filterStatus === 'all' ||
        ((filterStatus === 'active' || filterStatus === 'Aktif') && (r.status === 'pending' || r.status === 'Aktif')) ||
        ((filterStatus === 'resolved' || filterStatus === 'Selesai') && (r.status === 'resolved' || r.status === 'Selesai')) ||
        ((filterStatus === 'working' || filterStatus === 'Ditangani') && (r.status === 'working' || r.status === 'Ditangani'));

      return matchesSearch && matchesType && matchesLevel && matchesStatus;
    });
  }, [reports, searchQuery, filterType, filterLevel, filterStatus]);
}