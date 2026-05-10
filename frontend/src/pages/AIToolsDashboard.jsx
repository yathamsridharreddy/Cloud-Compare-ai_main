import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';

const popularTools = [
  { name: 'ChatGPT', provider: 'OpenAI', pricing: '$20/mo', rating: 4.9, tags: ['Writing', 'Coding'], icon: '💬' },
  { name: 'Claude', provider: 'Anthropic', pricing: '$20/mo', rating: 4.8, tags: ['Analysis', 'Writing'], icon: '🧠' },
  { name: 'Gemini', provider: 'Google', pricing: 'Free/$20', rating: 4.6, tags: ['Research', 'Coding'], icon: '🔎' },
  { name: 'Cursor', provider: 'Anysphere', pricing: '$20/mo', rating: 4.7, tags: ['Coding'], icon: '🖥️' },
  { name: 'Midjourney', provider: 'Midjourney', pricing: '$10/mo', rating: 4.9, tags: ['Image'], icon: '🎨' },
  { name: 'Runway', provider: 'Runway', pricing: '$15/mo', rating: 4.8, tags: ['Video'], icon: '🎬' },
  { name: 'Perplexity', provider: 'Perplexity', pricing: 'Free/$20', rating: 4.7, tags: ['Research'], icon: '🧾' }
];

const categoryToolMap = {
  'Coding AI': [
    { name: 'Cursor', provider: 'Anysphere', pricing: '$20/mo', rating: 4.7, tags: ['Coding'], icon: '💻' },
    { name: 'GitHub Copilot', provider: 'GitHub', pricing: '$20/mo', rating: 4.8, tags: ['Coding'], icon: '🤖' },
    { name: 'Tabnine', provider: 'Tabnine', pricing: '$20/mo', rating: 4.5, tags: ['Coding'], icon: '🧠' },
    { name: 'Replit AI', provider: 'Replit', pricing: '$20/mo', rating: 4.4, tags: ['Coding'], icon: '🌐' }
  ],
  'Video Generation': [
    { name: 'Runway', provider: 'Runway', pricing: '$15/mo', rating: 4.8, tags: ['Video'], icon: '🎬' },
    { name: 'Sora', provider: 'Sora', pricing: '$15/mo', rating: 4.6, tags: ['Video'], icon: '🎥' },
    { name: 'Pika', provider: 'Pika', pricing: '$15/mo', rating: 4.5, tags: ['Video'], icon: '📽️' },
    { name: 'Kling', provider: 'Kling', pricing: '$15/mo', rating: 4.4, tags: ['Video'], icon: '🎞️' }
  ],
  'Image Generation': [
    { name: 'Midjourney', provider: 'Midjourney', pricing: '$10/mo', rating: 4.9, tags: ['Image'], icon: '🎨' },
    { name: 'DALL·E', provider: 'OpenAI', pricing: '$15/mo', rating: 4.7, tags: ['Image'], icon: '🖼️' },
    { name: 'Stable Diffusion', provider: 'Stability', pricing: 'Free', rating: 4.6, tags: ['Image'], icon: '🧩' },
    { name: 'Firefly', provider: 'Adobe', pricing: '$20/mo', rating: 4.5, tags: ['Image'], icon: '🔥' }
  ],
  'Writing AI': [
    { name: 'ChatGPT', provider: 'OpenAI', pricing: '$20/mo', rating: 4.9, tags: ['Writing'], icon: '✍️' },
    { name: 'Claude', provider: 'Anthropic', pricing: '$20/mo', rating: 4.8, tags: ['Writing'], icon: '🧠' },
    { name: 'Jasper', provider: 'Jasper', pricing: '$20/mo', rating: 4.6, tags: ['Writing'], icon: '📝' },
    { name: 'Copy.ai', provider: 'Copy.ai', pricing: '$20/mo', rating: 4.5, tags: ['Writing'], icon: '📄' }
  ],
  'Music AI': [
    { name: 'Suno', provider: 'Suno', pricing: '$20/mo', rating: 4.6, tags: ['Music'], icon: '🎧' },
    { name: 'Udio', provider: 'Udio', pricing: '$20/mo', rating: 4.5, tags: ['Music'], icon: '🎼' },
    { name: 'MusicLM', provider: 'Google', pricing: '$20/mo', rating: 4.4, tags: ['Music'], icon: '🎹' },
    { name: 'Beatoven', provider: 'Beatoven', pricing: '$20/mo', rating: 4.3, tags: ['Music'], icon: '🥁' }
  ],
  'Research AI': [
    { name: 'Perplexity', provider: 'Perplexity', pricing: 'Free/$20', rating: 4.7, tags: ['Research'], icon: '🔎' },
    { name: 'Elicit', provider: 'Elicit', pricing: 'Free', rating: 4.4, tags: ['Research'], icon: '📚' },
    { name: 'Consensus', provider: 'Consensus', pricing: '$20/mo', rating: 4.5, tags: ['Research'], icon: '✅' },
    { name: 'Semantic Scholar', provider: 'AllenAI', pricing: 'Free', rating: 4.4, tags: ['Research'], icon: '🧠' }
  ]
};

