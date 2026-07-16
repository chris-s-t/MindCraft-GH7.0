import { useState, useMemo } from 'react';
import {
  Database, Search, Trash2, CheckCircle, Edit, X, AlertTriangle,
  MapPin, Calendar, RefreshCw, ThumbsUp, Layers, CheckSquare, Square
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HAZARD_TYPES } from '../components/HazardMap';

import { StatCount } from '../Functions/StatCount';

export default function AdminDashboard() {
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


}