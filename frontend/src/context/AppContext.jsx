import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  // App Stats states
  const [history, setHistory] = useState([]);
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [posts, setPosts] = useState([]);

  // Alert system state
  const [alert, setAlert] = useState(null); // { type: 'success'|'error'|'info', message: '' }

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  // Axios/Fetch headers builder
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Load profile when token changes
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchUserData();
    } else {
      setUser(null);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  // Fetch all user-related records
  const fetchUserData = () => {
    fetchFootprintHistory();
    fetchGoals();
    fetchChallenges();
    fetchLeaderboard();
    fetchPosts();
  };

  // --- AUTH SERVICES ---
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      setLoading(false);
      
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        triggerAlert('success', `Welcome to EcoStep, ${data.user.username}! 🌱`);
        setActiveTab('home');
        return true;
      } else {
        triggerAlert('error', data.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      setLoading(false);
      triggerAlert('error', 'Network error during registration');
      return false;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        triggerAlert('success', `Welcome back, ${data.user.username}! ✨`);
        setActiveTab('dashboard');
        return true;
      } else {
        triggerAlert('error', data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setLoading(false);
      triggerAlert('error', 'Network error during login');
      return false;
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    triggerAlert('info', 'Logged out successfully. See you soon! 👋');
    setActiveTab('home');
  };

  // --- CALCULATOR SERVICES ---
  const saveFootprint = async (footprintData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calculator`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(footprintData)
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        triggerAlert('success', data.message);
        // Refresh local history and profile points
        fetchFootprintHistory();
        fetchProfile();
        fetchLeaderboard();
        return data;
      } else {
        triggerAlert('error', data.message || 'Failed to save calculation');
        return null;
      }
    } catch (err) {
      setLoading(false);
      triggerAlert('error', 'Network error calculating footprint');
      return null;
    }
  };

  const fetchFootprintHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/calculator/history`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  // --- GOALS SERVICES ---
  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error('Fetch goals error:', err);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(prev => [data, ...prev]);
        triggerAlert('success', 'Goal set successfully! You can do it! 🎯');
        return true;
      }
    } catch (err) {
      triggerAlert('error', 'Failed to create goal');
    }
    return false;
  };

  const updateGoalProgress = async (goalId, value) => {
    try {
      const res = await fetch(`${API_BASE}/goals/${goalId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ currentValue: value })
      });
      if (res.ok) {
        const data = await res.json();
        // Update local list
        setGoals(prev => prev.map(g => g._id === goalId ? data.goal : g));
        triggerAlert(data.completedJustNow ? 'success' : 'info', data.message);
        
        // Refresh profile points and community if badge unlocked
        if (data.user) {
          setUser(prev => ({ ...prev, ecoPoints: data.user.ecoPoints }));
          fetchLeaderboard();
          fetchPosts();
        }
        return true;
      }
    } catch (err) {
      triggerAlert('error', 'Failed to update goal progress');
    }
    return false;
  };

  const deleteGoal = async (goalId) => {
    try {
      const res = await fetch(`${API_BASE}/goals/${goalId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setGoals(prev => prev.filter(g => g._id !== goalId));
        triggerAlert('info', 'Goal deleted.');
        return true;
      }
    } catch (err) {
      triggerAlert('error', 'Failed to delete goal');
    }
    return false;
  };

  // --- DAILY CHALLENGES & ACTION CENTER SERVICES ---
  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${API_BASE}/actions/challenges`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error('Fetch challenges error:', err);
    }
  };

  const completeChallenge = async (challengeId) => {
    try {
      const res = await fetch(`${API_BASE}/actions/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', data.message);
        
        // Update user state
        setUser(prev => ({
          ...prev,
          ecoPoints: data.user.ecoPoints
        }));
        
        // Refresh challenges lists
        fetchChallenges();
        fetchLeaderboard();
        return true;
      } else {
        triggerAlert('warning', data.message);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to submit challenge');
    }
    return false;
  };

  const plantTree = async () => {
    try {
      const res = await fetch(`${API_BASE}/actions/plant-tree`, {
        method: 'POST',
        headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        triggerAlert('success', data.message);
        
        // Update user state
        setUser(prev => ({
          ...prev,
          ecoPoints: data.user.ecoPoints,
          treesPlanted: data.user.treesPlanted
        }));
        
        fetchLeaderboard();
        fetchPosts();
        return true;
      } else {
        triggerAlert('error', data.message);
      }
    } catch (err) {
      triggerAlert('error', 'Failed to plant tree');
    }
    return false;
  };

  // --- LEADERBOARD & COMMUNITY SERVICES ---
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Fetch posts error:', err);
    }
  };

  const createPost = async (content) => {
    try {
      const res = await fetch(`${API_BASE}/community/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => [data, ...prev]);
        triggerAlert('success', 'Shared with community! 📢');
        return true;
      }
    } catch (err) {
      triggerAlert('error', 'Failed to post message');
    }
    return false;
  };

  const likePost = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/community/posts/${postId}/like`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? data : p));
        return true;
      }
    } catch (err) {
      console.error('Like post error:', err);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        loading,
        activeTab,
        darkMode,
        alert,
        history,
        goals,
        challenges,
        leaderboard,
        posts,
        setActiveTab,
        setDarkMode,
        triggerAlert,
        register,
        login,
        logout,
        saveFootprint,
        addGoal,
        updateGoalProgress,
        deleteGoal,
        completeChallenge,
        plantTree,
        createPost,
        likePost,
        fetchUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
