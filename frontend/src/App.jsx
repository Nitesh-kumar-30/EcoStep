import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

// Page Imports
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import ActionCenter from './pages/ActionCenter';
import Goals from './pages/Goals';
import Education from './pages/Education';
import Community from './pages/Community';
import AboutUs from './pages/AboutUs';

// Icon for Alerts
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const AppContent = () => {
  const { activeTab, alert } = useApp();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'calculator':
        return <Calculator />;
      case 'dashboard':
        return <Dashboard />;
      case 'actions':
        return <ActionCenter />;
      case 'goals':
        return <Goals />;
      case 'education':
        return <Education />;
      case 'community':
        return <Community />;
      case 'about':
        return <AboutUs />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Alert Notifications */}
      {alert && (
        <div className="fixed top-20 right-4 sm:right-6 z-[100] max-w-sm w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 animate-slide-up flex gap-3 items-start">
          <div className="mt-0.5">
            {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {alert.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            {alert.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
            {alert.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {alert.type === 'success' ? 'Success' : alert.type === 'error' ? 'Error' : 'Notification'}
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar />

      {/* Main Pages Container */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Chatbot floating widget */}
      <Chatbot />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-10 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center">
            <span className="font-bold text-eco-600 dark:text-eco-400 text-sm">EcoStep Carbon Platform</span>
            <span className="mx-2 text-slate-350 dark:text-slate-700">|</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">© 2026 All Rights Reserved</span>
          </div>
          <div className="flex space-x-6 text-xs text-slate-550 dark:text-slate-400 font-semibold">
            <button onClick={() => {}} className="hover:text-eco-500">Privacy Policy</button>
            <button onClick={() => {}} className="hover:text-eco-500">Terms of Service</button>
            <button onClick={() => {}} className="hover:text-eco-500">Carbon Methodology</button>
          </div>
        </div>
      </footer>

    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
