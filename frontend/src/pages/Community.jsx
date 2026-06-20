import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Award, MessageSquare, Send, Heart, Trees } from 'lucide-react';

const Community = () => {
  const { leaderboard, posts, user, createPost, likePost, fetchUserData } = useApp();
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Poll for updates on load
  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    
    setPosting(true);
    const success = await createPost(content);
    setPosting(false);
    
    if (success) {
      setContent('');
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-yellow-950 font-bold text-xs shadow-sm" title="1st Place">🥇</span>;
      case 2: return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-350 text-slate-900 font-bold text-xs shadow-sm" title="2nd Place">🥈</span>;
      case 3: return <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-amber-50 font-bold text-xs shadow-sm" title="3rd Place">🥉</span>;
      default: return <span className="text-slate-400 text-xs font-semibold pl-1.5">{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-slide-up">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Community Engagement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Compare eco achievements, share sustainability progress, and cheer on other climate action pioneers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Global Leaderboard Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-eco-600" />
            Eco Leaderboard
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 w-12 text-center">Rank</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3 text-right">Points</th>
                  <th className="pb-3 text-right">Trees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850/60">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((item, idx) => {
                    const isSelf = user && (item.id === user.id || item._id === user.id);
                    return (
                      <tr 
                        key={item._id} 
                        className={`text-sm ${isSelf ? 'bg-eco-50/30 dark:bg-eco-950/15 font-semibold text-eco-700 dark:text-eco-400' : 'text-slate-700 dark:text-slate-350'}`}
                      >
                        <td className="py-3 text-center flex justify-center">{getRankBadge(idx + 1)}</td>
                        <td className="py-3 truncate max-w-[100px]">{item.username} {isSelf && <span className="text-[9px] bg-eco-100 dark:bg-eco-900/60 rounded px-1.5 ml-1">You</span>}</td>
                        <td className="py-3 text-right">{item.ecoPoints?.toLocaleString()}</td>
                        <td className="py-3 text-right flex items-center justify-end gap-1">
                          <Trees className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          {item.treesPlanted || 0}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">Loading leaderboard...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community Chat & Posts Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Post Form */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-eco-500 to-ocean-500 text-white font-bold text-xs shrink-0 mt-1">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share a carbon saving tip or brag about planting trees..."
                  rows="3"
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-eco-500 text-slate-850 dark:text-slate-100 resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={posting || !content.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-eco-500 hover:bg-eco-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 text-xs font-bold transition-all shadow-md shadow-eco-500/10"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post Message
                </button>
              </div>
            </form>
          </div>

          {/* Feed List */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base border-b border-slate-50 dark:border-slate-850/60 pb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-eco-600" />
              Community Feed
            </h3>

            <div className="space-y-5 divide-y divide-slate-50 dark:divide-slate-850/40">
              {posts && posts.length > 0 ? (
                posts.map((post, idx) => {
                  const hasLiked = user && post.likes?.includes(user.id);
                  return (
                    <div key={post._id} className={`pt-4 ${idx === 0 ? 'pt-0 border-t-0' : 'border-t'}`}>
                      <div className="flex gap-3">
                        {/* Profile initials placeholder */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0">
                          {post.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">{post.username}</span>
                              <span className="text-[9px] bg-eco-50 dark:bg-eco-950/40 border border-eco-200 dark:border-eco-900 text-eco-700 dark:text-eco-400 px-1.5 py-0.2 rounded font-bold">
                                {post.ecoPoints} EP
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {post.content}
                          </p>

                          {/* Action Row */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => likePost(post._id)}
                              className={`flex items-center gap-1 text-xs hover:text-red-500 transition-colors ${hasLiked ? 'text-red-500 font-bold' : 'text-slate-400'}`}
                            >
                              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
                              <span>{post.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">No community posts yet. Be the first to share!</div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Community;
