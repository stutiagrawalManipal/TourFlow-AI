import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('aditya.explorer@tourflow.ai');
  const [password, setPassword] = useState('tourist123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      login(email, password);
      setLoading(false);
      navigate('/dashboard');
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] border border-white/[0.08] rounded-2xl p-8 shadow-card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-2.5 rounded-xl bg-sky-600/10 text-sky-400 mb-3">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Sign in to TourFlow
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Access your digital queue passes and saved destinations
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@tourflow.ai"
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <span className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-white/[0.1] rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Demo Notice */}
            <p className="text-xs text-slate-400 pt-1">
              Demo mode: Pre-filled credentials permit instant sign-in.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400 pt-5 border-t border-white/[0.06]">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-sky-400 hover:underline font-medium">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
