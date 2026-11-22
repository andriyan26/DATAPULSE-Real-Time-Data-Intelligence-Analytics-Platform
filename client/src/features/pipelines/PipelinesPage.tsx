import React, { useState, useEffect } from 'react';
import { Network, Play, RotateCw, CheckCircle, Clock, AlertTriangle, ArrowUpRight, Server, Database, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { DataSource, PipelineRun } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const PipelinesPage: React.FC = () => {
  const { user } = useAuth();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  // RBAC permissions check
  const canTrigger = user?.role === 'super_admin' || user?.role === 'data_analyst';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [srcs, rns] = await Promise.all([api.getDataSources(), api.getPipelineRuns()]);
      setSources(srcs);
      setRuns(rns);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetry = async (id: string) => {
    if (!canTrigger) return;
    try {
      await api.retryPipeline(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Eksekusi ulang gagal');
    }
  };

  const handleTriggerManual = async () => {
    if (!canTrigger) return;
    setTriggering(true);
    try {
      await api.triggerPipeline({ sourceId: 'src-1', pipelineName: 'Sinkronisasi Telemetri On-Demand' });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Trigger gagal');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sumber Data & Pipeline Ingesti
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Katalog konektor terkelola, sinkronisasi telemetri streaming, dan riwayat audit eksekusi
          </p>
        </div>

        {canTrigger ? (
          <button
            onClick={handleTriggerManual}
            disabled={triggering}
            className="px-3.5 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all flex items-center gap-1.5 shadow-glow disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current stroke-[1.5]" />
            <span>{triggering ? 'Menjalankan Pipeline...' : 'Jalankan Pipeline Manual'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Mode Hanya Lihat — Eksekusi dibatasi</span>
          </div>
        )}
      </div>

      {/* Data Sources Registry */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          KONEKTOR TERDAFTAR
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{src.type}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    src.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : src.status === 'syncing'
                      ? 'bg-blue-500/10 text-blue-500 animate-pulse'
                      : 'bg-slate-500/10 text-slate-400'
                  }`}
                >
                  {src.status === 'active' ? 'Aktif' : src.status === 'syncing' ? 'Sinkron' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{src.name}</h3>
              <p className="text-[10px] text-slate-400">
                Sinkron terakhir: {new Date(src.last_sync_at).toLocaleTimeString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Runs Table with Animated Counters */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <span className="text-xs font-bold text-slate-900 dark:text-white">Riwayat Eksekusi Pipeline</span>
          <button onClick={loadData} className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">Nama Pipeline</th>
                <th className="py-2.5 px-3">Konektor Sumber</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Waktu Mulai</th>
                <th className="py-2.5 px-3">Baris Dibaca</th>
                <th className="py-2.5 px-3">Baris Masuk</th>
                <th className="py-2.5 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {r.pipeline_name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{r.source_name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        r.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : r.status === 'running'
                          ? 'bg-blue-500/10 text-blue-500 animate-pulse'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {r.status === 'completed' ? 'Selesai' : r.status === 'running' ? 'Berjalan' : 'Gagal'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                    {new Date(r.started_at).toLocaleTimeString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    <AnimatedCounter value={r.rows_read} duration={1200} />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <AnimatedCounter value={r.rows_inserted} duration={1300} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {canTrigger ? (
                      <button
                        onClick={() => handleRetry(r.id)}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-bold"
                      >
                        Jalankan Ulang
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Hanya Lihat</span>
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
