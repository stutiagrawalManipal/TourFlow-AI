import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      register(formData.fullName, formData.email, formData.password);
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
              Create an account
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Join TourFlow to manage digital passes and crowd updates
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                  className={`w-full bg-slate-900 border ${
                    errors.fullName ? 'border-rose-500' : 'border-white/[0.1]'
                  } rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="priya@example.com"
                  className={`w-full bg-slate-900 border ${
                    errors.email ? 'border-rose-500' : 'border-white/[0.1]'
                  } rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={`w-full bg-slate-900 border ${
                    errors.password ? 'border-rose-500' : 'border-white/[0.1]'
                  } rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full bg-slate-900 border ${
                    errors.confirmPassword ? 'border-rose-500' : 'border-white/[0.1]'
                  } rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-400 pt-5 border-t border-white/[0.06]">
            <span>Already have an account? </span>
            <Link to="/login" className="text-sky-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
