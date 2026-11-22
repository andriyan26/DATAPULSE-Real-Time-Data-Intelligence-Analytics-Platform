import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, Calendar, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // RBAC permission check
  const canExport = user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'data_analyst';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getReports();
        setReports(res);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleDownloadCSV = async () => {
    if (!canExport) {
      alert('Hak akses Viewer bersifat hanya baca (read-only). Silakan beralih ke peran Manager atau Analyst.');
      return;
    }
    setIsExporting(true);
    try {
      const blob = await api.exportCSV({
        category: selectedCategory || undefined,
        region: selectedRegion || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DATAPULSE_Laporan_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Ekspor gagal');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pusat Laporan & Ekspor Data (Reports)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Unduhan berkas dataset tersanitasi aman dari celah CSV Formula Injection
          </p>
        </div>

        {canExport ? (
          <button
            onClick={handleDownloadCSV}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all flex items-center gap-1.5 shadow-glow disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isExporting ? 'Membuat Berkas CSV...' : 'Ekspor CSV Tersaring'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Mode Hanya Lihat — Ekspor dibatasi</span>
          </div>
        )}
      </div>

      {exportNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Berkas CSV aman berhasil diunduh. Proteksi formula injection (=, +, -, @) telah diterapkan.</span>
        </div>
      )}

      {/* Filter Parameters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          KRITERIA FILTER EKSPOR
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Filter Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="">Semua Kategori</option>
              <option value="Enterprise Cloud">Enterprise Cloud</option>
              <option value="Hardware Edge">Hardware Edge</option>
              <option value="API Subscriptions">API Subscriptions</option>
              <option value="Consulting Services">Consulting Services</option>
              <option value="Security Suite">Security Suite</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Filter Wilayah</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="">Semua Wilayah</option>
              <option value="Asia Pacific">Asia Pacific</option>
              <option value="North America">North America</option>
              <option value="Europe EMEA">Europe EMEA</option>
              <option value="Latin America">Latin America</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedRegion('');
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold text-slate-500 hover:text-slate-200"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      </div>

      {/* Available Executive Reports Catalogue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-bold uppercase">{rep.type}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{rep.format}</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Sumber: {rep.dataset} (<AnimatedCounter value={rep.recordsCount} suffix=" data" duration={1200} />)
            </p>

            <div className="pt-2">
              <button
                onClick={handleDownloadCSV}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                  canExport
                    ? 'bg-slate-100 dark:bg-white/5 hover:bg-brand-500 hover:text-slate-950 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100/50 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{canExport ? 'Unduh Laporan CSV' : 'Hanya Lihat'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
