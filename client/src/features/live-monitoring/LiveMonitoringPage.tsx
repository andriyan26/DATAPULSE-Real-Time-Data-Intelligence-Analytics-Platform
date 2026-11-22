import React, { useState } from 'react';
import { Radio, Pause, Play, Trash2, Eye, ShieldAlert, Database, Network, Clock, Activity } from 'lucide-react';
import { useSocket, LiveStreamEvent } from '../../context/SocketContext';
import { AnimatedCounter } from '../../components/ui/AnimatedCounter';

export const LiveMonitoringPage: React.FC = () => {
  const { liveEvents, isConnected, isPaused, togglePauseStream, clearEvents, latencyMs, lastEventTime } = useSocket();
  const [selectedEvent, setSelectedEvent] = useState<LiveStreamEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = liveEvents.filter((e) => {
    if (filterType === 'all') return true;
    return e.eventType.includes(filterType);
  });

  const getEventIcon = (type: string) => {
    if (type.includes('record')) return <Activity className="w-4 h-4 text-emerald-500" />;
    if (type.includes('pipeline')) return <Network className="w-4 h-4 text-blue-500" />;
    if (type.includes('alert')) return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    return <Database className="w-4 h-4 text-purple-500" />;
  };

  const getEventNameIndo = (type: string) => {
    if (type === 'record.created') return 'Rekor Transaksi Masuk (record.created)';
    if (type === 'dataset.imported') return 'Impor Dataset Selesai (dataset.imported)';
    if (type === 'pipeline.completed') return 'Sinkronisasi Pipeline Selesai (pipeline.completed)';
    if (type === 'alert.resolved') return 'Insiden Alert Diselesaikan (alert.resolved)';
    return type;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Pusat Pemantauan Langsung (Live Monitoring)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aliran pengiriman event real-time melalui koneksi terotentikasi WebSocket Socket.IO
          </p>
        </div>

        {/* Stream Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePauseStream}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isPaused
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Lanjutkan Aliran' : 'Jeda Aliran'}</span>
          </button>

          <button
            onClick={clearEvents}
            className="p-2 rounded-xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/10 text-slate-500 hover:text-rose-500 transition-colors shadow-sm"
            title="Bersihkan buffer event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Telemetry Bar with Animated Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status Koneksi</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {isConnected ? 'TERHUBUNG' : 'TERPUTUS'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Latensi Transmisi</span>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
            <AnimatedCounter value={latencyMs} suffix="ms" duration={1000} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Event di Buffer</span>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
            <AnimatedCounter value={liveEvents.length} suffix=" event" duration={1200} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Siaran Terakhir</span>
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-1.5 truncate">
            {lastEventTime ? new Date(lastEventTime).toLocaleTimeString('id-ID') : 'Menunggu data...'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Semua Event' },
          { id: 'record', label: 'Event Transaksi' },
          { id: 'pipeline', label: 'Event Pipeline' },
          { id: 'alert', label: 'Event Peringatan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'bg-white dark:bg-[#121622] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Stream Table & Event Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Stream List */}
        <div className={`${selectedEvent ? 'lg:col-span-7' : 'lg:col-span-12'} p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm transition-all`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Daftar Event Siaran Langsung</span>
            <span className="text-[10px] text-slate-400 font-mono">
              Memperbarui otomatis via Socket.IO
            </span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                {isPaused
                  ? 'Aliran streaming sedang dijeda. Klik "Lanjutkan Aliran" untuk melihat event masuk.'
                  : 'Mendengarkan event real-time yang masuk dari server MySQL...'}
              </div>
            ) : (
              filteredEvents.map((evt, idx) => (
                <div
                  key={evt.eventId}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    selectedEvent?.eventId === evt.eventId
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                      : idx === 0
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-slate-50/60 dark:bg-white/5 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-white/5 shrink-0">
                      {getEventIcon(evt.eventType)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{getEventNameIndo(evt.eventType)}</span>
                        {idx === 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                            TERBARU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {evt.payload?.customerName || evt.payload?.pipelineName || evt.payload?.title || evt.eventId}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Event Inspection Drawer */}
        {selectedEvent && (
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#121622] border border-slate-200/80 dark:border-white/5 shadow-sm flex flex-col justify-between animate-in fade-in duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5 mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Inspektur Payload Event</span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ID Event</span>
                  <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{selectedEvent.eventId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tipe Event</span>
                  <div className="font-mono text-brand-600 dark:text-brand-400 font-bold">{selectedEvent.eventType}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Waktu Stempel</span>
                  <div className="font-mono text-slate-600 dark:text-slate-400">{selectedEvent.timestamp}</div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Payload Data JSON</span>
                  <pre className="p-3 mt-1 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-3 text-[10px] text-slate-400">
              Payload tervalidasi yang dipancarkan dari mesin transactional outbox backend.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
