import React, { useState } from 'react'
import { Sparkles, Loader2, Lock, User, Mail, ShieldAlert, ArrowRight } from 'lucide-react'
import axios from 'axios'

export default function AuthLayout({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        // Login Request
        const res = await axios.post('http://localhost:8000/api/auth/login', {
          username: username.trim(),
          password: password.trim()
        });
        
        if (res.data.success) {
          onAuthSuccess(res.data.token, res.data.user);
        } else {
          setError(res.data.message || "Authentication failed.");
        }
      } else {
        // Register Request
        const res = await axios.post('http://localhost:8000/api/auth/register', {
          username: username.trim(),
          email: email.trim(),
          password: password.trim()
        });
        
        if (res.data.success) {
          setSuccessMsg("Account created successfully! Please log in.");
          setIsLogin(true);
          setEmail('');
          setPassword('');
        } else {
          setError(res.data.message || "Registration failed.");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Connection to authentication server failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-650/15 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      <div className="w-full max-w-[480px] bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Branding */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-2">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Dataset Intelligence Studio
          </h2>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            Enterprise Autonomous Multi-Agent Suite
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-200 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-in slide-in-from-top-4 duration-300">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <p className="text-xs font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-in slide-in-from-top-4 duration-300">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
            <p className="text-xs font-semibold leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email (only when signing up) */}
          {!isLogin && (
            <div className="space-y-1.5 animate-in fade-in duration-300">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950/40 border border-slate-800 focus:border-indigo-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm py-4 rounded-2xl shadow-lg shadow-indigo-550/10 transition-all active:scale-[0.98] mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLogin ? "Signing in..." : "Creating Account..."}
              </>
            ) : (
              <>
                {isLogin ? "Sign In to Workspace" : "Create Enterprise Account"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="text-center mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccessMsg(null);
            }}
            disabled={loading}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isLogin 
              ? "New to the platform? Create an account" 
              : "Already have an account? Sign in here"}
          </button>
        </div>

      </div>
    </div>
  )
}
