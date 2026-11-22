import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table as TableIcon,
  Play,
  BookmarkPlus,
  ArrowUpDown,
  Search,
  Filter,
  Layers,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { TransactionRecord } from '../../types';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const AnalyticsExplorerPage: React.FC = () => {
  const [dimension, setDimension] = useState<string>('category');
  const [metric, setMetric] = useState<string>('amount');
  const [aggregation, setAggregation] = useState<string>('SUM');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'donut' | 'table'>('bar');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBarsAnimated, setIsBarsAnimated] = useState(false);

  // Drill-down Modal State
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [drillRecords, setDrillRecords] = useState<TransactionRecord[]>([]);
  const [selectedDrillVal, setSelectedDrillVal] = useState<string>('');
  const [isDrillLoading, setIsDrillLoading] = useState(false);

  const runQuery = async () => {
    setIsLoading(true);
    setIsBarsAnimated(false);
    try {
      const res = await api.executeAnalyticsQuery({
        dimension,
        metric,
        aggregation,
        chartType,
      });
      setQueryResults(res.results || []);
      setSummary(res.summary || {});
      // Trigger smooth 1-2s animated entrance of bars
      setTimeout(() => setIsBarsAnimated(true), 80);
    } catch (err) {
      console.error('Kueri analitik gagal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runQuery();
  }, [dimension, metric, aggregation]);

  const handleDrillDown = async (dimVal: string) => {
    setSelectedDrillVal(dimVal);
    setDrillModalOpen(true);
    setIsDrillLoading(true);
    try {
      const res = await api.getDrillDown(dimension, dimVal);
      setDrillRecords(res.records || []);
    } catch (err) {
      console.error('Gagal memuat rekor drill-down:', err);
    } finally {
      setIsDrillLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    try {
      await api.saveAnalysis({
        title: `${aggregation} dari ${metric} berdasarkan ${dimension}`,
        dimension,
        metric,
        aggregation,
        chartType,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Gagal menyimpan analisis:', err);
    }
  };

  const maxVal = Math.max(...queryResults.map((r) => r.value), 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Eksplorasi Analitik
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lapisan eksplorasi semantik terkelola dan aman tanpa risiko injeksi SQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAnalysis}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <BookmarkPlus className="w-4 h-4 text-brand-500" />
            <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Analisis'}</span>
          </button>
        </div>
      </div>

      {/* Semantic Query Builder Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Dimensi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              DIMENSI (KELOMPOKKAN)
            </label>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="category">Kategori Bisnis</option>
              <option value="region">Wilayah Regional</option>
              <option value="status">Status Penyelesaian</option>
              <option value="transaction_date">Tanggal Transaksi</option>
              <option value="customer_name">Klien / Akun Mitra</option>
            </select>
          </div>

          {/* Kolom Metrik */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              KOLOM METRIK
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="amount">Nilai Pendapatan ($)</option>
              <option value="quantity">Jumlah Unit / Kuantitas</option>
              <option value="id">Jumlah Rekor Transaksi</option>
            </select>
          </div>

          {/* Agregasi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              AGREGASI
            </label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="SUM">JUMLAH (SUM)</option>
              <option value="AVG">RATA-RATA (AVG)</option>
              <option value="COUNT">HITUNG (COUNT)</option>
              <option value="MAX">MAKSIMUM (MAX)</option>
              <option value="MIN">MINIMUM (MIN)</option>
            </select>
          </div>

          {/* Visualisasi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              VISUALISASI
            </label>
            <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
              <button
                onClick={() => setChartType('bar')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  chartType === 'bar' ? 'bg-white dark:bg-white/15 text-brand-500 shadow-sm' : 'text-slate-400'
                }`}
                title="Diagram Batang"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  chartType === 'line' ? 'bg-white dark:bg-white/15 text-brand-500 shadow-sm' : 'text-slate-400'
                }`}
                title="Diagram Garis"
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('donut')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  chartType === 'donut' ? 'bg-white dark:bg-white/15 text-brand-500 shadow-sm' : 'text-slate-400'
                }`}
                title="Diagram Donut"
              >
                <PieChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('table')}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  chartType === 'table' ? 'bg-white dark:bg-white/15 text-brand-500 shadow-sm' : 'text-slate-400'
                }`}
                title="Tabel Data"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Query Results & Visualizations with Smooth 1-2s Animations */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        
        {/* Summary Metric Header (Animates smoothly from 0) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 gap-3">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TOTAL NILAI</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                <AnimatedCounter
                  value={summary?.totalValue || 0}
                  prefix={metric === 'amount' ? '$' : ''}
                  decimals={metric === 'amount' ? 2 : 0}
                  duration={1400}
                />
              </div>
            </div>
            <div className="border-l border-slate-200 dark:border-white/10 pl-6">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">JUMLAH KELOMPOK</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                <AnimatedCounter value={summary?.groupCount || queryResults.length} duration={1200} />
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            Dihitung dalam {summary?.executionTimeMs || 8}ms
          </span>
        </div>

        {/* Dynamic Chart Display with Smooth 1-2s Bar Growth */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-slate-400">Mengkalkulasi agregasi semantik...</span>
          </div>
        ) : chartType === 'bar' ? (
          <div className="space-y-4 pt-2">
            {queryResults.map((item, index) => {
              const targetPct = ((item.value / maxVal) * 100).toFixed(1);
              const currentPct = isBarsAnimated ? targetPct : 0;

              return (
                <div
                  key={item.dimension}
                  onClick={() => handleDrillDown(item.dimension)}
                  className="group cursor-pointer space-y-1.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 transition-colors flex items-center gap-1.5">
                      <span>{item.dimension || 'Tidak Terdefinisi'}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({item.count} data • Klik untuk rincian data)
                      </span>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      <AnimatedCounter
                        value={item.value}
                        prefix={metric === 'amount' ? '$' : ''}
                        decimals={metric === 'amount' ? 2 : 0}
                        duration={1200}
                      />
                    </span>
                  </div>

                  {/* Horizontal Bar with Smooth 1-2s Animated Width */}
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 group-hover:bg-brand-400 transition-all duration-1000 ease-out"
                      style={{
                        width: `${currentPct}%`,
                        transitionDelay: `${index * 90}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Kunci Dimensi</th>
                  <th className="py-2.5 px-3">Nilai Agregasi</th>
                  <th className="py-2.5 px-3">Jumlah Rekor</th>
                  <th className="py-2.5 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {queryResults.map((r) => (
                  <tr key={r.dimension} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {r.dimension || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      <AnimatedCounter
                        value={r.value}
                        prefix={metric === 'amount' ? '$' : ''}
                        decimals={metric === 'amount' ? 2 : 0}
                        duration={1200}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                      {r.count} data
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDrillDown(r.dimension)}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-bold"
                      >
                        Lihat Rincian
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Drill-down Modal */}
      {drillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Rincian Data Sumber (Drill-Down)
                </h2>
                <p className="text-xs text-slate-400">
                  Rekor data transaksi individual di balik dimensi <span className="font-bold text-brand-500">{dimension}</span> = "{selectedDrillVal}"
                </p>
              </div>

              <button
                onClick={() => setDrillModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drill-down table */}
            <div className="flex-1 overflow-y-auto">
              {isDrillLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Memuat rekor data sumber...</div>
              ) : drillRecords.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">Tidak ada rekor data yang ditemukan.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase">
                      <th className="py-2 px-2.5">Kode Transaksi</th>
                      <th className="py-2 px-2.5">Tanggal</th>
                      <th className="py-2 px-2.5">Klien / Akun</th>
                      <th className="py-2 px-2.5">Kategori</th>
                      <th className="py-2 px-2.5">Jumlah Nilai ($)</th>
                      <th className="py-2 px-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {drillRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-2 px-2.5 font-mono text-slate-400">{rec.external_id}</td>
                        <td className="py-2 px-2.5 text-slate-500">{rec.transaction_date}</td>
                        <td className="py-2 px-2.5 font-semibold text-slate-800 dark:text-slate-200">{rec.customer_name}</td>
                        <td className="py-2 px-2.5 text-slate-400">{rec.category}</td>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-900 dark:text-white">
                          ${Number(rec.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2.5">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              rec.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {rec.status === 'completed' ? 'Selesai' : rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setDrillModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-white hover:opacity-90"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
