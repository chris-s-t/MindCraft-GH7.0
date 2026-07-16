import { useState } from 'react';
import GovernmentHeader from './GovernmentHeader';
import GovernmentTabs from './GovernmentTabs';
import ReportList from './ReportList';
import ReportDetail from './ReportDetail';
import { filterReports, sortReports } from '../../Functions/Government/reportHelpers';

export default function GovernmentPanel({ reports, onResolve, onOpenAdmin, onSelectReport }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'resolved'
  const [selectedReportId, setSelectedReportId] = useState(null);

  const filtered = filterReports(reports, activeTab);
  const sorted = sortReports(filtered, activeTab);

  const selectedReport = sorted.find(r => r.id === selectedReportId) || sorted[0];

  const handleSelectReport = (id) => {
    setSelectedReportId(id);
    const report = sorted.find(r => r.id === id);
    if (report && onSelectReport) {
      onSelectReport(report);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedReportId(null);
  };

  return (
    <div className="futuristic-panel w-full rounded-lg p-4 pointer-events-auto border-t-2 flex flex-col h-full overflow-hidden" style={{ borderTopColor: 'var(--accent-color)' }}>
      <GovernmentHeader onOpenAdmin={onOpenAdmin} />
      <GovernmentTabs activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0">
        <ReportList
          sortedReports={sorted}
          selectedReport={selectedReport}
          onSelectReport={handleSelectReport}
          selectedReportId={selectedReportId}
        />
        <ReportDetail
          selectedReport={selectedReport}
          selectedReportId={selectedReportId}
          onClearSelection={() => setSelectedReportId(null)}
          onResolve={onResolve}
        />
      </div>
    </div>
  );
}
