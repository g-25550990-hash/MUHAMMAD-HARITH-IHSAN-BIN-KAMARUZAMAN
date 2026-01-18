import React, { useEffect, useState, useMemo } from 'react';
import { User, Student, DashboardStats } from '../types';
import { apiService } from '../services/api';
import { ChartsSection } from './ChartsSection';
import { StatsCard } from './StatsCard';
import {
  Users,
  Trophy,
  CalendarCheck,
  Download,
  Search,
  LogOut,
  Filter,
  FileText,
  X
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

// Utility component to highlight matching text
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 font-medium">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterKelas, setFilterKelas] = useState('');
  const [filterUniform, setFilterUniform] = useState('');
  const [filterSukan, setFilterSukan] = useState('');
  const [filterKelab, setFilterKelab] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentData, statsData] = await Promise.all([
          apiService.getData(user.id),
          apiService.getStats(user.id)
        ]);
        setStudents(studentData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const handleExportPDF = () => {
    const url = apiService.generatePdfUrl(user.id);
    window.open(url, '_blank');
  };

  // Derive unique options for dropdowns
  const kelasOptions = useMemo(() => [...new Set(students.map(s => s.kelas))].sort(), [students]);
  const uniformOptions = useMemo(() => [...new Set(students.map(s => s.unit_uniform))].filter(Boolean).sort(), [students]);
  const sukanOptions = useMemo(() => [...new Set(students.map(s => s.sukan_permainan))].filter(Boolean).sort(), [students]);
  const kelabOptions = useMemo(() => [...new Set(students.map(s => s.kelab_persatuan))].filter(Boolean).sort(), [students]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas = filterKelas ? s.kelas === filterKelas : true;
    const matchesUniform = filterUniform ? s.unit_uniform === filterUniform : true;
    const matchesSukan = filterSukan ? s.sukan_permainan === filterSukan : true;
    const matchesKelab = filterKelab ? s.kelab_persatuan === filterKelab : true;

    return matchesSearch && matchesKelas && matchesUniform && matchesSukan && matchesKelab;
  });

  const clearFilters = () => {
    setFilterKelas('');
    setFilterUniform('');
    setFilterSukan('');
    setFilterKelab('');
    setSearchTerm('');
  };

  const hasActiveFilters = filterKelas || filterUniform || filterSukan || filterKelab || searchTerm;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">eK</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">Sistem Kokurikulum</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 uppercase">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Log Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, Cikgu!</h2>
            <p className="text-gray-500 mt-1">Berikut adalah ringkasan aktiviti kokurikulum semasa.</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
          >
            <Download size={18} className="mr-2" />
            Eksport Laporan PDF
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Memuatkan data...</p>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Jumlah Pelajar"
                value={stats?.total_pelajar || 0}
                icon={<Users size={24} className="text-blue-600" />}
                colorClass="bg-blue-600 text-blue-600"
              />
              <StatsCard
                title="Purata Kehadiran"
                value={`${stats?.pencapaian_terkini || 0}%`}
                trend="+2.5% dari bulan lepas"
                icon={<CalendarCheck size={24} className="text-green-600" />}
                colorClass="bg-green-600 text-green-600"
              />
               <StatsCard
                title="Aktiviti Selesai"
                value="12"
                icon={<FileText size={24} className="text-purple-600" />}
                colorClass="bg-purple-600 text-purple-600"
              />
              <StatsCard
                title="Pencapaian Johan"
                value="3"
                icon={<Trophy size={24} className="text-yellow-500" />}
                colorClass="bg-yellow-500 text-yellow-500"
              />
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Statistik & Analisis
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`${
                    activeTab === 'students'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Senarai Pelajar
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
              <ChartsSection
                attendanceData={stats?.kehadiran_bulanan || []}
                unitData={stats?.pecahan_unit || []}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
                  
                  {/* Search and Filter Toggle Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                        placeholder="Cari nama pelajar atau kelas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {hasActiveFilters && (
                          <button 
                            onClick={clearFilters}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Padam
                          </button>
                       )}
                      <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${showFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        Tapis
                      </button>
                    </div>
                  </div>

                  {/* Expandable Filter Panel */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
                        <select
                          value={filterKelas}
                          onChange={(e) => setFilterKelas(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Semua Kelas</option>
                          {kelasOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit Beruniform</label>
                        <select
                          value={filterUniform}
                          onChange={(e) => setFilterUniform(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Semua Unit</option>
                          {uniformOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Sukan & Permainan</label>
                        <select
                          value={filterSukan}
                          onChange={(e) => setFilterSukan(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Semua Sukan</option>
                          {sukanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kelab & Persatuan</label>
                        <select
                          value={filterKelab}
                          onChange={(e) => setFilterKelab(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Semua Kelab</option>
                          {kelabOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pelajar
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kelas
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Uniform
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sukan
                        </th>
                         <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kelab
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kehadiran
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                <HighlightText text={student.nama} highlight={searchTerm} />
                              </div>
                              <div className="text-xs text-gray-500">ID: {student.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <HighlightText text={student.kelas} highlight={searchTerm} />
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.unit_uniform}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.sukan_permainan}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.kelab_persatuan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm font-bold ${student.kehadiran_purata >= 80 ? 'text-green-600' : student.kehadiran_purata >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {student.kehadiran_purata}%
                                </span>
                                <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${student.kehadiran_purata >= 80 ? 'bg-green-500' : student.kehadiran_purata >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${student.kehadiran_purata}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                            Tiada rekod pelajar dijumpai.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                   <span className="text-xs text-gray-500">Menunjukkan {filteredStudents.length} rekod</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};