const categoryTabs = Object.keys(categoryToolMap);

const aiTrendData = [
  { name: 'Jan', chatgpt: 42, claude: 32, gemini: 35, midjourney: 28 },
  { name: 'Feb', chatgpt: 48, claude: 35, gemini: 40, midjourney: 32 },
  { name: 'Mar', chatgpt: 55, claude: 40, gemini: 45, midjourney: 36 },
  { name: 'Apr', chatgpt: 65, claude: 50, gemini: 55, midjourney: 42 },
  { name: 'May', chatgpt: 72, claude: 58, gemini: 62, midjourney: 48 },
  { name: 'Jun', chatgpt: 80, claude: 64, gemini: 70, midjourney: 52 },
  { name: 'Jul', chatgpt: 85, claude: 70, gemini: 75, midjourney: 56 },
  { name: 'Aug', chatgpt: 90, claude: 75, gemini: 80, midjourney: 60 },
  { name: 'Sep', chatgpt: 92, claude: 78, gemini: 83, midjourney: 64 },
  { name: 'Oct', chatgpt: 94, claude: 82, gemini: 86, midjourney: 68 },
  { name: 'Nov', chatgpt: 95, claude: 85, gemini: 88, midjourney: 72 },
  { name: 'Dec', chatgpt: 96, claude: 88, gemini: 90, midjourney: 75 }
];

const recentComparisons = [
  { title: 'ChatGPT vs Claude', date: 'May 10, 2026', icon: '💬' },
  { title: 'Gemini vs Cursor', date: 'May 09, 2026', icon: '🤖' },
  { title: 'Midjourney vs DALL·E', date: 'May 08, 2026', icon: '🎨' },
  { title: 'Claude vs Gemini', date: 'May 07, 2026', icon: '🧠' }
];

