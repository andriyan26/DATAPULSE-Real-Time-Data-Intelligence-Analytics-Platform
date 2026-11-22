import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  FileDown,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Database,
  ShieldCheck,
  Radio,
  BarChart3,
  BellRing,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { CapsuleBarChart } from '../../components/charts/CapsuleBarChart';
import { RealTimePulseWidget } from '../../components/charts/RealTimePulseWidget';
import { RadialProgress } from '../../components/charts/RadialProgress';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';
import { NavigationPage } from '../../components/layout/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenImport: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onOpenImport }) => {
  const { liveEvents } = useSocket();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStoryFlow, setShowStoryFlow] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboardOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // When live events arrive from Socket.IO, update transaction count dynamically
  useEffect(() => {
    if (liveEvents.length > 0 && data) {
      setData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            totalRecords: prev.metrics.totalRecords + 1,
            liveTransactions: prev.metrics.liveTransactions + 1,
          },
        };
      });
    }
  }, [liveEvents]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 animate-page-entrance">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Memuat Mesin Intelijensi DATAPULSE...
          </span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalRecords: 25,
    completedTransactions: 10,
    runningPipelines: 12,
    openIncidents: 3,
    growthRate: 14.8,
    qualityScore: 97.9,
  };

  const isViewer = user?.role === 'viewer';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-page-entrance">
      
      {/* Header matching Video 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dasbor Utama
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">
              {user?.role === 'super_admin'
                ? 'TAMPILAN SUPER ADMIN'
                : user?.role === 'data_analyst'
                ? 'TAMPILAN DATA ANALYST'
                : user?.role === 'manager'
                ? 'TAMPILAN MANAGER'
                : 'TAMPILAN HANYA LIHAT (VIEWER)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ikhtisar telemetri real-time dan intelijensi lintas sumber data enterprise
          </p>
        </div>

        {/* Action Buttons matching Video 2 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (isViewer) {
                alert('Hak akses Viewer bersifat hanya baca. Silakan beralih ke peran Super Admin atau Analyst untuk mengimpor data.');
              } else {
                onOpenImport();
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-glow ${
              isViewer
                ? 'bg-slate-200 dark:bg-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-brand-500 text-slate-950 hover:bg-brand-400'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Proyek / Data</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            <span>Ekspor Laporan</span>
          </button>
        </div>
      </div>

      {/* Alur Ekosistem Data DATAPULSE — Menyampaikan alur jalan cerita to the point dan sangat jelas */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-[#101524] to-slate-950 text-white border border-white/10 shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-organic-pattern opacity-30 pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-glow">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Alur Ekosistem & Siklus Hidup Data DATAPULSE
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  END-TO-END PIPELINE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dari ingesti multi-sumber, validasi mutu, pemantauan real-time, hingga eksekusi analitik & keputusan bisnis
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowStoryFlow(!showStoryFlow)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
          >
            <span>{showStoryFlow ? 'Sembunyikan' : 'Buka Alur'}</span>
            {showStoryFlow ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showStoryFlow && (
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 animate-in fade-in duration-300">
            {/* Step 1 */}
            <div
              onClick={() => onNavigate('datasets')}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 cursor-pointer transition-all duration-200 group/step flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">FASE 1</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover/step:text-brand-400 transition-colors">1. Ingesti Multi-Sumber</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">MySQL, Stripe Webhook, Kafka, dan Berkas CSV</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-brand-400 font-bold">
                <span>150+ Rekor Terbaca</span>
                <ArrowRight className="w-3 h-3 group-hover/step:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => onNavigate('data-quality')}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 cursor-pointer transition-all duration-200 group/step flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">FASE 2</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover/step:text-brand-400 transition-colors">2. Mutu & Kualitas Data</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Validasi integritas skema, deteksi null & anomali</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-blue-400 font-bold">
                <span>Skor 97.9% Teruji</span>
                <ArrowRight className="w-3 h-3 group-hover/step:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => onNavigate('live-monitoring')}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 cursor-pointer transition-all duration-200 group/step flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">FASE 3</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover/step:text-brand-400 transition-colors">3. Aliran Real-Time</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Siaran telemetri WebSocket Socket.IO instan</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-purple-400 font-bold">
                <span>Latensi ~112ms</span>
                <ArrowRight className="w-3 h-3 group-hover/step:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => onNavigate('analytics')}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 cursor-pointer transition-all duration-200 group/step flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">FASE 4</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover/step:text-brand-400 transition-colors">4. Analitik & AI Cerdas</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Eksplorasi semantik bebas SQLi + Tanya jawab AI</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-amber-400 font-bold">
                <span>5 Kategori Terpetakan</span>
                <ArrowRight className="w-3 h-3 group-hover/step:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Step 5 */}
            <div
              onClick={() => onNavigate('alerts')}
              className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/50 hover:bg-white/10 cursor-pointer transition-all duration-200 group/step flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 font-bold">FASE 5</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover/step:text-brand-400 transition-colors">5. Keputusan & Mitigasi</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Tindakan insiden cepat dan ekspor laporan bisnis</p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-rose-400 font-bold">
                <span>Mitigasi Terkendali</span>
                <ArrowRight className="w-3 h-3 group-hover/step:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Stat Cards Row matching Video 2 (Numbers count up smoothly over 1-2 seconds!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects / Records */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => onNavigate('datasets')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Proyek & Data</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics.growthRate}%</span>
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            <AnimatedCounter value={metrics.totalRecords} duration={1400} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Di 4 konektor aktif terverifikasi</p>
        </div>

        {/* Closed / Processed */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => onNavigate('analytics')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Transaksi Selesai</span>
            <CheckCircle className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            <AnimatedCounter value={metrics.completedTransactions} duration={1500} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Berhasil diselesaikan penuh</p>
        </div>

        {/* Running Pipelines */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => onNavigate('pipelines')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pipeline Berjalan</span>
            <Clock className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            <AnimatedCounter value={metrics.runningPipelines} duration={1500} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Aliran ingesti data aktif</p>
        </div>

        {/* Pending Alerts / Incidents */}
        <div className="smooth-card p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => onNavigate('alerts')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Insiden Tertunda</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            <AnimatedCounter value={metrics.openIncidents} duration={1300} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Perlu tinjauan operasional segera</p>
        </div>

      </div>

      {/* Mid Section Grid: Capsule Bar Chart + Reminders + Pipelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Capsule Bar Chart (Project Analytics) matching Video 2 */}
        <div className="lg:col-span-5">
          <CapsuleBarChart data={data?.capsuleChart || []} />
        </div>

        {/* Critical Reminder / Incident Card matching Video 2 */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PENGINGAT PENTING</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2 text-rose-500 text-xs font-bold mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Pemeriksaan Halcyon Labs</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Lonjakan error abnormal terdeteksi pada API gateway Halcyon Labs kawasan EMEA.
              </p>
              <div className="text-[10px] text-slate-400 font-mono mt-2">
                Hari ini pukul 10:30 • SLA Kritis
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Mulai Investigasi Insiden</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Project & Pipeline Status List matching Video 2 */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Pipeline Ingesti Aktif</span>
              <button
                onClick={() => onNavigate('pipelines')}
                className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Lihat semua
              </button>
            </div>

            <div className="space-y-3">
              {(data?.pipelineRuns || []).slice(0, 3).map((pipe: any) => (
                <div key={pipe.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        pipe.status === 'completed'
                          ? 'bg-emerald-500'
                          : pipe.status === 'running'
                          ? 'bg-blue-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{pipe.pipeline_name}</div>
                      <div className="text-[10px] text-slate-400">{pipe.source_name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 uppercase">
                    {pipe.status === 'completed' ? 'SELESAI' : pipe.status === 'running' ? 'BERJALAN' : 'TERTUNDA'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Aliran Kafka & Webhook Stripe Aktif</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Lower Section Grid: Team Collaboration + Radial Quality Progress + Time Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Team Collaboration Card matching Video 2 */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Kolaborasi Anggota Tim</h3>
              <span className="text-[10px] text-slate-400">4 Anggota Aktif</span>
            </div>

            <div className="space-y-3">
              {(data?.teamMembers || []).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-sm"
                      style={{ backgroundColor: m.avatar_color || '#3B82F6' }}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {m.role === 'super_admin' ? 'Super Admin' : m.role === 'data_analyst' ? 'Data Analyst' : m.role === 'manager' ? 'Manager' : 'Viewer'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full font-semibold">
                    {m.department}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-1"
          >
            <span>Kelola Tim & Hak Akses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Circular Radial Quality Score Gauge with Smooth 1-2s Progress */}
        <div className="lg:col-span-3">
          <RadialProgress score={metrics.qualityScore} label="Progres Kualitas" sublabel="Tingkat Integritas" />
        </div>

        {/* Time Tracker / Real-Time Pulse Widget matching Video 2 */}
        <div className="lg:col-span-4">
          <RealTimePulseWidget />
        </div>

      </div>

    </div>
  );
};
