import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowRight, Leaf, Shield, BarChart3, FileText } from "lucide-react";

interface LoginProps {
  onLogin?: () => void;
  onAdminLogin?: () => void;
}

export default function Login({ onLogin, onAdminLogin }: LoginProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [farmerId, setFarmerId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mode: 'login' | 'otp' | 'register' | 'forgot-password'
  const [mode, setMode] = useState<'login' | 'otp' | 'register' | 'forgot-password'>('login');

  // Registration specific state
  const [regName, setRegName] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regLand, setRegLand] = useState("");
  const [regPhone, setRegPhone] = useState("");

  type Role = "officer" | "admin";
  const [role, setRole] = useState<Role>("officer");
  const isAdmin = role === "admin";
  const accentDark = isAdmin ? "#0f1f2e" : "#1a3310";
  const accentHover = isAdmin ? "#1a3348" : "#2d5a1b";
  const accentGreen = "#2d5a1b";
  const setIdentifier = setFarmerId;
  const identifier = farmerId;

  // OTP specific state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Real stats from backend
  const [stats, setStats] = useState([
    { value: "-", label: "Registered Farmers" },
    { value: "-", label: "Reports This Month" }
  ]);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API}/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats([
            { value: data.registered_farmers, label: "Registered Farmers" },
            { value: data.reports_this_month, label: "Reports This Month" }
          ]);
        }
      })
      .catch(() => { });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isAdmin) {
      try {
        const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API}/auth/admin-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Invalid admin credentials");
          setLoading(false);
          return;
        }
        localStorage.setItem("kisanmind_admin", JSON.stringify(data.admin));
        setLoading(false);
        onAdminLogin?.();
      } catch (err: any) {
        setError("Unable to connect to server");
        setLoading(false);
      }
      return;
    }

    try {
      const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
      let res: Response;

      if (mode === 'register') {
        res = await fetch(`${API}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: regName, city: regCity, email: farmerId, password,
            phone: regPhone, land_owned: regLand,
          }),
        });
      } else if (mode === 'otp') {
        res = await fetch(`${API}/auth/otp-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        });
      } else if (mode === 'forgot-password') {
        res = await fetch(`${API}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: farmerId }),
        });
      } else {
        res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: farmerId, password }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Authentication failed");
        setLoading(false);
        return;
      }

      if (mode === 'forgot-password') {
        setSuccess("Code sent to mail, kindly check spam");
        setMode('login');
        setError(""); // Clear error on success
        setLoading(false);
        return;
      }

      localStorage.setItem("kisanmind_user", JSON.stringify(data.user));
      setLoading(false);
      onLogin?.();
    } catch {
      setError("Could not connect to server. Is the backend running?");
      setLoading(false);
    }
  }

  function handleSendOTP() {
    if (!phone) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); }, 1000);
  }

  const features = [
    { icon: Leaf, label: "Crop disease detection & advisory" },
    { icon: BarChart3, label: "Live market price forecasts" },
    { icon: FileText, label: "Government scheme eligibility" },
    { icon: Shield, label: "Secure farmer data portal" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* ── Left panel ────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: accentDark }}
      >
        {/* Subtle texture overlay — fine dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Wheat field photo, tinted */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1750418180525-cce49e403e78?w=900&h=1200&fit=crop&auto=format"
            alt="Wheat fields at harvest — golden and green"
            className="w-full h-full object-cover opacity-[0.12]"
            style={{ mixBlendMode: "luminosity" }}
          />
        </div>

        {/* Content above fold */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-7 h-7 flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 2C10 2 5 7 5 12C5 14.76 7.24 17 10 17C12.76 17 15 14.76 15 12C15 7 10 2 10 2Z"
                  fill="#7eb86a" fillOpacity="0.3" stroke="#7eb86a" strokeWidth="1.5" strokeLinejoin="round"
                />
                <path d="M10 17V19" stroke="#7eb86a" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 8L13 11" stroke="#7eb86a" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M10 10L7 12" stroke="#7eb86a" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-tight text-white">
                Kisan<span style={{ color: "#7eb86a" }}>Mind</span>
              </div>
              {isAdmin && (
                <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "#5a8a9f" }}>Admin Portal</div>
              )}
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-[38px] font-semibold leading-[1.15] tracking-tight mb-4" style={{ color: "#f0f7eb" }}>
              {isAdmin
                ? <><span>State-level</span><br /><span>Oversight</span><br /><span>Dashboard</span></>
                : <><span>Agricultural</span><br /><span>Intelligence</span><br /><span>Platform</span></>
              }
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#8aab78", maxWidth: 340 }}>
              {isAdmin
                ? "Monitor crop disease outbreaks across all 75 UP districts. Access all farmer reports, heatmaps, and district-level analytics."
                : "Crop advisory, market forecasting, and government scheme management for Uttar Pradesh agricultural officers and cooperatives."
              }
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(126,184,106,0.12)", border: "1px solid rgba(126,184,106,0.2)" }}
                >
                  <Icon size={13} style={{ color: "#7eb86a" }} strokeWidth={1.5} />
                </div>
                <span className="text-[13px]" style={{ color: "#8aab78" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10">
          <div
            className="pt-6 grid grid-cols-2 gap-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {stats.map((s, i) => (
              <div key={i} className={i === 0 ? "pr-6 border-r" : "pl-6"} style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div
                  className="text-[20px] font-semibold tracking-tight"
                  style={{ fontFamily: "'DM Mono', monospace", color: "#f0f7eb" }}
                >
                  {s.value}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "#6a8f5a" }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Right panel ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white overflow-y-auto py-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C10 2 5 7 5 12C5 14.76 7.24 17 10 17C12.76 17 15 14.76 15 12C15 7 10 2 10 2Z"
              fill="#2d5a1b" fillOpacity="0.15" stroke="#2d5a1b" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 17V19" stroke="#2d5a1b" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 8L13 11" stroke="#2d5a1b" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 10L7 12" stroke="#2d5a1b" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[15px] font-semibold tracking-tight text-[#111]">
            Kisan<span className="text-[#2d5a1b]">Mind</span>
          </span>
        </div>

        <div className="w-full" style={{ maxWidth: 360 }}>
          {/* Role toggle */}
          <div className="flex border border-[#e5e5e5] mb-8 overflow-hidden" style={{ borderRadius: 2 }}>
            {([{ key: "officer" as Role, label: "Farmer" }, { key: "admin" as Role, label: "Administrator" }]).map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => { setRole(r.key); setIdentifier(""); setPassword(""); }}
                className="flex-1 py-2 text-[12.5px] font-semibold transition-colors"
                style={{
                  backgroundColor: role === r.key ? accentDark : "transparent",
                  color: role === r.key ? "#fff" : "#737373",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className="text-[22px] font-semibold tracking-tight text-[#111]">
              {isAdmin ? "Admin sign in" : "Sign in"}
            </h2>
            <p className="text-[13px] text-[#737373] mt-1.5">
              {isAdmin
                ? "Restricted to authorised state-level administrators"
                : "Access the agricultural intelligence portal"}
            </p>
          </div>

          {/* Admin warning banner */}
          {isAdmin && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 px-3 py-2.5 mb-5" style={{ borderRadius: 2 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-px">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[11.5px] text-amber-800 leading-relaxed">
                Admin credentials are issued by the KisanMind backend team. Self-registration is not available for this role.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded text-[13px] text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded text-[13px] text-green-700">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── REGISTER FIELDS ── */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">Full Name *</label>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Ramesh Kumar" required
                    className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                    style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">City / District *</label>
                  <input type="text" value={regCity} onChange={(e) => setRegCity(e.target.value)} placeholder="Agra, Uttar Pradesh" required
                    className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                    style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">Acres (Opt)</label>
                    <input type="number" value={regLand} onChange={(e) => setRegLand(e.target.value)} placeholder="5"
                      className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                      style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                  </div>
                  <div className="flex-[2]">
                    <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">Phone (Opt)</label>
                    <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+91 XXXXX"
                      className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                      style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                  </div>
                </div>
              </>
            )}

            {/* ── OTP FIELDS ── */}
            {mode === 'otp' && (
              <>
                <div>
                  <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">Mobile Number</label>
                  <div className="flex gap-2">
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required disabled={otpSent}
                      className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                      style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                    {!otpSent && (
                      <button type="button" onClick={handleSendOTP} disabled={!phone || loading}
                        className="px-4 py-2.5 text-[13px] font-medium text-white whitespace-nowrap disabled:opacity-50"
                        style={{ backgroundColor: "#1a3310", borderRadius: 2 }}>
                        {loading ? "Sending…" : "Send OTP"}
                      </button>
                    )}
                  </div>
                </div>
                {otpSent && (
                  <div>
                    <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">Enter OTP (Mock: 123456)</label>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" required
                      className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                      style={{ borderRadius: 2 }} onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")} onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")} />
                  </div>
                )}
              </>
            )}

            {/* ── SHARED EMAIL/PASSWORD ── */}
            {(mode === 'login' || mode === 'register') && (
              <>
                {/* Farmer ID / Email */}
                <div>
                  <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">
                    {isAdmin ? "Admin ID or Email" : "Farmer ID or Email"}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isAdmin ? "ADM-UP-XXXX or email" : "FK-UP-2024-XXXX or email"}
                    required
                    className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                    style={{ borderRadius: 2 }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = accentDark)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[12px] font-medium text-[#111] uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot-password'); setError(""); setSuccess(""); }}
                        className="text-[12px] text-[#2d5a1b] hover:opacity-70 transition-opacity"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? "Create a password" : "Enter your password"}
                      required
                      className="w-full px-3 py-2.5 pr-10 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                      style={{ borderRadius: 2 }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = accentDark)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-[#737373] transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── FORGOT PASSWORD FIELDS ── */}
            {mode === 'forgot-password' && (
              <div>
                <label className="block text-[12px] font-medium text-[#111] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-3 py-2.5 text-[13.5px] text-[#111] bg-white border border-[#e5e5e5] outline-none transition-colors placeholder:text-[#c0c0c0]"
                  style={{ borderRadius: 2 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#2d5a1b")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e5e5")}
                />
              </div>
            )}

            {/* Remember me */}
            {!isAdmin && mode === 'login' && (
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="w-4 h-4 border flex items-center justify-center transition-colors flex-shrink-0"
                  style={{ borderRadius: 2, backgroundColor: remember ? accentGreen : "white", borderColor: remember ? accentGreen : "#d4d4d4" }}
                >
                  {remember && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-[13px] text-[#737373]">Keep me signed in for 30 days</span>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (mode === 'otp' && !otpSent)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13.5px] font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: accentDark, borderRadius: 2 }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = accentHover)}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = accentDark)}
              >
                {loading ? (
                  <>
                    <span
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                    {mode === 'register' ? 'Creating Account…' : mode === 'forgot-password' ? 'Sending…' : 'Authenticating…'}
                  </>
                ) : (
                  <>
                    {mode === 'register' ? 'Create Account' : mode === 'forgot-password' ? 'Reset Password' : isAdmin ? "Sign in to Admin Portal" : 'Sign in to portal'}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          {!isAdmin && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#e5e5e5]" />
              <span className="text-[11px] text-[#c0c0c0] uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-[#e5e5e5]" />
            </div>
          )}

          {/* Mode switchers */}
          {!isAdmin && mode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => { setMode('otp'); setError(""); setSuccess(""); }}
                className="w-full py-2.5 text-[13px] font-medium text-[#111] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-2"
                style={{ borderRadius: 2 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91A16 16 0 0 0 15 16.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Sign in with OTP (mobile number)
              </button>

              <p className="mt-4 text-center text-[13px] text-[#737373]">
                Don't have an account? <button onClick={() => { setMode('register'); setError(""); setSuccess(""); }} className="text-[#2d5a1b] font-medium hover:underline">Register here</button>
              </p>
            </>
          )}

          {mode === 'otp' && (
            <>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(""); setSuccess(""); setOtpSent(false); }}
                className="w-full py-2.5 text-[13px] font-medium text-[#111] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-2"
                style={{ borderRadius: 2 }}
              >
                Sign in with Email / ID
              </button>
              <p className="mt-4 text-center text-[13px] text-[#737373]">
                Don't have an account? <button onClick={() => { setMode('register'); setError(""); setSuccess(""); }} className="text-[#2d5a1b] font-medium hover:underline">Register here</button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p className="text-center text-[13px] text-[#737373]">
              Already have an account? <button type="button" onClick={() => { setMode('login'); setError(""); setSuccess(""); }} className="text-[#2d5a1b] font-medium hover:underline">Sign in here</button>
            </p>
          )}

          {mode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(""); setSuccess(""); }}
              className="w-full py-2.5 text-[13px] font-medium text-[#111] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-2"
              style={{ borderRadius: 2 }}
            >
              Back to Sign in
            </button>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-[11.5px] text-[#a3a3a3] leading-relaxed">
            {isAdmin
              ? <>For admin access issues, contact the<br /><span className="text-[#c0c0c0]">KisanMind backend team</span></>
              : <>For access requests, contact your District Agricultural Officer.<br /><span className="text-[#c0c0c0]">KisanMind · UP Directorate of Agriculture · 2026</span></>
            }
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