export default function AIToolsDashboard() {
  const [activeSection, setActiveSection] = useState('popular-tools');
  const [activeCategory, setActiveCategory] = useState(categoryTabs[0]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const selectedCategoryTools = categoryToolMap[activeCategory];

  const toggleToolSelection = (tool) => {
    const alreadySelected = selectedTools.some((item) => item.name === tool.name);
    if (alreadySelected) {
      setSelectedTools(selectedTools.filter((item) => item.name !== tool.name));
    } else if (selectedTools.length < 5) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const formatScore = (value) => `${value}`;

  const renderSection = () => {
    switch (activeSection) {
      case 'popular-tools':
        return (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Popular Tools</h2>
                <p className="text-gray-400 text-sm">A curated selection of the most powerful AI tools available today.</p>
              </div>
              <button onClick={() => setActiveSection('categories')} className="px-4 py-2 rounded-xl bg-neon-purple/10 text-neon-purple text-sm font-semibold transition hover:bg-neon-purple/15">
                Browse Categories
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTools.map((tool) => {
                const isSelected = selectedTools.some((item) => item.name === tool.name);
                return (
                  <div key={tool.name} onClick={() => toggleToolSelection(tool)} className={`glass-panel p-5 rounded-3xl border transition duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-neon-purple shadow-[0_0_25px_rgba(168,85,247,0.25)] bg-neon-purple/5' : 'hover:border-neon-purple/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-purple-200/70">AI Tool</p>
                        <h3 className="text-xl font-semibold text-white mt-2">{tool.name}</h3>
                      </div>
                      <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${isSelected ? 'bg-neon-purple border-neon-purple text-white' : 'border-gray-700 text-gray-500'}`}>
                        {isSelected ? '✓' : '+'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-4">{tool.provider}</div>
                    <div className="text-sm text-gray-300 mb-4">{tool.pricing}</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.tags.map((tag) => <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{tag}</span>)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span className="font-semibold text-white">{tool.rating}</span>
                      <span className="text-[#fbbf24]">{'★'.repeat(Math.round(tool.rating))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'categories':
        return (
          <section className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Categories</h2>
              <p className="text-gray-400 text-sm">Select a category to explore the right tools for the job.</p>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {categoryTabs.map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveCategory(tab)} className={`nav-pill ${activeCategory === tab ? 'active-purple' : ''}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {selectedCategoryTools.map((tool) => {
                const isSelected = selectedTools.some((item) => item.name === tool.name);
                return (
                  <div key={tool.name} onClick={() => toggleToolSelection(tool)} className={`glass-panel p-5 rounded-3xl border transition duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-neon-purple shadow-[0_0_25px_rgba(168,85,247,0.25)] bg-neon-purple/5' : 'hover:border-neon-purple/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                        <p className="text-sm text-gray-400">{tool.provider}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${isSelected ? 'bg-neon-purple border-neon-purple text-white' : 'border-gray-700 text-gray-500'}`}>
                        {isSelected ? '✓' : '+'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-4">{tool.pricing}</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tool.tags.map((tag) => <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{tag}</span>)}
                    </div>
                    <div className="text-sm text-[#fbbf24]">Rating: {tool.rating}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'ai-trend-analysis':
        return (
          <section className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">AI Trend Analysis</h2>
              <p className="text-gray-400 text-sm">Track AI tool popularity across 2026 with hover-enabled metric insights.</p>
            </div>
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="flex flex-wrap justify-between gap-4 mb-5">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Year</p>
                  <p className="text-white font-semibold">2026</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10a37f]"></span>ChatGPT</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d97757]"></span>Claude</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>Gemini</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#a855f7]"></span>Midjourney</div>
                </div>
              </div>
              <div className="min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aiTrendData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '12px' }} formatter={(value) => [`${formatScore(value)}`, 'Score']} />
                    <Line type="monotone" dataKey="chatgpt" stroke="#10a37f" strokeWidth={3} dot={{ r: 4, fill: '#10a37f' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="claude" stroke="#d97757" strokeWidth={3} dot={{ r: 4, fill: '#d97757' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="gemini" stroke="#1a73e8" strokeWidth={3} dot={{ r: 4, fill: '#1a73e8' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="midjourney" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        );

      case 'recent-comparisons':
        return (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Comparisons</h2>
                <p className="text-gray-400 text-sm">Latest tool comparison history in one place.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-300 transition hover:bg-white/10">View Full Report</button>
            </div>
            <div className="grid gap-4">
              {recentComparisons.map((item) => (
                <div key={item.title} className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center text-white font-semibold text-sm border border-white/10">{item.icon}</div>
                    <div>
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-neon-purple text-white text-sm transition hover:bg-neon-purple/90">View Report</button>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return (
          <section className="animate-fade-in-up">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {['popular-tools', 'categories', 'ai-trend-analysis', 'recent-comparisons'].map((section) => (
                <button key={section} onClick={() => setActiveSection(section)} className="glass-panel p-6 rounded-3xl border border-white/10 text-left hover:border-neon-purple/40 transition">
                  <h3 className="text-lg font-semibold text-white">{section.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</h3>
                  <p className="text-sm text-gray-400 mt-2">Click to explore the {section.replace(/-/g, ' ')} section.</p>
                </button>
              ))}
            </div>
          </section>
        );
    }
  };

  return (
    <DashboardLayout context="ai" activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Tools Dashboard</h1>
          <p className="text-gray-400 text-sm">Use the sidebar to switch between AI tool sections without page refresh.</p>
        </div>
        {renderSection()}
      </div>

      <FloatingCompareDock selectedItems={selectedTools} onRemove={(tool) => toggleToolSelection(tool)} onCompare={() => setShowCompareModal(true)} type="ai" />
      <ComparisonModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} type="ai" selectedItems={selectedTools} />
      <Chatbot type="ai_tools" />
    </DashboardLayout>
  );
}
