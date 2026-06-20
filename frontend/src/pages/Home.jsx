import React from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Shield, Globe, Award, Sparkles, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user, setActiveTab } = useApp();

  const handleCtaClick = () => {
    if (user) {
      setActiveTab('calculator');
    } else {
      setActiveTab('register');
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-eco-50 via-white to-transparent dark:from-eco-950/20 dark:via-slate-950 dark:to-transparent py-16 sm:py-24">
        
        {/* Dynamic Graphic Blobs */}
        <div className="absolute top-10 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-eco-400/20 blur-3xl dark:bg-eco-600/10"></div>
        <div className="absolute top-20 right-10 -z-10 h-[250px] w-[250px] rounded-full bg-ocean-400/20 blur-3xl dark:bg-ocean-600/10 animate-float"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center space-x-2 rounded-full bg-eco-100 dark:bg-eco-900/40 px-3 py-1 text-xs sm:text-sm font-semibold text-eco-700 dark:text-eco-400 mb-6 border border-eco-200 dark:border-eco-800/30 animate-pulse-subtle">
            <Sparkles className="h-4 w-4 text-eco-600 dark:text-eco-400" />
            <span>Join 12,000+ Eco Guardians worldwide</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl mx-auto leading-tight bg-gradient-to-r from-slate-900 via-eco-700 to-ocean-700 dark:from-white dark:via-eco-400 dark:to-ocean-400 bg-clip-text text-transparent">
            Track Your Impact, Reduce Your Footprint, Build a Greener Future.
          </h1>
          
          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Take command of your ecological footprint. Calculate your daily impact, unlock carbon reduction badges, and join a global community restoring the planet one step at a time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-eco-500/20 hover:shadow-eco-600/30 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>{user ? 'Calculate Footprint' : 'Get Started Free'}</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className="w-full sm:w-auto flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-8 py-4 text-base font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 shadow-sm"
            >
              Learn More
            </button>
          </div>

        </div>
      </div>

      {/* Stats Board */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 p-8 shadow-md">
          <div className="text-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-eco-600 dark:text-eco-400">54,231</p>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Virtual Trees Planted</p>
          </div>
          <div className="text-center p-4 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-ocean-600 dark:text-ocean-400">3,248,590 kg</p>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">CO₂ Offset Logged</p>
          </div>
          <div className="text-center p-4">
            <p className="text-3xl sm:text-4xl font-extrabold text-eco-600 dark:text-eco-400">12,482</p>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Active Climate Guardians</p>
          </div>
        </div>
      </div>

      {/* Info Core Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Why tracking your Carbon Footprint matters
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
            A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) generated by our actions. Understanding your score is the first step to scaling it back.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* Card 1 */}
          <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-eco-100 dark:bg-eco-950/60 text-eco-600 dark:text-eco-400 group-hover:scale-110 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Eco-Calculations</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Use our quick wizard to input your commuting, travel, food choices, and home electricity consumption to receive a precise carbon footprint calculation in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-100 dark:bg-ocean-950/60 text-ocean-600 dark:text-ocean-400 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Actionable Goals</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Setup custom emission targets, track monthly achievements, and unlock badges like "Energy Saver" as you decrease your usage. Complete daily challenges to boost performance.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-eco-100 dark:bg-eco-950/60 text-eco-600 dark:text-eco-400 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">Eco-Rewards</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
              Earn Eco-Points for logging footprints and making sustainable shifts. Redeem your points to plant virtual trees, climbing the global community leaderboard.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
