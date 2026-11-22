import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, Plus, CheckCircle2, Clock, AlertTriangle, ArrowRight, X, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { Incident, AlertRule } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMetric, setNewMetric] = useState('failed_rate');
  const [newOperator, setNewOperator] = useState('>');
  const [newThreshold, setNewThreshold] = useState('5.0');
  const [newSeverity, setNewSeverity] = useState<'info' | 'warning' | 'critical'>('warning');

  // RBAC permissions check
  const canCreateRule = user?.role === 'super_admin' || user?.role === 'data_analyst';
  const canAcknowledge = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'data_analyst';
  const canResolve = user?.role === 'super_admin' || user?.role === 'manager';

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const [incs, rls] = await Promise.all([api.getIncidents(), api.getAlertRules()]);
      setIncidents(incs);
      setRules(rls);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleUpdateIncident = async (id: string, nextStatus: 'ACKNOWLEDGED' | 'RESOLVED') => {
    try {
      await api.updateIncident(id, nextStatus);
      await loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Pembaruan status insiden gagal');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateRule) return;
    try {
      await api.createAlertRule({
        datasetId: 'ds-global-tx',
        title: newTitle,
        metric: newMetric,
        operator: newOperator,
        threshold: parseFloat(newThreshold),
        severity: newSeverity,
      });
      setIsRuleModalOpen(false);
      setNewTitle('');
      await loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Pembuatan aturan gagal');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pusat Peringatan & Manajemen Insiden
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deteksi pelanggaran batas SLA, pemantau anomali, dan siklus hidup insiden berjejak audit
          </p>
        </div>

        {canCreateRule && (
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Aturan Peringatan Baru</span>
          </button>
        )}
      </div>

      {/* Incidents Lifecycle Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          SIKLUS HIDUP INSIDEN (TERBUKA → DIAKUI → DISELESAIKAN)
        </h2>

        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inc.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {inc.severity === 'critical' ? 'Kritis' : 'Peringatan'}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inc.status === 'OPEN'
                        ? 'bg-rose-500 text-white'
                        : inc.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {inc.status === 'OPEN' ? 'TERBUKA' : inc.status === 'ACKNOWLEDGED' ? 'DIAKUI' : 'DISELESAIKAN'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(inc.created_at).toLocaleString('id-ID')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                  {inc.description}
                </p>

                {inc.status === 'ACKNOWLEDGED' && (
                  <div className="text-[10px] text-amber-500 font-bold">
                    Diakui oleh {inc.acknowledged_by_name || 'Maya Novak (Manager)'}
                  </div>
                )}
                {inc.status === 'RESOLVED' && (
                  <div className="text-[10px] text-emerald-500 font-bold">
                    Diselesaikan oleh {inc.resolved_by_name || 'Alex Mercer (Super Admin)'}
                  </div>
                )}
              </div>

              {/* Action Buttons based on Role & Lifecycle */}
              <div className="flex items-center gap-2 shrink-0">
                {inc.status === 'OPEN' && canAcknowledge && (
                  <button
                    onClick={() => handleUpdateIncident(inc.id, 'ACKNOWLEDGED')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all shadow-sm"
                  >
                    Akui Insiden
                  </button>
                )}
                {inc.status !== 'RESOLVED' && canResolve && (
                  <button
                    onClick={() => handleUpdateIncident(inc.id, 'RESOLVED')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-sm"
                  >
                    Selesaikan Insiden
                  </button>
                )}
                {user?.role === 'viewer' && (
                  <span className="text-xs text-slate-400 font-medium">Hanya Lihat</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Rules List */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white">Aturan Evaluasi Ambang Batas Aktif</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">Judul Aturan</th>
                <th className="py-2.5 px-3">Kumpulan Data</th>
                <th className="py-2.5 px-3">Kondisi Metrik</th>
                <th className="py-2.5 px-3">Ambang Batas</th>
                <th className="py-2.5 px-3">Jendela Waktu</th>
                <th className="py-2.5 px-3">Keparahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{r.title}</td>
                  <td className="py-2.5 px-3 text-slate-500">{r.dataset_name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                    {r.metric} {r.operator}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                    {r.threshold}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{r.time_window}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {r.severity === 'critical' ? 'Kritis' : 'Peringatan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Buat Aturan Peringatan Baru</h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Aturan</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="contoh: Lonjakan Kegagalan Ingesti > 5%"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Metrik</label>
                  <select
                    value={newMetric}
                    onChange={(e) => setNewMetric(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="failed_rate">Tingkat Kegagalan (%)</option>
                    <option value="freshness_lag">Keterlambatan Sinkron (mnt)</option>
                    <option value="volume_drop">Penurunan Volume (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Operator</label>
                  <select
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value=">">&gt; Lebih Besar</option>
                    <option value="<">&lt; Lebih Kecil</option>
                    <option value=">=">&gt;= Lebih Besar / Sama</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ambang Batas</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tingkat Keparahan</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="critical">Kritis</option>
                    <option value="warning">Peringatan</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 font-bold hover:bg-brand-400 shadow-glow"
                >
                  Simpan Aturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
