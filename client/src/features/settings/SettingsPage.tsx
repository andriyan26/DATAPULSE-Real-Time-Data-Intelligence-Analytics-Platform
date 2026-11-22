import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Palette, Shield, Check, Save, ShieldAlert } from 'lucide-react';
import { useTheme, AccentColor, WeekStartDay } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { accent, setAccent, weekStart, setWeekStart, mode, setMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'appearance' | 'profile' | 'team'>('appearance');
  const [profileName, setProfileName] = useState(user?.name || 'Alex Mercer');
  const [profileDept, setProfileDept] = useState(user?.department || 'Executive Administration');
  const [saveNotice, setSaveNotice] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const res = await api.getWorkspaceSettings();
        setTeamMembers(res.members || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadWorkspace();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name: profileName, department: profileDept });
      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2500);
    } catch (err) {
      alert('Gagal memperbarui profil pengguna');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await api.updateUserRole(memberId, newRole);
      const res = await api.getWorkspaceSettings();
      setTeamMembers(res.members || []);
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah peran anggota');
    }
  };

  const accents: Array<{ id: AccentColor; label: string; colorClass: string }> = [
    { id: 'forest', label: 'Forest (Hijau Zamrud)', colorClass: 'bg-emerald-500' },
    { id: 'ocean', label: 'Ocean (Biru Sian)', colorClass: 'bg-blue-500' },
    { id: 'plum', label: 'Plum (Ungu Magenta)', colorClass: 'bg-purple-500' },
    { id: 'ember', label: 'Ember (Kuning Amber)', colorClass: 'bg-amber-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-page-entrance">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pengaturan Sistem (Settings)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola preferensi tema visual, akun pengguna, dan manajemen hak akses tim organisasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Secondary Navigation matching Video 2 */}
        <div className="md:col-span-3 space-y-1">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'appearance'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Tampilan & Tema</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Pengguna</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'team'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Manajemen Tim & Hak Akses</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-9 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-6">
          
          {/* Appearance Settings matching Video 2 frame 00:25! */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-page-entrance">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Tampilan Antarmuka</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Warna aksen mewarnai seluruh workspace dan disimpan secara otomatis di peramban ini.
                </p>
              </div>

              {/* Accent Selector matching Video 2 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  WARNA AKSEN SISTEM
                </label>
                <div className="flex flex-wrap gap-3">
                  {accents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setAccent(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                        accent === item.id
                          ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white font-semibold ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${item.colorClass}`} />
                      <span>{item.label}</span>
                      {accent === item.id && <Check className="w-3.5 h-3.5 text-brand-500 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Week Starts On matching Video 2 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  HARI PERTAMA DALAM SEMINGGU
                </label>
                <div className="flex gap-2 text-xs">
                  {[
                    { id: 'Sunday', label: 'Minggu' },
                    { id: 'Monday', label: 'Senin' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setWeekStart(d.id as any)}
                      className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                        weekStart === d.id
                          ? 'bg-brand-500 text-slate-900 font-bold border-brand-500 shadow-sm'
                          : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Mode Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  MODE TEMA
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setMode('light')}
                    className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                      mode === 'light'
                        ? 'bg-white text-slate-900 border-slate-300 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    Mode Terang (Light)
                  </button>
                  <button
                    onClick={() => setMode('dark')}
                    className={`px-4 py-2 rounded-xl border font-medium transition-all ${
                      mode === 'dark'
                        ? 'bg-slate-900 text-white border-white/20 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                  >
                    Mode Gelap (Dark)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 animate-page-entrance">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Profil Pengguna</h2>
                <p className="text-xs text-slate-400 mt-0.5">Identitas akun dan peran operasional Anda dalam sistem</p>
              </div>

              {saveNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profil berhasil diperbarui!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Departemen / Divisi</label>
                  <input
                    type="text"
                    value={profileDept}
                    onChange={(e) => setProfileDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Alamat Email Terdaftar</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'admin@datapulse.io'}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Peran yang Ditugaskan</label>
                  <input
                    type="text"
                    disabled
                    value={
                      user?.role === 'super_admin'
                        ? 'Super Admin (Akses Penuh)'
                        : user?.role === 'data_analyst'
                        ? 'Data Analyst (Teknis Data)'
                        : user?.role === 'manager'
                        ? 'Manager (Operasional & Insiden)'
                        : 'Viewer (Hanya Lihat)'
                    }
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 text-slate-900 text-xs font-semibold hover:bg-brand-400 transition-all flex items-center gap-1.5 shadow-glow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          )}

          {/* Team & Access (RBAC) */}
          {activeTab === 'team' && (
            <div className="space-y-4 animate-page-entrance">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Manajemen Tim & Hak Akses (RBAC)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kelola anggota organisasi dan penetapan tingkat hak akses operasional (Super Admin, Analyst, Manager, Viewer)
                </p>
              </div>

              {user?.role !== 'super_admin' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Mode Terbatas: Hanya akun berstatus <strong>Super Admin</strong> yang memiliki wewenang untuk mengubah peran dan hak akses pengguna lain.</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Nama Anggota</th>
                      <th className="py-2.5 px-3">Email Pengguna</th>
                      <th className="py-2.5 px-3">Departemen</th>
                      <th className="py-2.5 px-3">Tingkat Hak Akses (Peran)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{member.email}</td>
                        <td className="py-2.5 px-3 text-slate-500">{member.department}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            disabled={user?.role !== 'super_admin'}
                            className={`border rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                              user?.role === 'super_admin'
                                ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 cursor-pointer'
                                : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <option value="super_admin">Super Admin (Akses Penuh)</option>
                            <option value="data_analyst">Data Analyst (Teknis Data)</option>
                            <option value="manager">Manager (Operasional & Insiden)</option>
                            <option value="viewer">Viewer (Hanya Lihat)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

