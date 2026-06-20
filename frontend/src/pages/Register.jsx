import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, loading, setActiveTab } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    await register(username, email, password);
  };

  return (
    <div className="w-full flex items-center justify-center py-16 sm:py-24 px-4 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Decorative graphic line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-eco-400 to-ocean-500"></div>

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-eco-100 dark:bg-eco-950/60 text-eco-600 dark:text-eco-400">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Start tracking, reducing, and offsetting your footprint
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="eco_warrior"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-eco-500/20 focus:border-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-eco-500/15 hover:shadow-eco-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-850 pt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => setActiveTab('login')}
              className="inline-flex items-center text-eco-600 dark:text-eco-400 font-bold hover:underline"
            >
              Sign In
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
