import { useState } from 'react';
import {
  RefreshCw
} from 'lucide-react';
import { HAZARD_TYPES } from '../lib/hazardTypes';

import useStatCount from '../Functions/AdminDashboard/StatCount';
import { useFilteredReports } from '../Functions/AdminDashboard/FilterReports';
import { handleSaveEdit } from '../Functions/AdminDashboard/HandleSaveEdit';
import { handleBulkResolve } from '../Functions/AdminDashboard/HandleBulkResolve';
import { handleBulkDelete } from '../Functions/AdminDashboard/HandleBulkDelete';

import Header from '../components/AdminDashboard/Header';
import StatCard from '../components/AdminDashboard/StatCard';
import DatabaseGrid from '../components/AdminDashboard/DatabaseGrid';
import EditingReport from '../components/AdminDashboard/EditingReport';

export default function AdminDashboard({ reports, fetchReports, onResolve, isOfflineMode, onClose }) {

  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [editingReport, setEditingReport] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('jalanan_rusak');
  const [editLevel, setEditLevel] = useState('medium');
  const [editStatus, setEditStatus] = useState('Aktif');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredReports = useFilteredReports(reports, searchQuery, filterType, filterLevel, filterStatus);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReports();
    setIsRefreshing(false);
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setEditTitle(report.title);
    setEditDesc(report.description || '');
    setEditType(report.type);
    setEditLevel(report.hazard_level);
    setEditStatus(report.status === 'resolved' ? 'Selesai' : 'Aktif');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const stats = useStatCount(reports);

  const onSaveEdit = (e) => {
    handleSaveEdit(e, {
      editingReport,
      editTitle,
      editDesc,
      editType,
      editLevel,
      editStatus,
      isOfflineMode,
      fetchReports,
      setIsSaving,
      setEditingReport
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-dark)]/98 backdrop-blur-md overflow-y-auto p-4 md:p-8 flex flex-col font-sans text-slate-800 animate-fadeIn">

      {/* Header */}
      <Header
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onClose={onClose}>
      </Header>

      {/* Stat Cards Section */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard text="Total Laporan" value={stats.total} color="sky-500"></StatCard>
        <StatCard text="Laporan Aktif" value={stats.active} color="amber-500"></StatCard>
        <StatCard text="Telah Selesai" value={stats.resolved} color="emerald-500"></StatCard>
        <StatCard text="Total Dukungan" value={stats.upvotes} color="pink-500"></StatCard>
        <StatCard text="Mayoritas Masalah" value={HAZARD_TYPES[stats.mostCommonType]?.label || 'Tidak Ada'} color="var(--accent-color)"></StatCard>
      </section>

      {/* Database Grid */}
      <DatabaseGrid
        reports={reports}
        filteredReports={filteredReports}
        fetchReports={fetchReports}
        isOfflineMode={isOfflineMode}
        onResolve={onResolve}
        openEditModal={openEditModal}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterType={filterType}
        setFilterType={setFilterType}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}>
      </DatabaseGrid>

      {/* Editing Report */}
      {editingReport && <EditingReport
        setEditingReport={setEditingReport}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editType={editType}
        setEditType={setEditType}
        editLevel={editLevel}
        setEditLevel={setEditLevel}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        handleSaveEdit={onSaveEdit}
        handleBulkDelete={handleBulkDelete}
        handleBulkResolve={handleBulkResolve}>
      </EditingReport>}
    </div>
  );
}