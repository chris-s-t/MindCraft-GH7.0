import { useMemo } from "react";

// Stats calculations — must be called inside a React component
export default function useStatCount(reports) {
  return useMemo(() => {
    const total = reports.length;
    const active = reports.filter(r => r.status === 'pending' || r.status === 'working' || r.status === 'Aktif' || r.status === 'Ditangani').length;
    const resolved = reports.filter(r => r.status === 'resolved' || r.status === 'Selesai').length;
    const upvotes = reports.reduce((sum, r) => sum + (r.upvotes || 0), 0);

    // Find most common type
    const counts = {};
    reports.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    let mostCommonType = 'N/A';
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    });

    return { total, active, resolved, upvotes, mostCommonType };
  }, [reports]);
}