import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Leaf, Info, MessageSquare, Mail, Send, Award, Heart } from 'lucide-react';

const AboutUs = () => {
  const { triggerAlert } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    // Simulate contact form submission
    setTimeout(() => {
      setLoading(false);
      triggerAlert('success', 'Message sent successfully! We will get back to you shortly. 📩');
      setName('');
      setEmail('');
      setMessage('');
    }, 800);
  };

  const team = [
    { name: 'Dr. Sarah Green', role: 'Climate Advisor & Sci Lead', desc: 'Sarah holds a PhD in Ecology and counsels our coefficients model.' },
    { name: 'Marcus Stream', role: 'Fullstack Dev & Designer', desc: 'Marcus constructs the server logic and styles the dashboard interface.' },
    { name: 'Clara Sage', role: 'UX Advocate & Researcher', desc: 'Clara focuses on accessibility designs and daily challenge models.' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-slide-up">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">About EcoStep</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Our mission, our crew, and how we aim to catalyze sustainable lifestyle choices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mission & Vision cards */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex gap-4">
            <div className="h-10 w-10 bg-eco-100 dark:bg-eco-950/60 rounded-xl flex items-center justify-center text-eco-600 dark:text-eco-400 shrink-0">
              <Leaf className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                To democratize carbon calculations, making climate awareness immediate, gamified, and actionable. We believe small everyday actions compound to form systemic environmental recovery.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex gap-4">
            <div className="h-10 w-10 bg-ocean-100 dark:bg-ocean-950/60 rounded-xl flex items-center justify-center text-ocean-600 dark:text-ocean-400 shrink-0">
              <Award className="h-5.5 w-5.5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We envision a society where ecological footprint offsets are integrated into standard household practices. By highlighting carbon metrics, we hope to inspire green policies and clean energy adoption globally.
              </p>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white text-base mb-6 flex items-center gap-2">
            <Heart className="h-5 w-5 text-eco-600" />
            Meet the Team
          </h3>

          <div className="space-y-4">
            {team.map((member, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xs shrink-0 mt-0.5">
                  {member.name.split(' ').pop().charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-none">{member.name}</h4>
                  <span className="text-[10px] text-eco-600 dark:text-eco-400 font-semibold block mt-0.5">{member.role}</span>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Contact Form Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 shadow-sm max-w-2xl mx-auto">
        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 flex items-center gap-2">
          <Mail className="h-5.5 w-5.5 text-eco-600" />
          Send Us a Message
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Have questions about calculations, suggestions for eco challenges, or partnership inquiries? Get in touch!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name</label>
              <input
                type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message</label>
            <textarea
              required value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows="4"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-eco-500 text-sm text-slate-850 dark:text-slate-100 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-eco-500 to-eco-600 hover:from-eco-600 hover:to-eco-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Send className="h-4.5 w-4.5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
};

export default AboutUs;
