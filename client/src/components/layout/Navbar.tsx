import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, Menu, ChevronDown, CheckCircle2, Shield, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { NotificationItem, UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenMobileMenu }) => {
  const { user, login } = useAuth();
  const { mode, toggleMode } = useTheme();
  const { isConnected, latencyMs } = useSocket();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'nt-1',
      title: 'Insiden Kritis Terdeteksi',
      message: 'Lonjakan error abnormal pada API Gateway kawasan EMEA terdeteksi.',
      type: 'alert',
      is_read: false,
      created_at: '2 mnt lalu',
    },
    {
      id: 'nt-2',
      title: 'Pipeline Ingesti Selesai',
      message: 'Sinkronisasi Pembayaran berhasil memproses 3.532 data.',
      type: 'pipeline',
      is_read: false,
      created_at: '15 mnt lalu',
    },
    {
      id: 'nt-3',
      title: 'Pembaruan Kualitas Data',
      message: 'Skor integritas data dievaluasi pada 97.9%.',
      type: 'dataset',
      is_read: true,
      created_at: '1 jam lalu',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'DP';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIndo = (r?: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'Super Admin';
      case 'data_analyst':
        return 'Data Analyst';
      case 'manager':
        return 'Manager';
      case 'viewer':
        return 'Viewer (Hanya Lihat)';
      default:
        return 'Pengguna';
    }
  };

  const switchRole = async (targetRole: 'admin' | 'analyst' | 'manager' | 'viewer') => {
    const creds = {
      admin: { email: 'admin@datapulse.io', password: 'Admin123!' },
      analyst: { email: 'analyst@datapulse.io', password: 'Analyst123!' },
      manager: { email: 'manager@datapulse.io', password: 'Manager123!' },
      viewer: { email: 'viewer@datapulse.io', password: 'Viewer123!' },
    }[targetRole];

    await login(creds);
    setShowRoleSwitcher(false);
  };

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200/80 dark:border-white/5 bg-white/90 dark:bg-[#121622]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 transition-colors duration-200 z-30">
      
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 w-full max-w-md">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-400 text-xs cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">Cari data transaksi, pipeline, metrik...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Real-time Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
            {isConnected ? 'LANGSUNG' : 'TERPUTUS'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isConnected ? `${latencyMs}ms` : ''}
          </span>
        </div>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleMode}
          title={`Beralih ke mode ${mode === 'dark' ? 'Terang' : 'Gelap'}`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all relative"
            title="Pemberitahuan"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#181d28] border border-slate-200 dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Pemberitahuan Sistem</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      n.is_read
                        ? 'bg-transparent text-slate-400'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.created_at}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill with Quick Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200/80 dark:border-white/10 hover:opacity-90 transition-opacity"
            title="Klik untuk beralih Peran Pengguna (RBAC)"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
              style={{ backgroundColor: user?.avatarColor || '#10B981' }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'Alex Mercer'}
              </span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                <span>{getRoleIndo(user?.role)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </button>

          {/* Quick Role Switcher Dropdown (Solves: "MASA SEMUANYA SAMA HAK AKSES NYA!!") */}
          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#181d28] border border-slate-200 dark:border-white/10 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="pb-2 border-b border-slate-100 dark:border-white/5 mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Beralih Akun / Hak Akses (RBAC)</span>
                <p className="text-[10px] text-slate-400">Pilih peran untuk menguji pembatasan fitur nyata:</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => switchRole('admin')}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    user?.role === 'super_admin'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">Super Admin (Alex Mercer)</div>
                    <div className="text-[10px] text-slate-400">Akses penuh: kelola peran, pipeline, impor</div>
                  </div>
                  {user?.role === 'super_admin' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>

                <button
                  onClick={() => switchRole('analyst')}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    user?.role === 'data_analyst'
                      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">Data Analyst (Priya Raman)</div>
                    <div className="text-[10px] text-slate-400">Teknis data: impor CSV, kueri semantik, AI</div>
                  </div>
                  {user?.role === 'data_analyst' && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>

                <button
                  onClick={() => switchRole('manager')}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    user?.role === 'manager'
                      ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">Manager (Maya Novak)</div>
                    <div className="text-[10px] text-slate-400">Operasional: acknowledge/resolve insiden, ekspor</div>
                  </div>
                  {user?.role === 'manager' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                </button>

                <button
                  onClick={() => switchRole('viewer')}
                  className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition-colors ${
                    user?.role === 'viewer'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">Viewer (David Chen)</div>
                    <div className="text-[10px] text-slate-400">Hanya lihat: semua tombol aksi dimatikan</div>
                  </div>
                  {user?.role === 'viewer' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
