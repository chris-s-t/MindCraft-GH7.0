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
        (filterStatus === 'active' && r.status !== 'resolved') ||
        (filterStatus === 'resolved' && r.status === 'resolved');

      return matchesSearch && matchesType && matchesLevel && matchesStatus;
    });
  }, [reports, searchQuery, filterType, filterLevel, filterStatus]);
}