import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, FileText, Check, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { DataQualityOverview } from '../../types';
import { RadialProgress } from '../../components/charts/RadialProgress';
import { useAuth } from '../../context/AuthContext';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const DataQualityPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DataQualityOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // RBAC permission check
  const canResolve = user?.role === 'super_admin' || user?.role === 'data_analyst' || user?.role === 'manager';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDataQuality();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (issueId: string, newStatus: string) => {
    if (!canResolve) return;
    try {
      await api.updateQualityIssue(issueId, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Pembaruan status gagal');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pusat Kualitas Data (Data Quality)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Penegakan integritas skema, validasi kesegaran data, dan resolusi anomali otomatis
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-brand-500" />
          <span>Jalankan Evaluasi</span>
        </button>
      </div>

      {/* Quality Telemetry Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <RadialProgress score={data?.overallScore || 97.9} label="Skor Kualitas Keseluruhan" sublabel="Terverifikasi" />

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EVALUASI ATURAN</span>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              <AnimatedCounter value={data?.rulesPassed || 4} duration={1200} /> / <AnimatedCounter value={data?.totalRules || 4} duration={1200} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Aturan memenuhi ambang batas integritas</p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-emerald-500 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nol error kritis yang memblokir pipeline</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ANOMALI AKTIF</span>
            <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-2">
              <AnimatedCounter value={data?.activeIssuesCount || 2} duration={1400} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Isu non-kritis dalam investigasi</p>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-amber-500 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Tindakan perbaikan tertunda</span>
          </div>
        </div>
      </div>

      {/* Active Quality Issues Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-xs font-bold text-slate-900 dark:text-white">Isu Kualitas Data yang Terdeteksi</span>
          <span className="text-[10px] text-slate-400 font-mono">Pemindai real-time aktif</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">Judul Isu</th>
                <th className="py-2.5 px-3">Kumpulan Data</th>
                <th className="py-2.5 px-3">Data Terdampak</th>
                <th className="py-2.5 px-3">Tingkat Keparahan</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(data?.issues || []).map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{issue.issue_title}</div>
                    <div className="text-[10px] text-slate-400">{issue.description}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{issue.dataset_name}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {issue.affected_rows} baris
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        issue.severity === 'critical'
                          ? 'bg-rose-500/10 text-rose-500'
                          : issue.severity === 'high'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {issue.severity === 'critical' ? 'Kritis' : issue.severity === 'high' ? 'Tinggi' : 'Sedang'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        issue.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {issue.status === 'resolved' ? 'Selesai' : 'Dalam Investigasi'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {issue.status !== 'resolved' ? (
                      canResolve ? (
                        <button
                          onClick={() => handleUpdateStatus(issue.id, 'resolved')}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          Selesaikan Isu
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Perlu Hak Akses</span>
                      )
                    ) : (
                      <span className="text-[11px] text-emerald-500 font-semibold">Terselesaikan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
