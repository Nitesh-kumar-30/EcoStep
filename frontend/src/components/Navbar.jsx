import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Leaf, Sun, Moon, Menu, X, LogOut, 
  BarChart3, Calculator, Target, Award, 
  BookOpen, Users, Info, LogIn, UserPlus 
} from 'lucide-react';

const Navbar = () => {
  const { user, activeTab, setActiveTab, darkMode, setDarkMode, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = user 
    ? [
        { id: 'home', label: 'Home', icon: Leaf },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'calculator', label: 'Calculator', icon: Calculator },
        { id: 'actions', label: 'Action Center', icon: Award },
        { id: 'goals', label: 'Goals', icon: Target },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'education', label: 'Learn', icon: BookOpen },
        { id: 'about', label: 'About Us', icon: Info },
      ]
    : [
        { id: 'home', label: 'Home', icon: Leaf },
        { id: 'education', label: 'Learn', icon: BookOpen },
        { id: 'about', label: 'About Us', icon: Info },
      ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleTabClick('home')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-eco-400 to-ocean-500 shadow-md shadow-eco-500/20">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-eco-600 to-ocean-600 dark:from-eco-400 dark:to-ocean-400 bg-clip-text text-transparent">
              EcoStep
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-eco-500 text-white shadow-md shadow-eco-500/10 dark:bg-eco-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Profile, Points, Theme Toggle & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Eco points pill */}
                <div className="flex items-center bg-eco-50 dark:bg-eco-950/40 border border-eco-200 dark:border-eco-900/50 rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold text-eco-700 dark:text-eco-400 animate-pulse-subtle">
                  <span className="mr-1.5">🌱</span>
                  <span>{user.ecoPoints} EP</span>
                </div>
                
                {/* User avatar dropdown/logout */}
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-eco-500 to-ocean-500 text-white font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] truncate">
                    {user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTabClick('login')}
                  className="flex items-center text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => handleTabClick('register')}
                  className="flex items-center text-white bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-eco-500/15"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1">
          {user && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-eco-500 text-white font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {user.username}
                </span>
              </div>
              <div className="flex items-center bg-eco-50 dark:bg-eco-950/30 border border-eco-200 dark:border-eco-900/50 rounded-full px-2.5 py-0.5 text-xs font-bold text-eco-700 dark:text-eco-400">
                🌱 {user.ecoPoints} EP
              </div>
            </div>
          )}
          
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex w-full items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-eco-500 text-white dark:bg-eco-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="mr-3 h-4.5 w-4.5" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center px-3 py-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="mr-3 h-4.5 w-4.5" />
                Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-1">
                <button
                  onClick={() => handleTabClick('login')}
                  className="flex justify-center items-center py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => handleTabClick('register')}
                  className="flex justify-center items-center py-2 text-white bg-eco-500 hover:bg-eco-600 rounded-lg text-xs font-bold"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
