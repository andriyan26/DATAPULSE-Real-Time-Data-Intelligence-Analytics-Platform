import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, FileSpreadsheet, Check, AlertCircle, X, ChevronRight, Layers, Table, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Dataset, DatasetColumn } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const DatasetsPage: React.FC = () => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'overwrite' | 'error'>('skip');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // RBAC permissions check
  const canImport = user?.role === 'super_admin' || user?.role === 'data_analyst';

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0 && !selectedDataset) {
        loadDatasetDetails(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDatasetDetails = async (id: string) => {
    try {
      const details = await api.getDatasetDetails(id);
      setSelectedDataset(details);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsedRows = lines.slice(1, 100).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });
        return row;
      });

      setCsvRows(parsedRows);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (csvRows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.importCSV({
        datasetId: selectedDataset?.id || 'ds-global-tx',
        fileName: csvFileName || 'ingesti_manual.csv',
        rows: csvRows,
        duplicateStrategy,
      });
      setImportResult(res);
      await loadDatasets();
    } catch (err: any) {
      alert(err.message || 'Proses impor gagal');
    } finally {
      setImporting(false);
    }
  };

  const loadSampleCSV = () => {
    const sample = [
      { external_id: 'TX-2026-9501', transaction_date: '2026-10-28', category: 'Enterprise Cloud', region: 'North America', customer_name: 'Acme Global', quantity: '4', amount: '14500.00', status: 'completed' },
      { external_id: 'TX-2026-9502', transaction_date: '2026-10-29', category: 'Security Suite', region: 'Europe EMEA', customer_name: 'Nordic AI Corp', quantity: '2', amount: '8900.00', status: 'completed' },
      { external_id: 'TX-2026-9503', transaction_date: '2026-10-29', category: 'Consulting Services', region: 'Asia Pacific', customer_name: 'Beacon Tech', quantity: '1', amount: '4200.00', status: 'completed' },
      { external_id: 'TX-2026-9504', transaction_date: '2026-10-30', category: 'API Subscriptions', region: 'Latin America', customer_name: 'Solstice Networks', quantity: '10', amount: '3500.00', status: 'pending' },
    ];
    setCsvFileName('sample_revenue_batch.csv');
    setCsvRows(sample);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kumpulan Data & Pusat Impor (Datasets)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Katalog tabel enterprise, arsitektur skema kolom, dan pemroses berkas CSV tervalidasi
          </p>
        </div>

        {canImport ? (
          <button
            onClick={() => {
              setIsImportModalOpen(true);
              setImportResult(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all flex items-center gap-1.5 shadow-glow"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Impor Data CSV</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            <span>Hanya Super Admin & Data Analyst yang berhak mengimpor data</span>
          </div>
        )}
      </div>

      {/* Dataset Grid with Animated Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {datasets.map((ds) => {
          const isSelected = selectedDataset?.id === ds.id;
          return (
            <div
              key={ds.id}
              onClick={() => loadDatasetDetails(ds.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                  : 'bg-white dark:bg-[#121622] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className={`w-4 h-4 ${isSelected ? 'text-brand-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">{ds.source_type}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <AnimatedCounter value={Number(ds.quality_score)} decimals={1} suffix="% Kualitas" duration={1300} />
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{ds.name}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{ds.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  <AnimatedCounter value={ds.row_count} suffix=" data" duration={1400} />
                </span>
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1">
                  <span>Lihat Skema</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Schema & Column Inspector */}
      {selectedDataset && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ARSITEKTUR SKEMA KOLOM
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDataset.name} ({selectedDataset.code})
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {selectedDataset.columns?.length || 8} Kolom Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2.5 px-3">Nama Kolom (Field)</th>
                  <th className="py-2.5 px-3">Label Tampilan</th>
                  <th className="py-2.5 px-3">Tipe Data</th>
                  <th className="py-2.5 px-3">Dimensi</th>
                  <th className="py-2.5 px-3">Metrik</th>
                  <th className="py-2.5 px-3">Boleh Kosong (Nullable)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {(selectedDataset.columns || []).map((col) => (
                  <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                      {col.name}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{col.display_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
                        {col.data_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {col.is_dimension ? (
                        <span className="text-[10px] text-emerald-500 font-bold">Ya</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {col.is_metric ? (
                        <span className="text-[10px] text-blue-500 font-bold">Ya</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {col.is_nullable ? 'Ya' : 'Tidak'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Ingestion Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Impor Berkas Data CSV</h2>
                <p className="text-xs text-slate-400">Unggah berkas CSV ke dalam kumpulan data {selectedDataset?.name}</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ingestion Steps */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Pilih berkas CSV atau muat contoh batch demo
                </p>
                <p className="text-[11px] text-slate-400 mb-3">Maksimal 15MB • Deteksi header dan pemetaan kolom otomatis</p>

                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all">
                    <span>Pilih Berkas CSV</span>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={loadSampleCSV}
                    className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/30 text-xs font-bold hover:bg-brand-500/30 transition-all"
                  >
                    Muat Contoh Batch CSV
                  </button>
                </div>
              </div>

              {/* Duplicate Strategy & Settings */}
              {csvRows.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Berkas: {csvFileName} ({csvRows.length} data siap diimpor)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Strategi Resolusi Duplikasi ID:
                    </label>
                    <div className="flex gap-2 text-xs">
                      {[
                        { id: 'skip', label: 'Lewati Duplikat' },
                        { id: 'overwrite', label: 'Timpa Data Lama' },
                        { id: 'error', label: 'Batalkan jika Duplikat' },
                      ].map((strat) => (
                        <button
                          key={strat.id}
                          type="button"
                          onClick={() => setDuplicateStrategy(strat.id as any)}
                          className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            duplicateStrategy === strat.id
                              ? 'bg-brand-500 text-slate-950 border-brand-500'
                              : 'bg-transparent text-slate-400 border-slate-300 dark:border-white/10'
                          }`}
                        >
                          {strat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Results Box */}
              {importResult && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>
                      Berhasil mengimpor {importResult.validRows} data! (Gagal: {importResult.failedRows})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/5">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={csvRows.length === 0 || importing}
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold hover:bg-brand-400 transition-all disabled:opacity-50 shadow-glow"
              >
                {importing ? 'Memproses Ingesti...' : `Konfirmasi & Ingesti ${csvRows.length} Data`}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
