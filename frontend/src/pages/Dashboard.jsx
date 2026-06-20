import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement, Title 
} from 'chart.js';
import { FileDown, ShieldAlert, Sparkles, TrendingDown, ArrowUpRight, Leaf, Trees } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { user, history, goals, setActiveTab } = useApp();
  const [latestFootprint, setLatestFootprint] = useState(null);
  const [insights, setInsights] = useState([]);
  const [highestCategory, setHighestCategory] = useState('');

  useEffect(() => {
    if (history && history.length > 0) {
      // Latest calculation is the first in sorting
      const latest = history[0];
      setLatestFootprint(latest);
      
      // Calculate breakdown details
      const car = (latest.transport?.car || 0) * 52 * 0.120;
      const pt = (latest.transport?.publicTransport || 0) * 52 * 0.040;
      const flight = (latest.transport?.flights || 0) * 90;
      const transportTotal = car + pt + flight;

      const energyTotal = (latest.energy?.electricity || 0) * 12 * 0.450;

      let foodTotal = 2200;
      if (latest.food?.habit === 'vegan') foodTotal = 950;
      if (latest.food?.habit === 'vegetarian') foodTotal = 1450;
      if (latest.food?.habit === 'heavy-meat') foodTotal = 3100;

      let wasteTotal = (latest.waste?.generation || 0) * 52 * 0.5;
      if (latest.waste?.recycled) {
        wasteTotal = wasteTotal * 0.6;
      }

      const cats = [
        { name: 'Transportation', value: transportTotal, advice: 'Swap car rides for biking or buses, or buy carbon offsets for flights.' },
        { name: 'Household Energy', value: energyTotal, advice: 'Switch to LEDs, unplug idle devices, and select green energy plans.' },
        { name: 'Diet Habits', value: foodTotal, advice: 'Try meat-free days, shop local produce, and eat plant-based.' },
        { name: 'Waste Disposal', value: wasteTotal, advice: 'Compost kitchen waste and sort recyclable packaging.' }
      ];

      // Find highest category
      const sorted = [...cats].sort((a, b) => b.value - a.value);
      setHighestCategory(sorted[0].name);
      
      // Gather top insights
      const newInsights = sorted.map((c, i) => ({
        category: c.name,
        value: Math.round(c.value),
        advice: c.advice,
        severity: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
      }));
      setInsights(newInsights);
    } else {
      setLatestFootprint(null);
      setInsights([]);
    }
  }, [history]);

  // Donut Chart Config
  const doughnutData = {
    labels: ['Transport', 'Energy', 'Food', 'Waste'],
    datasets: [
      {
        data: latestFootprint 
          ? [
              latestFootprint.transport?.car * 52 * 0.120 + latestFootprint.transport?.publicTransport * 52 * 0.040 + latestFootprint.transport?.flights * 90,
              latestFootprint.energy?.electricity * 12 * 0.450,
              latestFootprint.food?.habit === 'vegan' ? 950 : latestFootprint.food?.habit === 'vegetarian' ? 1450 : latestFootprint.food?.habit === 'heavy-meat' ? 3100 : 2200,
              latestFootprint.waste?.generation * 52 * 0.5 * (latestFootprint.waste?.recycled ? 0.6 : 1)
            ].map(Math.round)
          : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(14, 165, 233, 0.75)', // Sky blue (transport)
          'rgba(234, 179, 8, 0.75)', // Yellow (energy)
          'rgba(34, 197, 94, 0.75)', // Green (food)
          'rgba(239, 68, 68, 0.75)'   // Red (waste)
        ],
        borderColor: [
          '#0ea5e9', '#eab308', '#22c55e', '#ef4444'
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#64748b',
          font: { family: 'Outfit', size: 12 }
        }
      }
    }
  };

  // Bar Chart Config (History tracking)
  const barData = {
    labels: history ? history.slice(0, 6).reverse().map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) : [],
    datasets: [
      {
        label: 'Emissions (kg CO₂/year)',
        data: history ? history.slice(0, 6).reverse().map(h => h.totalEmissions) : [],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: '#22c55e',
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b', font: { family: 'Outfit' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Outfit' } }
      }
    }
  };

  // Generate PDF Report
  const generatePdfReport = () => {
    if (!latestFootprint) return;

    const doc = new jsPDF();
    const primaryColor = '#16a34a';

    // Header Title
    doc.setFont("Outfit", "bold");
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);
    doc.text("EcoStep Sustainability Report", 20, 25);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor("#64748b");
    doc.text(`Generated for: ${user?.username}`, 20, 32);
    doc.text(`Date of Calculation: ${new Date(latestFootprint.date).toLocaleDateString()}`, 20, 37);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 42);

    // Line separator
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 46, 190, 46);

    // Score Callout
    doc.setFontSize(14);
    doc.setTextColor("#0f172a");
    doc.text("1. Overall Footprint Summary", 20, 56);
    
    doc.setFontSize(32);
    doc.setTextColor(primaryColor);
    doc.text(`${latestFootprint.totalEmissions.toLocaleString()}`, 20, 72);
    doc.setFontSize(11);
    doc.setTextColor("#475569");
    doc.text("kg CO2 equivalent per year", 20, 78);

    doc.setFontSize(11);
    doc.setTextColor("#1e293b");
    doc.text(`Your highest source of emissions is: ${highestCategory}`, 20, 88);

    // Breakdown Details
    doc.setFontSize(14);
    doc.setTextColor("#0f172a");
    doc.text("2. Category Breakdown", 20, 102);

    let yOffset = 112;
    insights.forEach((c) => {
      doc.setFontSize(11);
      doc.setTextColor("#334155");
      doc.text(`• ${c.category}: ${c.value.toLocaleString()} kg CO2/year`, 25, yOffset);
      yOffset += 8;
    });

    // Recommendations
    doc.setFontSize(14);
    doc.setTextColor("#0f172a");
    doc.text("3. Actionable AI Recommendations", 20, yOffset + 10);

    yOffset += 20;
    insights.slice(0, 3).forEach((ins) => {
      doc.setFontSize(10);
      doc.setTextColor("#475569");
      const splitText = doc.splitTextToSize(`${ins.category}: ${ins.advice}`, 160);
      doc.text(splitText, 25, yOffset);
      yOffset += splitText.length * 5 + 3;
    });

    // Active Goals
    if (goals && goals.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor("#0f172a");
      doc.text("4. Active Targets", 20, yOffset + 8);
      yOffset += 18;

      goals.slice(0, 3).forEach((goal) => {
        doc.setFontSize(10);
        doc.setTextColor("#334155");
        const status = goal.completed ? "[Completed]" : `[In Progress: ${goal.currentValue}/${goal.targetValue}]`;
        doc.text(`• ${goal.title} - ${status}`, 25, yOffset);
        yOffset += 8;
      });
    }

    // Save PDF
    doc.save(`ecostep_carbon_report_${user?.username}.pdf`);
  };

  if (!latestFootprint) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 shadow-md">
          <Leaf className="h-12 w-12 text-eco-400 mx-auto animate-float" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-4">No data logged yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Calculate your carbon footprint first to populate your personalized analytics dashboard.
          </p>
          <button
            onClick={() => setActiveTab('calculator')}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-eco-500 hover:bg-eco-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
          >
            Calculate Footprint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-slide-up">
      
      {/* Dashboard Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Personal Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Analytics and reduction pathways tailored to your habits.
          </p>
        </div>
        <button
          onClick={generatePdfReport}
          className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
        >
          <FileDown className="h-4.5 w-4.5 text-eco-500" />
          Download PDF Report
        </button>
      </div>

      {/* Grid of Key Score stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Score pill */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Carbon Footprint</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{latestFootprint.totalEmissions.toLocaleString()}</span>
            <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">kg CO₂/year</span>
          </div>
          <span className={`inline-flex items-center text-xs font-bold ${
            latestFootprint.totalEmissions < 4000 
              ? 'text-green-600 dark:text-green-400'
              : latestFootprint.totalEmissions < 10000
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingDown className="mr-1 h-3.5 w-3.5" />
            {latestFootprint.totalEmissions < 4000 ? 'Low Footprint' : latestFootprint.totalEmissions < 10000 ? 'Moderate Footprint' : 'High Footprint'}
          </span>
        </div>

        {/* Eco points */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Eco-Points Balance</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-eco-600 dark:text-eco-400">{user?.ecoPoints}</span>
            <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">EP</span>
          </div>
          <button 
            onClick={() => setActiveTab('actions')}
            className="text-left text-xs font-bold text-eco-600 dark:text-eco-400 hover:underline flex items-center"
          >
            Go to Action Center <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
          </button>
        </div>

        {/* Trees Planted */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trees Planted</span>
          <div className="my-3 flex items-baseline">
            <span className="text-3xl font-extrabold text-green-600 dark:text-green-400">{user?.treesPlanted}</span>
            <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">virtual trees</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">1 tree offset ≈ 22kg CO₂/year</span>
        </div>

        {/* Targets */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active targets</span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {goals ? goals.filter(g => !g.completed).length : 0}
            </span>
            <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">goals set</span>
          </div>
          <button 
            onClick={() => setActiveTab('goals')}
            className="text-left text-xs font-bold text-eco-600 dark:text-eco-400 hover:underline flex items-center"
          >
            Manage Goals <ArrowUpRight className="ml-0.5 h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Donut Breakdown */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Emissions Breakdown</h3>
          <div className="h-[250px] relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Bar History */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">Carbon Footprint Progress</h3>
          <div className="h-[250px] relative">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

      </div>

      {/* AI Insights & Suggestions Dashboard */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-eco-600 dark:text-eco-400 mb-6">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">AI Tailored Advice</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins, idx) => (
            <div 
              key={idx}
              className={`rounded-xl border p-4 flex gap-4 ${
                ins.severity === 'high'
                  ? 'border-red-150 bg-red-50/20 dark:bg-red-950/10'
                  : ins.severity === 'medium'
                    ? 'border-yellow-150 bg-yellow-50/20 dark:bg-yellow-950/10'
                    : 'border-slate-150 bg-slate-50/30 dark:bg-slate-850/40'
              }`}
            >
              <div className="mt-0.5">
                {ins.severity === 'high' ? (
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                ) : (
                  <Leaf className="h-5 w-5 text-eco-500" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ins.category}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{ins.value.toLocaleString()} kg CO₂</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ins.advice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
