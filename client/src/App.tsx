import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { useTheme, ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { LoginPage } from './features/auth/LoginPage';
import { FramedCanvas } from './components/layout/FramedCanvas';
import { Sidebar, NavigationPage } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { LiveMonitoringPage } from './features/live-monitoring/LiveMonitoringPage';
import { AnalyticsExplorerPage } from './features/analytics/AnalyticsExplorerPage';
import { AIAnalystPage } from './features/ai-analyst/AIAnalystPage';
import { DatasetsPage } from './features/datasets/DatasetsPage';
import { PipelinesPage } from './features/pipelines/PipelinesPage';
import { DataQualityPage } from './features/data-quality/DataQualityPage';
import { AlertsPage } from './features/alerts/AlertsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { AuditLogsPage } from './features/audit/AuditLogsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { Search, X, LayoutDashboard, Radio, BarChart3, Bot, Database, Network, ShieldCheck, BellRing, FileSpreadsheet, History, Settings as SettingsIcon } from 'lucide-react';

const MainApplication: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono tracking-wide">
            MEMUAT SISTEM INTELIJENSI DATAPULSE...
          </span>
        </div>
      </div>
    );
  }

  // Not signed in: Show Video 1 Interactive Lamp Login
  if (!user) {
    return <LoginPage />;
  }

  // Quick navigation items for ⌘K palette
  const searchItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dasbor Utama', desc: 'KPIs, analitik proyek, dan kartu status', icon: LayoutDashboard },
    { id: 'live-monitoring' as NavigationPage, label: 'Pusat Pemantauan Langsung', desc: 'Aliran event real-time Socket.IO', icon: Radio },
    { id: 'analytics' as NavigationPage, label: 'Eksplorasi Analitik', desc: 'Penyusun kueri terkelola & analisis drill-down', icon: BarChart3 },
    { id: 'ai-analyst' as NavigationPage, label: 'Analis Data AI', desc: 'Tanya jawab analitik berbasis data aktual MySQL', icon: Bot },
    { id: 'datasets' as NavigationPage, label: 'Kumpulan Data & Ingesti CSV', desc: 'Katalog skema dan pengunggah berkas CSV', icon: Database },
    { id: 'pipelines' as NavigationPage, label: 'Sumber Data & Pipeline', desc: 'Registri konektor & log eksekusi data', icon: Network },
    { id: 'data-quality' as NavigationPage, label: 'Pusat Kualitas Data', desc: 'Penegakan integritas skema dan skor validasi', icon: ShieldCheck },
    { id: 'alerts' as NavigationPage, label: 'Peringatan & Insiden', desc: 'Siklus hidup status TERBUKA, DIAKUI, SELESAI', icon: BellRing },
    { id: 'reports' as NavigationPage, label: 'Laporan & Ekspor CSV', desc: 'Unduh berkas CSV aman dengan sanitasi formula', icon: FileSpreadsheet },
    { id: 'audit' as NavigationPage, label: 'Log Aktivitas & Audit', desc: 'Jejak audit forensik permanen', icon: History },
    { id: 'settings' as NavigationPage, label: 'Pengaturan Sistem', desc: 'Tampilan 4 aksen, profil, dan manajemen peran tim', icon: SettingsIcon },
  ];

  const filteredSearchItems = searchItems.filter((i) =>
    i.label.toLowerCase().includes(searchQuery.toLowerCase()) || i.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FramedCanvas>
      {/* Collapsible Left Sidebar with Mobile Drawer */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] dark:bg-[#0c0f17]">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Dynamic Page Router with Smooth Entrance */}
        <div key={currentPage} className="flex-1 flex flex-col overflow-hidden animate-page-entrance">
          {currentPage === 'dashboard' && (
            <DashboardOverview
              onNavigate={setCurrentPage}
              onOpenImport={() => setCurrentPage('datasets')}
            />
          )}
          {currentPage === 'live-monitoring' && <LiveMonitoringPage />}
          {currentPage === 'analytics' && <AnalyticsExplorerPage />}
          {currentPage === 'ai-analyst' && <AIAnalystPage />}
          {currentPage === 'datasets' && <DatasetsPage />}
          {currentPage === 'pipelines' && <PipelinesPage />}
          {currentPage === 'data-quality' && <DataQualityPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'audit' && <AuditLogsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </div>

      {/* ⌘K Global Command Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#181d28] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10 gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to any module or action... (Press Esc to exit)"
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              {filteredSearchItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-3 text-left transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-slate-200 dark:bg-white/5 text-brand-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </FramedCanvas>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <MainApplication />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

