import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden flex flex-col">
      {/* Wave Background */}
      <div className="bg-waves"></div>

      {/* Top Navbar */}
      <nav className="h-20 px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,112,243,0.3)]">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">CloudCompare <span className="text-neon-purple text-sm ml-0.5">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-neon-purple border-2 border-dark-900 rounded-full"></span>
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[2px] cursor-pointer">
            <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`} alt={userName} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
            Welcome back, {userName}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-gray-400 text-lg">Choose what you want to compare today</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Cloud Compare Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
            onClick={() => navigate('/cloud-compare')}
            className="glass-panel rounded-2xl p-8 cursor-pointer relative overflow-hidden group glow-card-blue flex items-center gap-6"
          >
            {/* Decoration Graph */}
            <div className="absolute bottom-0 right-8 flex items-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-8 bg-neon-blue/30 rounded-t-sm"></div>
              <div className="w-3 h-12 bg-neon-blue/50 rounded-t-sm"></div>
              <div className="w-3 h-20 bg-neon-blue rounded-t-sm shadow-[0_0_15px_rgba(0,112,243,0.8)]"></div>
            </div>

            <div className="w-24 h-24 shrink-0 rounded-full bg-dark-900 border border-neon-blue/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,112,243,0.2)]">
              <span className="text-5xl drop-shadow-[0_0_10px_rgba(0,112,243,0.5)]">☁️</span>
            </div>
            
            <div className="flex flex-col items-start z-10">
              <h2 className="text-2xl font-bold mb-2 text-white">Cloud Compare</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-[280px]">Compare cloud providers, services, pricing, performance & regions.</p>
              <button className="btn-blue px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                Go to Cloud Compare →
              </button>
            </div>
          </motion.div>

          {/* AI Tools Compare Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            onClick={() => navigate('/ai-tools')}
            className="glass-panel rounded-2xl p-8 cursor-pointer relative overflow-hidden group glow-card-purple flex items-center gap-6"
          >
            {/* Decoration Graph */}
            <div className="absolute bottom-0 right-8 flex items-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-8 bg-neon-purple/30 rounded-t-sm"></div>
              <div className="w-3 h-12 bg-neon-purple/50 rounded-t-sm"></div>
              <div className="w-3 h-20 bg-neon-purple rounded-t-sm shadow-[0_0_15px_rgba(138,43,226,0.8)]"></div>
            </div>

            <div className="w-24 h-24 shrink-0 rounded-full bg-dark-900 border border-neon-purple/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(138,43,226,0.2)]">
              <span className="text-5xl drop-shadow-[0_0_10px_rgba(138,43,226,0.5)]">🤖</span>
            </div>
            
            <div className="flex flex-col items-start z-10">
              <h2 className="text-2xl font-bold mb-2 text-white">AI Tools Compare</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-[280px]">Compare AI tools, models, image generators, LLMs & more.</p>
              <button className="btn-purple px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                Go to AI Tools Compare →
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="absolute bottom-8 text-sm text-gray-500 font-medium tracking-widest"
        >
          Intelligent • Fast • Reliable • Insightful
        </motion.div>
      </main>
    </div>
  );
}
