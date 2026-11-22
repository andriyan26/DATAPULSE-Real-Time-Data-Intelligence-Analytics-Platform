import React from 'react';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  Bot,
  Database,
  Network,
  ShieldCheck,
  BellRing,
  FileSpreadsheet,
  History,
  Settings,
  Activity,
  Sparkles,
  ChevronRight,
  LogOut,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export type NavigationPage =
  | 'dashboard'
  | 'live-monitoring'
  | 'analytics'
  | 'ai-analyst'
  | 'datasets'
  | 'pipelines'
  | 'data-quality'
  | 'alerts'
  | 'reports'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { logout, user } = useAuth();
  const role: UserRole = user?.role || 'viewer';

  const navigationGroups = [
    {
      label: 'IKHTISAR UTAMA',
      items: [
        { id: 'dashboard' as NavigationPage, label: 'Dasbor Utama', icon: LayoutDashboard },
        { id: 'live-monitoring' as NavigationPage, label: 'Pemantauan Langsung', icon: Radio, badge: 'LIVE' },
        { id: 'analytics' as NavigationPage, label: 'Eksplorasi Analitik', icon: BarChart3 },
        { id: 'ai-analyst' as NavigationPage, label: 'Analis Data AI', icon: Bot, isAi: true },
      ],
    },
    {
      label: 'MANAJEMEN DATA',
      items: [
        { id: 'datasets' as NavigationPage, label: 'Kumpulan Data & Impor', icon: Database, restrictedFor: ['viewer'] },
        { id: 'pipelines' as NavigationPage, label: 'Sumber Data & Pipeline', icon: Network },
        { id: 'data-quality' as NavigationPage, label: 'Kualitas Data', icon: ShieldCheck },
      ],
    },
    {
      label: 'OPERASIONAL & LAPORAN',
      items: [
        { id: 'alerts' as NavigationPage, label: 'Peringatan & Insiden', icon: BellRing },
        { id: 'reports' as NavigationPage, label: 'Laporan & Ekspor', icon: FileSpreadsheet },
        { id: 'audit' as NavigationPage, label: 'Log Aktivitas & Audit', icon: History, restrictedFor: ['viewer'] },
        { id: 'settings' as NavigationPage, label: 'Pengaturan', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (id: NavigationPage) => {
    onSelectPage(id);
    if (onCloseMobile) onCloseMobile();
  };

  const getRoleLabelIndo = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'Super Admin (Akses Penuh)';
      case 'data_analyst':
        return 'Data Analyst (Teknis Data)';
      case 'manager':
        return 'Manager (Operasional & Insiden)';
      case 'viewer':
        return 'Viewer (Hanya Lihat)';
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 h-full bg-white dark:bg-[#121622] border-r border-slate-200/80 dark:border-white/5 flex flex-col justify-between p-4 shrink-0 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Name */}
        <div>
          <div className="flex items-center justify-between px-2 py-2 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand-500 text-slate-900 flex items-center justify-center shadow-glow">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  DATAPULSE
                </span>
                <p className="text-[10px] text-slate-400 font-medium">Real-Time Intelligence</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Badge */}
          <div className="mx-1 mb-4 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <div className="truncate">
              <div className="text-[9px] text-slate-400 uppercase font-semibold">Peran Pengguna</div>
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                {getRoleLabelIndo(role)}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {navigationGroups.map((group) => (
              <div key={group.label}>
                <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    const isRestricted = item.restrictedFor?.includes(role);

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-brand-500/15 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold'
                            : isRestricted
                            ? 'text-slate-400/60 dark:text-slate-600 hover:bg-slate-100/50 dark:hover:bg-white/5'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive
                                ? 'text-brand-600 dark:text-brand-400'
                                : isRestricted
                                ? 'text-slate-400/50'
                                : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                            {item.badge}
                          </span>
                        )}

                        {item.isAi && <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status Card */}
        <div className="pt-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-white/10 shadow-lg relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-white">Aliran Data Real-Time</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
              Koneksi WebSocket Socket.IO aktif. 150+ data tersinkronisasi.
            </p>

            <button
              onClick={() => handleNavClick('live-monitoring')}
              className="w-full py-1.5 px-2.5 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all flex items-center justify-center gap-1 shadow-glow"
            >
              <span>Buka Monitor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Sign Out */}
          <button
            onClick={logout}
            className="w-full mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
};
