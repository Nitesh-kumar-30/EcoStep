import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Car, Bike, Plane, Train, Zap, Apple, Trash2, 
  ArrowRight, ArrowLeft, Leaf, Award, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Calculator = () => {
  const { saveFootprint, setActiveTab } = useApp();
  const [currentStep, setCurrentStep] = useState(1);

  // Form Inputs State
  const [car, setCar] = useState(150); // km/week
  const [bike, setBike] = useState(20); // km/week
  const [publicTransport, setPublicTransport] = useState(50); // km/week
  const [flights, setFlights] = useState(10); // flight hours/year

  const [electricity, setElectricity] = useState(300); // kWh/month

  const [foodHabit, setFoodHabit] = useState('vegetarian'); // vegan, vegetarian, moderate-meat, heavy-meat

  const [wasteGeneration, setWasteGeneration] = useState(15); // kg/week
  const [recycled, setRecycled] = useState(true); // boolean

  // Computed live stats
  const [liveEmissions, setLiveEmissions] = useState(0);
  const [breakdown, setBreakdown] = useState({ transport: 0, energy: 0, food: 0, waste: 0 });

  // Calculate live footprint whenever variables change
  useEffect(() => {
    // 1. Transport
    const carEmissions = car * 52 * 0.120;
    const ptEmissions = publicTransport * 52 * 0.040;
    const flightEmissions = flights * 90;
    const transportTotal = carEmissions + ptEmissions + flightEmissions;

    // 2. Energy
    const energyTotal = electricity * 12 * 0.450;

    // 3. Food
    let foodTotal = 2200;
    if (foodHabit === 'vegan') foodTotal = 950;
    if (foodHabit === 'vegetarian') foodTotal = 1450;
    if (foodHabit === 'heavy-meat') foodTotal = 3100;

    // 4. Waste
    let wasteEmissions = wasteGeneration * 52 * 0.5;
    if (recycled) {
      wasteEmissions = wasteEmissions * 0.6;
    }
    const wasteTotal = wasteEmissions;

    const total = transportTotal + energyTotal + foodTotal + wasteTotal;

    setLiveEmissions(Math.round(total));
    setBreakdown({
      transport: Math.round(transportTotal),
      energy: Math.round(energyTotal),
      food: Math.round(foodTotal),
      waste: Math.round(wasteTotal)
    });
  }, [car, bike, publicTransport, flights, electricity, foodHabit, wasteGeneration, recycled]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      transport: { car: parseFloat(car), bike: parseFloat(bike), publicTransport: parseFloat(publicTransport), flights: parseFloat(flights) },
      energy: { electricity: parseFloat(electricity) },
      food: { habit: foodHabit },
      waste: { generation: parseFloat(wasteGeneration), recycled }
    };

    const res = await saveFootprint(payload);
    if (res) {
      // Trigger canvas confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Redirect to dashboard
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Title */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Carbon Footprint Calculator
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Estimate your annual greenhouse gas emissions and learn where you can save.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step Wizard Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
            {[
              { step: 1, label: 'Commute' },
              { step: 2, label: 'Home Energy' },
              { step: 3, label: 'Diet' },
              { step: 4, label: 'Waste' }
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center flex-1 relative">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold border transition-all duration-300 ${
                  currentStep === item.step
                    ? 'bg-eco-500 text-white border-eco-500 shadow-md shadow-eco-500/10'
                    : currentStep > item.step
                      ? 'bg-eco-100 dark:bg-eco-950/40 text-eco-600 border-eco-300 dark:border-eco-900'
                      : 'bg-slate-50 dark:bg-slate-850 text-slate-400 border-slate-200 dark:border-slate-800'
                }`}>
                  {item.step}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold mt-1 text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Stepper Content */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm min-h-[350px] flex flex-col justify-between">
            
            <div>
              {/* Step 1: Transportation */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Car className="h-6 w-6 text-eco-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transportation Habits</h3>
                  </div>

                  {/* Car Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Car Travel (km/week)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{car} km</span>
                    </div>
                    <input
                      type="range" min="0" max="800" step="10"
                      value={car}
                      onChange={(e) => setCar(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>

                  {/* Public Transport Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Public Transport (Bus/Train) (km/week)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{publicTransport} km</span>
                    </div>
                    <input
                      type="range" min="0" max="600" step="10"
                      value={publicTransport}
                      onChange={(e) => setPublicTransport(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>

                  {/* Flight Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Annual Flight Duration (hours/year)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{flights} hours</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="2"
                      value={flights}
                      onChange={(e) => setFlights(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>

                  {/* Bike Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Bicycle/Walking commute (km/week)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{bike} km</span>
                    </div>
                    <input
                      type="range" min="0" max="150" step="5"
                      value={bike}
                      onChange={(e) => setBike(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Electricity */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Zap className="h-6 w-6 text-eco-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Household Electricity</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Monthly Electricity Consumption (kWh)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{electricity} kWh</span>
                    </div>
                    <input
                      type="range" min="0" max="1200" step="10"
                      value={electricity}
                      onChange={(e) => setElectricity(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850/60 mt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      💡 <strong>Did you know?</strong> The average American household consumes about 900 kWh per month, emitting roughly 4,800 kg of CO2 annually just from grid electricity.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Diet Habits */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Apple className="h-6 w-6 text-eco-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dietary Habits</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'vegan', title: 'Vegan', desc: 'No animal products. Super low impact.', points: '🌱 Low Impact' },
                      { id: 'vegetarian', title: 'Vegetarian', desc: 'No meat, includes eggs/dairy. Low footprint.', points: '🥚 Moderate-Low' },
                      { id: 'moderate-meat', title: 'Moderate Meat', desc: 'Includes chicken, fish, light beef. Moderate footprint.', points: '🍗 Average Impact' },
                      { id: 'heavy-meat', title: 'Heavy Meat', desc: 'Frequent beef, pork, dairy. High footprint.', points: '🥩 High Impact' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setFoodHabit(item.id)}
                        className={`cursor-pointer rounded-xl border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ${
                          foodHabit === item.id
                            ? 'border-eco-500 bg-eco-50/30 dark:bg-eco-950/20'
                            : 'border-slate-200 dark:border-slate-850'
                        }`}
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                        <span className={`inline-block text-[10px] font-bold rounded-full px-2 py-0.5 mt-3 border ${
                          item.id === 'vegan' 
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-400'
                            : item.id === 'vegetarian'
                              ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-900/50 dark:text-yellow-400'
                              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400'
                        }`}>
                          {item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Waste */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-slide-up">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <Trash2 className="h-6 w-6 text-eco-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Household Waste</h3>
                  </div>

                  {/* Waste Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">Trash Bag Generation (kg/week)</span>
                      <span className="font-bold text-eco-600 dark:text-eco-400">{wasteGeneration} kg</span>
                    </div>
                    <input
                      type="range" min="1" max="80" step="1"
                      value={wasteGeneration}
                      onChange={(e) => setWasteGeneration(e.target.value)}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-eco-500"
                    />
                  </div>

                  {/* Recycling toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-150 dark:border-slate-850 p-4 mt-6 bg-slate-50 dark:bg-slate-950/40">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Active Recycling</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Do you sort plastic, paper, and glass?</p>
                    </div>
                    <button
                      onClick={() => setRecycled(!recycled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        recycled ? 'bg-eco-500' : 'bg-slate-250 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          recycled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Controls */}
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-eco-500 hover:bg-eco-600 text-white rounded-xl shadow-md shadow-eco-500/10 transition-all"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 text-white rounded-xl shadow-lg shadow-eco-500/15 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <Leaf className="h-4 w-4" />
                  Save Footprint
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Live Estimation Side Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 shadow-xl relative overflow-hidden border border-slate-850">
            {/* Background design */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-eco-500/10 rounded-full blur-2xl"></div>

            <div className="flex items-center space-x-2 text-eco-400 mb-4">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Carbon Estimate</span>
            </div>

            <div className="py-6 border-b border-slate-800">
              <span className="text-5xl font-extrabold text-white tracking-tight">{liveEmissions.toLocaleString()}</span>
              <span className="ml-2 text-slate-400 text-xs sm:text-sm font-semibold">kg CO₂/year</span>
            </div>

            {/* Live breakdown list */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Breakdown</h4>
              
              {[
                { name: 'Commuting & Flights', value: breakdown.transport, color: 'bg-blue-500' },
                { name: 'Household Energy', value: breakdown.energy, color: 'bg-yellow-500' },
                { name: 'Dietary habits', value: breakdown.food, color: 'bg-green-500' },
                { name: 'Trash & Recycling', value: breakdown.waste, color: 'bg-red-500' }
              ].map((cat, i) => {
                const percentage = liveEmissions > 0 ? (cat.value / liveEmissions) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-350">{cat.name}</span>
                      <span className="text-white font-bold">{cat.value.toLocaleString()} kg ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl bg-slate-850/60 p-3.5 border border-slate-800 text-[11px] leading-relaxed text-slate-350 flex items-start gap-2.5">
              <Award className="h-4.5 w-4.5 text-eco-400 shrink-0" />
              <span>Saving this calculation rewards you with <strong>50 Eco-Points</strong> and populates your analytical dashboard.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Calculator;
