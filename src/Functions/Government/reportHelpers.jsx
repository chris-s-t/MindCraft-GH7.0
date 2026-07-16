/**
 * Filter reports based on active tab ('active' | 'resolved')
 * @param {Array} reports 
 * @param {string} activeTab 
 * @returns {Array}
 */
export function filterReports(reports, activeTab) {
  return reports.filter((r) => {
    if (activeTab === 'active') return r.status !== 'Selesai';
    return r.status === 'Selesai';
  });
}

/**
 * Sort reports by urgency (for active tab) or by date (for resolved tab)
 * @param {Array} reports 
 * @param {string} activeTab 
 * @returns {Array}
 */
export function sortReports(reports, activeTab) {
  return [...reports].sort((a, b) => {
    if (activeTab === 'active') {
      const priority = { critical: 4, high: 3, medium: 2, low: 1 };
      const valA = priority[a.hazard_level] || 0;
      const valB = priority[b.hazard_level] || 0;

      if (valB !== valA) {
        return valB - valA; // highest priority first
      }
      // If equal priority, sort by upvotes descending
      return (b.upvotes || 0) - (a.upvotes || 0);
    }

    // For resolved tab, sort by date descending
    return new Date(b.created_at) - new Date(a.created_at);
  });
}
