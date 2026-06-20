import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Plus, CheckCircle2, Trash2, Award, Zap, Car, Apple, Trash } from 'lucide-react';
import confetti from 'canvas-confetti';

const Goals = () => {
  const { goals, addGoal, updateGoalProgress, deleteGoal } = useApp();

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('transport');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');

  // Slider progress updates buffer
  const [progressUpdates, setProgressUpdates] = useState({});

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !category || !targetValue || !deadline) return;

    const success = await addGoal({
      title,
      category,
      targetValue: parseFloat(targetValue),
      deadline: new Date(deadline),
    });

    if (success) {
      setTitle('');
      setTargetValue('');
      setDeadline('');
      setShowAddForm(false);
    }
  };

  const handleSliderChange = (goalId, val) => {
    setProgressUpdates(prev => ({
      ...prev,
      [goalId]: parseFloat(val)
    }));
  };

  const handleSaveProgress = async (goalId, target) => {
    const nextVal = progressUpdates[goalId];
    if (nextVal === undefined) return;

    const success = await updateGoalProgress(goalId, nextVal);
    if (success && nextVal >= target) {
      // Goal completed, trigger big confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'transport': return <Car className="h-5 w-5 text-blue-500" />;
      case 'energy': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'food': return <Apple className="h-5 w-5 text-green-500" />;
      case 'waste': return <Trash className="h-5 w-5 text-red-500" />;
      default: return <Target className="h-5 w-5 text-slate-500" />;
    }
  };

  // Badge checklist based on accomplishments
  const badgesList = [
    { key: 'Green Commuter', title: 'Green Commuter', desc: 'Achieved a Transportation target.', icon: Car, bg: 'from-blue-400 to-blue-600' },
    { key: 'Energy Saver', title: 'Energy Saver', desc: 'Achieved a Household Energy target.', icon: Zap, bg: 'from-yellow-400 to-yellow-600' },
    { key: 'Food Defender', title: 'Food Defender', desc: 'Achieved a Dietary target.', icon: Apple, bg: 'from-green-400 to-green-600' },
    { key: 'Waste Warrior', title: 'Waste Warrior', desc: 'Achieved a Waste target.', icon: Trash, bg: 'from-red-400 to-red-600' }
  ];

  const earnedBadges = goals ? goals.filter(g => g.completed && g.badge).map(g => g.badge) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-slide-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Carbon Reduction Targets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set custom emission goals, track milestones, and unlock global achievement badges.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 rounded-xl bg-eco-500 hover:bg-eco-600 text-white px-4 py-2.5 text-sm font-bold shadow-md shadow-eco-500/10 transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          Set New Goal
        </button>
      </div>

      {/* Add Goal Form Expandable */}
      {showAddForm && (
        <form 
          onSubmit={handleCreateGoal}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-md max-w-xl space-y-4 animate-slide-up"
        >
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Define Carbon Target</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-350">Goal Title</label>
              <input
                type="text" required value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reduce driving by 20%"
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              >
                <option value="transport">Transportation</option>
                <option value="energy">Household Energy</option>
                <option value="food">Diet Habits</option>
                <option value="waste">Waste & Recycling</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Target Reduction (%)</label>
              <input
                type="number" required min="1" max="100" value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-355">Deadline</label>
              <input
                type="date" required value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-eco-500 hover:bg-eco-600 text-white rounded-xl text-xs font-bold"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Goals Progress Lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-eco-600" />
              Active Target Status
            </h3>

            <div className="space-y-5">
              {goals && goals.length > 0 ? (
                goals.map((g) => {
                  const currentValue = progressUpdates[g._id] !== undefined ? progressUpdates[g._id] : g.currentValue;
                  const percentage = Math.min(Math.round((currentValue / g.targetValue) * 100), 100);
                  const isPendingSave = progressUpdates[g._id] !== undefined && progressUpdates[g._id] !== g.currentValue;

                  return (
                    <div 
                      key={g._id}
                      className="rounded-xl border border-slate-150 dark:border-slate-800/80 p-5 space-y-4 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
                            {getCategoryIcon(g.category)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">{g.title}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              Target: {g.targetValue}% reduction • Due: {new Date(g.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteGoal(g._id)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Progress</span>
                          <span className="font-bold text-slate-800 dark:text-white">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${g.completed ? 'bg-eco-500' : 'bg-gradient-to-r from-eco-400 to-ocean-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Progress updates controls */}
                      {!g.completed ? (
                        <div className="flex items-center gap-4 pt-2 border-t border-slate-50 dark:border-slate-850/60 justify-between">
                          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Log value:</span>
                            <input
                              type="range" min="0" max={g.targetValue} step="0.5"
                              value={currentValue}
                              onChange={(e) => handleSliderChange(g._id, e.target.value)}
                              className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350 shrink-0 w-8 text-right">
                              {currentValue}%
                            </span>
                          </div>

                          {isPendingSave && (
                            <button
                              onClick={() => handleSaveProgress(g._id, g.targetValue)}
                              className="px-3.5 py-1.5 text-[11px] font-bold bg-eco-50 hover:bg-eco-100 dark:bg-eco-950/40 dark:hover:bg-eco-950/60 border border-eco-200 dark:border-eco-900 text-eco-600 dark:text-eco-400 rounded-lg transition-all"
                            >
                              Update Goal
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-eco-600 dark:text-eco-400 font-bold bg-eco-50/50 dark:bg-eco-950/20 border border-eco-100 dark:border-eco-900/50 rounded-xl px-3 py-1.5 w-fit">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          Target Achieved! Unlocked the "{g.badge}" badge.
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">
                  No targets set. Use the "Set New Goal" button to outline a challenge for yourself!
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Milestone Badges Side Grid */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-eco-600" />
              Eco Badge Showcase
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {badgesList.map((badge, idx) => {
                const isEarned = earnedBadges.includes(badge.key);
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 flex flex-col items-center text-center transition-all ${
                      isEarned
                        ? 'border-eco-300 dark:border-eco-900 bg-eco-50/10 dark:bg-eco-950/10 shadow-md shadow-eco-500/5 badge-unlocked'
                        : 'border-slate-100 dark:border-slate-850 opacity-40 bg-slate-50/20'
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${isEarned ? badge.bg : 'from-slate-300 to-slate-400'} flex items-center justify-center text-white shadow`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-2.5 leading-none">
                      {badge.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      {badge.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Goals;
