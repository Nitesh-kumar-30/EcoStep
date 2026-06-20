import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Award, CheckCircle2, Trees, Leaf, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const ActionCenter = () => {
  const { challenges, user, completeChallenge, plantTree, fetchUserData } = useApp();

  const handleComplete = async (challengeId) => {
    const success = await completeChallenge(challengeId);
    if (success) {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }
  };

  const handlePlantTree = async () => {
    if (!user || user.ecoPoints < 100) return;
    const success = await plantTree();
    if (success) {
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#22c55e', '#16a34a', '#86efac']
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Eco-Friendly Action Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Complete daily challenges, earn eco-points, and plant virtual forests to restore our planet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Daily Challenges List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg flex items-center gap-2">
                <Award className="h-5.5 w-5.5 text-eco-600" />
                Daily Sustainability Challenges
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Resets daily</span>
            </div>

            <div className="space-y-4">
              {challenges && challenges.length > 0 ? (
                challenges.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                      c.completed
                        ? 'bg-slate-50/50 dark:bg-slate-850/20 border-slate-150 dark:border-slate-800 opacity-70'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-eco-300 dark:hover:border-eco-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-sm ${c.completed ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>
                          {c.title}
                        </h4>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full px-2 py-0.5 font-bold uppercase">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className="text-xs font-bold text-eco-600 dark:text-eco-400 flex items-center gap-1">
                        🌱 +{c.points} EP
                      </span>
                      {c.completed ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-eco-600 dark:text-eco-400 px-3.5 py-1.5 bg-eco-50 dark:bg-eco-950/20 rounded-xl">
                          <CheckCircle2 className="h-4 w-4" />
                          Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleComplete(c.id)}
                          className="px-4 py-1.5 text-xs font-bold bg-eco-500 hover:bg-eco-600 text-white rounded-xl shadow-sm transition-all"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">Loading challenges...</div>
              )}
            </div>

          </div>
        </div>

        {/* Tree Plantation Tracker Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-b from-eco-50 to-white dark:from-eco-950/20 dark:to-slate-900 border border-slate-150 dark:border-slate-800 p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            
            <div>
              <div className="flex items-center gap-2 text-eco-600 dark:text-eco-400 mb-4">
                <Trees className="h-6 w-6" />
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Tree Plantation Tracker</h3>
              </div>

              {/* Tree plant counter */}
              <div className="my-6 text-center bg-white/60 dark:bg-slate-950/30 rounded-2xl border border-white/80 dark:border-slate-800 py-6">
                <span className="text-6xl font-black text-eco-600 dark:text-eco-400 block tracking-tight">
                  {user?.treesPlanted}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block uppercase tracking-wide">
                  Virtual Trees Planted
                </span>
              </div>

              <div className="space-y-3.5 text-slate-600 dark:text-slate-350 text-xs sm:text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <Leaf className="h-4.5 w-4.5 text-eco-500 shrink-0 mt-0.5" />
                  <span>Each virtual tree represents <strong>100 Eco-Points</strong> offset.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-eco-500 shrink-0 mt-0.5" />
                  <span>Your forest offsets roughly <strong>{Math.round(user?.treesPlanted * 22)} kg CO₂/year</strong>.</span>
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-850 mt-6">
              {/* Plant CTA */}
              <button
                onClick={handlePlantTree}
                disabled={!user || user.ecoPoints < 100}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Plant a Virtual Tree (100 EP)
              </button>

              {user && user.ecoPoints < 100 && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-2.5 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  You need {100 - user.ecoPoints} more points to plant.
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ActionCenter;
