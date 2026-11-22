import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme, AccentColor } from '../../context/ThemeContext';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const { accent, setAccent } = useTheme();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@datapulse.io');
  const [password, setPassword] = useState('Admin123!');
  const [name, setName] = useState('Alex Mercer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Lamp starts OFF matching Video 1 initial state, pull cord turns it ON to reveal the form
  const [isLampOn, setIsLampOn] = useState(false);
  const [isCordPulled, setIsCordPulled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 4 Color Swatches matching Video 1
  const colorDots: Array<{ id: AccentColor; hex: string; name: string; glow: string }> = [
    { id: 'ocean', hex: '#06B6D4', name: 'Neon Cyan', glow: 'rgba(6, 182, 212, 0.45)' },
    { id: 'ember', hex: '#F59E0B', name: 'Warm Amber', glow: 'rgba(245, 158, 11, 0.45)' },
    { id: 'plum', hex: '#EC4899', name: 'Electric Magenta', glow: 'rgba(236, 72, 153, 0.45)' },
    { id: 'forest', hex: '#10B981', name: 'Forest Emerald', glow: 'rgba(16, 185, 129, 0.45)' },
  ];

  const currentColor = colorDots.find((c) => c.id === accent) || colorDots[0];

  const handlePullCord = () => {
    setIsCordPulled(true);
    setTimeout(() => {
      setIsCordPulled(false);
      setIsLampOn((prev) => !prev);
    }, 180);
  };

  const handleRoleFill = (role: 'admin' | 'analyst' | 'manager' | 'viewer') => {
    if (role === 'admin') {
      setEmail('admin@datapulse.io');
      setPassword('Admin123!');
      setName('Alex Mercer');
    } else if (role === 'analyst') {
      setEmail('analyst@datapulse.io');
      setPassword('Analyst123!');
      setName('Priya Raman');
    } else if (role === 'manager') {
      setEmail('manager@datapulse.io');
      setPassword('Manager123!');
      setName('Maya Novak');
    } else {
      setEmail('viewer@datapulse.io');
      setPassword('Viewer123!');
      setName('David Chen');
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        await register({ name, email, password, role: 'viewer' });
      } else {
        await login({ email, password });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Autentikasi gagal. Silakan periksa kembali email dan sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080a0f] relative flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden select-none">
      {/* Background Starry / Organic Wave Pattern */}
      <div className="absolute inset-0 bg-organic-pattern pointer-events-none opacity-90" />

      {/* Main Outer Stage Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

        {/* Dual-Column Stage (Lamp on Left, Form Card on Right) */}
        <div className="w-full relative min-h-[540px] flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8">
          
          {/* ========================================================= */}
          {/* LEFT: Desk Lamp with Tilted Shade & Pull Cord             */}
          {/* ========================================================= */}
          <div className="relative w-full md:w-[380px] h-[480px] shrink-0 flex flex-col items-center justify-center">
            
            {/* Spotlight Beam Projecting Diagonally towards the Right Form */}
            <div
              className={`absolute left-[160px] top-[90px] w-[580px] h-[400px] pointer-events-none transition-all duration-700 origin-top-left ${
                isLampOn ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{
                background: `conic-gradient(from 105deg at 0% 0%, transparent 0deg, ${currentColor.hex}40 18deg, ${currentColor.hex}15 45deg, transparent 70deg)`,
                filter: 'blur(22px)',
                zIndex: 15,
              }}
            />

            {/* Core Lamp SVG Structure */}
            <svg
              className="w-full h-full drop-shadow-2xl relative z-20"
              viewBox="0 0 340 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Base Metallic Gradient */}
                <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                {/* Metallic Stem Gradient */}
                <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>

                {/* Shade Outer Gradient */}
                <linearGradient id="shadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e2536" />
                  <stop offset="50%" stopColor="#131722" />
                  <stop offset="100%" stopColor="#0b0e17" />
                </linearGradient>

                {/* Bulb Glow Filter */}
                <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Floor Shadow under Base */}
              <ellipse cx="110" cy="382" rx="72" ry="14" fill="#000000" opacity="0.65" />
              {isLampOn && (
                <ellipse
                  cx="110"
                  cy="382"
                  rx="68"
                  ry="12"
                  fill={currentColor.hex}
                  opacity="0.25"
                  className="transition-all duration-500"
                />
              )}

              {/* Lamp Base (Beveled Heavy Metal) */}
              <ellipse cx="110" cy="374" rx="65" ry="14" fill="url(#baseGrad)" stroke="#475569" strokeWidth="1.5" />
              <ellipse cx="110" cy="370" rx="52" ry="10" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <ellipse cx="110" cy="368" rx="20" ry="5" fill="#0f172a" />

              {/* Lower Stem Arm (Slanted up-right) */}
              <path
                d="M 110 368 Q 115 280 135 220"
                stroke="url(#stemGrad)"
                strokeWidth="7"
                strokeLinecap="round"
              />

              {/* Lower Knuckle Joint */}
              <circle cx="135" cy="220" r="9" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
              <circle cx="135" cy="220" r="4" fill="#64748b" />

              {/* Upper Stem Arm (Slanted toward head) */}
              <path
                d="M 135 220 Q 155 160 178 120"
                stroke="url(#stemGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Head Knuckle Joint */}
              <circle cx="178" cy="120" r="8" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />

              {/* Tilted Lamp Shade Group (Rotated 36 degrees to shine rightward) */}
              <g transform="translate(178, 120) rotate(36)">
                {/* Socket Cap */}
                <rect x="-10" y="-8" width="20" height="12" rx="3" fill="#64748b" />

                {/* Shade Bell Outer */}
                <path
                  d="M -10 4 C -28 20 -44 50 -48 76 L 48 76 C 44 50 28 20 10 4 Z"
                  fill="url(#shadeGrad)"
                  stroke={isLampOn ? currentColor.hex : '#334155'}
                  strokeWidth="2"
                  className="transition-colors duration-500"
                />

                {/* Shade Metallic Accent Ring */}
                <path d="M -36 50 C -15 56 15 56 36 50" stroke="#475569" strokeWidth="1.5" fill="none" />

                {/* Shade Mouth Rim */}
                <ellipse
                  cx="0"
                  cy="76"
                  rx="48"
                  ry="12"
                  fill={isLampOn ? `${currentColor.hex}33` : '#0f172a'}
                  stroke={isLampOn ? currentColor.hex : '#475569'}
                  strokeWidth="2"
                  className="transition-colors duration-500"
                />

                {/* Bulb Inside Shade */}
                <ellipse
                  cx="0"
                  cy="72"
                  rx="20"
                  ry="9"
                  fill={isLampOn ? '#ffffff' : '#334155'}
                  filter={isLampOn ? 'url(#bulbGlow)' : 'none'}
                  className="transition-all duration-300"
                />

                {/* Bright Light Aura when ON */}
                {isLampOn && (
                  <ellipse
                    cx="0"
                    cy="80"
                    rx="38"
                    ry="14"
                    fill={currentColor.hex}
                    opacity="0.8"
                    filter="url(#bulbGlow)"
                    className="transition-all duration-500"
                  />
                )}
              </g>

              {/* Hanging Pull Cord Mechanism (Vertical from head joint) */}
              <g
                onClick={handlePullCord}
                className="cursor-pointer group"
              >
                {/* Vertical Cord Chain */}
                <line
                  x1="184"
                  y1="126"
                  x2="184"
                  y2={isCordPulled ? '260' : '230'}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                  className="transition-all duration-150 group-hover:stroke-amber-300"
                />

                {/* Golden Pull Ring Handle */}
                <g transform={`translate(184, ${isCordPulled ? 260 : 230})`}>
                  <circle
                    cx="0"
                    cy="8"
                    r="9"
                    fill="#181d28"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    className="transition-transform duration-150 group-hover:scale-110 shadow-lg"
                  />
                  <circle cx="0" cy="8" r="3.5" fill="#fbbf24" />
                </g>
              </g>
            </svg>

            {/* Clickable Tooltip under Lamp */}
            <div className="mt-[-10px] z-30">
              <button
                type="button"
                onClick={handlePullCord}
                className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2 shadow-lg ${
                  isLampOn
                    ? 'bg-slate-900/90 text-slate-300 border-white/10 hover:bg-slate-800'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 animate-bounce'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: isLampOn ? currentColor.hex : '#F59E0B' }} />
                <span>{isLampOn ? 'Tarik tali untuk mematikan lampu' : '✨ Tarik tali untuk menyalakan lampu'}</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: Login Form Card (REVEALED ONLY WHEN LAMP IS ON!)   */}
          {/* ========================================================= */}
          <div
            className={`w-full max-w-md transition-all duration-700 ease-out z-20 ${
              isLampOn
                ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto blur-0'
                : 'opacity-0 scale-95 translate-x-6 pointer-events-none blur-sm'
            }`}
          >
            {/* The Frosted Glass Form Card */}
            <div
              className="p-6 sm:p-8 rounded-3xl bg-[#121622]/95 backdrop-blur-2xl border transition-all duration-500 shadow-2xl relative"
              style={{
                borderColor: `${currentColor.hex}40`,
                boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 35px -5px ${currentColor.glow}`,
              }}
            >
              {/* Window Header: macOS Dots on Left + 4 Accent Swatches on Right */}
              <div className="flex items-center justify-between mb-5">
                {/* 3 Window Control Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>

                {/* 4 Interactive Accent Color Dots matching Video 1 */}
                <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-full border border-white/10">
                  {colorDots.map((dot) => (
                    <button
                      key={dot.id}
                      type="button"
                      onClick={() => setAccent(dot.id)}
                      title={dot.name}
                      className={`w-4 h-4 rounded-full transition-all duration-200 ${
                        accent === dot.id
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'opacity-60 hover:opacity-100 hover:scale-110'
                      }`}
                      style={{ backgroundColor: dot.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Form Title & Subtitle matching Video 1 */}
              <div className="mb-5 text-left">
                <h2 className="text-2xl font-bold text-white tracking-tight">Selamat Datang</h2>
                <p className="text-xs text-slate-400 mt-1">Masuk untuk mengakses intelijensi analitik data Anda</p>
              </div>

              {/* Segmented Pill Switcher: [ Masuk ] [ Daftar ] */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-white/10 mb-5">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    !isSignUp
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isSignUp
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Daftar
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Alex Mercer"
                      className="w-full bg-[#181d28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': currentColor.hex } as any}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email atau Nama Pengguna</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="nama@datapulse.io"
                      className="w-full bg-[#181d28] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': currentColor.hex } as any}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Kata Sandi</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => alert('Akun Demo: Gunakan tombol pintas RBAC di bawah.')}
                        className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Lupa sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#181d28] border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': currentColor.hex } as any}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-800 border-white/10 text-brand-500 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400">Ingat saya</span>
                  </label>
                </div>

                {/* Primary Button matching Video 1 ("Sign In ->") */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-950 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  style={{
                    backgroundColor: currentColor.hex,
                    boxShadow: `0 4px 25px ${currentColor.glow}`,
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Buat Akun Sekarang' : 'Masuk Sekarang'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo RBAC Role Switcher */}
              <div className="mt-5 pt-4 border-t border-white/10 text-left">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: currentColor.hex }} />
                  <span>Pilih Akun Demo Cepat (RBAC):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRoleFill('admin')}
                    className={`text-[11px] py-1 px-2 rounded-lg border transition-all text-left ${
                      email === 'admin@datapulse.io'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleFill('analyst')}
                    className={`text-[11px] py-1 px-2 rounded-lg border transition-all text-left ${
                      email === 'analyst@datapulse.io'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Data Analyst
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleFill('manager')}
                    className={`text-[11px] py-1 px-2 rounded-lg border transition-all text-left ${
                      email === 'manager@datapulse.io'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleFill('viewer')}
                    className={`text-[11px] py-1 px-2 rounded-lg border transition-all text-left ${
                      email === 'viewer@datapulse.io'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    Viewer
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
