import React, { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchAction, setSearchAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        action: searchAction,
      });
      const res = await api.getAuditLogs(params.toString());
      setLogs(res.logs || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, searchAction]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-page-entrance">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Log Aktivitas & Audit Forensik
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Jejak audit permanen atas seluruh perubahan data, sesi login, dan tindakan administratif sistem
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchAction}
            onChange={(e) => {
              setSearchAction(e.target.value);
              setPage(1);
            }}
            placeholder="Cari jenis tindakan/aksi..."
            className="w-full bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200/80 dark:border-white/5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] uppercase font-bold">
                <th className="py-2.5 px-3">Waktu & Tanggal</th>
                <th className="py-2.5 px-3">Pengguna / Aktor</th>
                <th className="py-2.5 px-3">Jenis Tindakan</th>
                <th className="py-2.5 px-3">Entitas Terkait</th>
                <th className="py-2.5 px-3">Alamat IP</th>
                <th className="py-2.5 px-3">Rincian Detail Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 font-mono text-[11px]">
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                    {log.user_email || 'Sistem Otomatis'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 text-[10px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{log.entity_type}</td>
                  <td className="py-2.5 px-3 text-slate-500">{log.ip_address}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

