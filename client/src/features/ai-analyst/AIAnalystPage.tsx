import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Database, Terminal, BarChart2, Plus, ArrowUpRight, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';
import { AIMessage } from '../../types';

export const AIAnalystPage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content:
        'Halo! Saya adalah **DATAPULSE AI Data Analyst**. Saya terhubung langsung ke basis data MySQL aktual organisasi Anda. Silakan tanyakan analisis pendapatan, anomali data, perbandingan wilayah, atau tren kategori dalam Bahasa Indonesia maupun English.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Berapa total pendapatan dan transaksi saat ini?',
    'Kategori mana yang memberikan kontribusi pendapatan tertinggi?',
    'Bagaimana distribusi performa transaksi antar wilayah / region?',
    'Apakah terdapat anomali atau transaksi gagal dalam sistem?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsThinking(true);

    try {
      const res = await api.chatAI(text, conversationId);
      if (res.conversationId && !conversationId) {
        setConversationId(res.conversationId);
      }

      const assistantMsg: AIMessage = {
        id: res.messageId,
        sender: 'assistant',
        content: res.content,
        structuredAnalysis: res.analysis,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Maaf, terjadi kendala saat memproses kueri analitik. Pastikan basis data MySQL aktif.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        content:
          'Percakapan baru dimulai. Tanyakan apa pun seputar data transaksi dan pipeline real-time DATAPULSE.',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col h-full p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5 shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-500 text-slate-900 flex items-center justify-center shadow-glow">
            <Bot className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Analis Data AI (AI Data Analyst)
              </h1>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                Terhubung Aktual ke MySQL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Lapisan intelijensi percakapan dengan validasi kueri deterministik terverifikasi
            </p>
          </div>
        </div>

        <button
          onClick={startNewConversation}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Obrolan Baru</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const analysis = msg.structuredAnalysis;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-brand-500 text-slate-950 shadow-glow'
                }`}
              >
                {isUser ? 'Anda' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`p-4 rounded-2xl text-xs space-y-3 leading-relaxed ${
                  isUser
                    ? 'bg-brand-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <div>{msg.content}</div>

                {/* Grounded SQL Explanation & Chart Payload */}
                {analysis && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/5">
                    
                    {/* Underlying SQL Query Box with One-Click Copy */}
                    {analysis.sqlQuery && (
                      <div className="rounded-xl bg-slate-950 border border-white/10 p-2.5 font-mono text-[10px] text-emerald-400">
                        <div className="flex items-center justify-between text-slate-400 mb-1 text-[9px] uppercase font-bold">
                          <div className="flex items-center gap-1.5">
                            <Terminal className="w-3 h-3 text-slate-400" />
                            <span>Kueri SQL Terverifikasi yang Dieksekusi</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(analysis.sqlQuery || '');
                              setCopiedSql(analysis.sqlQuery || '');
                              setTimeout(() => setCopiedSql(null), 2000);
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                          >
                            {copiedSql === analysis.sqlQuery ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px] text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[9px]">Salin SQL</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="overflow-x-auto whitespace-pre-wrap">{analysis.sqlQuery}</div>
                      </div>
                    )}

                    {/* Chart Result Visualizer */}
                    {analysis.chartData && analysis.chartData.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                          <span>Distribusi Data ({analysis.chartType.toUpperCase()})</span>
                          <BarChart2 className="w-3.5 h-3.5 text-brand-500" />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {analysis.chartData.map((item) => (
                            <div key={item.label} className="space-y-0.5">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                  ${item.value.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-brand-500"
                                  style={{
                                    width: `${Math.min(
                                      (item.value /
                                        Math.max(...analysis.chartData.map((d) => d.value))) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Follow-up Questions */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                          Wawasan Lanjutan Rekomendasi AI:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.suggestions.map((sug) => (
                            <button
                              key={sug}
                              onClick={() => handleSendMessage(sug)}
                              className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-[10px] transition-all flex items-center gap-1"
                            >
                              <span>{sug}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-brand-500 text-slate-950 flex items-center justify-center animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/5">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
              <span>Menganalisis rekor data aktual dan menghitung nilai agregat...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          {sampleQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap border border-slate-200 dark:border-white/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-200 dark:border-white/5 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Tanyakan analisis data... (contoh: Bandingkan performa kategori bulan ini)"
            className="flex-1 bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="p-2.5 rounded-2xl bg-brand-500 text-slate-950 font-semibold hover:bg-brand-400 disabled:opacity-50 transition-all shadow-glow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

