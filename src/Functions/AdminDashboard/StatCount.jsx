import { useMemo } from "react";

// Stats calculations
export const stats = useMemo(() => {
  const totalAmount = reports.length;
  const activeAmount = reports.filter(r => r.status === 'pending').length;
  const resolvedAmount = reports.filter(r => r.status === 'resolved').length;
  const upvotesAmount = reports.reduce((sum, r) => sum + (r.upvotes || 0), 0);

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

  return { totalAmount, activeAmount, resolvedAmount, upvotesAmount, mostCommonType };
}, [reports]);