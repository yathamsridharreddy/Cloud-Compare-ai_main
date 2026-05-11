import { useState, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';

/* ─── All AI Tools A–Z ─────────────────────────────────────── */
const allAITools = [
  { name: 'Adobe Firefly',     provider: 'Adobe',       pricing: '$20/mo',    rating: 4.5, tags: ['Image'],    icon: '🔥', category: 'Image Generation' },
  { name: 'AgentGPT',         provider: 'Reworkd',     pricing: 'Free/$10',  rating: 4.2, tags: ['Agents'],   icon: '🤖', category: 'AI Agents' },
  { name: 'Anthropic API',    provider: 'Anthropic',   pricing: 'Pay/use',   rating: 4.8, tags: ['API','LLM'],icon: '🔌', category: 'LLM APIs' },
  { name: 'AutoGPT',          provider: 'Significant', pricing: 'Free',      rating: 4.1, tags: ['Agents'],   icon: '⚙️', category: 'AI Agents' },
  { name: 'Beatoven',         provider: 'Beatoven',    pricing: '$20/mo',    rating: 4.3, tags: ['Music'],    icon: '🥁', category: 'Music AI' },
  { name: 'Beautiful.ai',     provider: 'Beautiful',   pricing: '$12/mo',    rating: 4.4, tags: ['Slides'],   icon: '📊', category: 'Productivity' },
  { name: 'ChatGPT',          provider: 'OpenAI',      pricing: '$20/mo',    rating: 4.9, tags: ['Writing','Coding'], icon: '💬', category: 'Writing AI' },
  { name: 'Claude',           provider: 'Anthropic',   pricing: '$20/mo',    rating: 4.8, tags: ['Analysis','Writing'], icon: '🧠', category: 'Writing AI' },
  { name: 'Cohere',           provider: 'Cohere',      pricing: 'Pay/use',   rating: 4.5, tags: ['API','LLM'],icon: '🔗', category: 'LLM APIs' },
  { name: 'Consensus',        provider: 'Consensus',   pricing: '$20/mo',    rating: 4.5, tags: ['Research'], icon: '✅', category: 'Research AI' },
  { name: 'Copy.ai',          provider: 'Copy.ai',     pricing: '$20/mo',    rating: 4.5, tags: ['Writing'],  icon: '📄', category: 'Writing AI' },
  { name: 'Cursor',           provider: 'Anysphere',   pricing: '$20/mo',    rating: 4.7, tags: ['Coding'],   icon: '💻', category: 'Coding AI' },
  { name: 'DALL·E 3',         provider: 'OpenAI',      pricing: '$15/mo',    rating: 4.7, tags: ['Image'],    icon: '🖼️', category: 'Image Generation' },
  { name: 'Descript',         provider: 'Descript',    pricing: '$15/mo',    rating: 4.6, tags: ['Video','Audio'], icon: '🎙️', category: 'Video Generation' },
  { name: 'Elicit',           provider: 'Elicit',      pricing: 'Free',      rating: 4.4, tags: ['Research'], icon: '📚', category: 'Research AI' },
  { name: 'ElevenLabs',       provider: 'ElevenLabs',  pricing: '$5/mo',     rating: 4.9, tags: ['Audio'],    icon: '🔊', category: 'Music AI' },
  { name: 'Framer AI',        provider: 'Framer',      pricing: '$20/mo',    rating: 4.5, tags: ['Design'],   icon: '🎨', category: 'Design AI' },
  { name: 'Gemini',           provider: 'Google',      pricing: 'Free/$20',  rating: 4.6, tags: ['Research','Coding'], icon: '🔎', category: 'Writing AI' },
  { name: 'GitHub Copilot',   provider: 'GitHub',      pricing: '$10/mo',    rating: 4.8, tags: ['Coding'],   icon: '🤖', category: 'Coding AI' },
  { name: 'Grok',             provider: 'xAI',         pricing: '$16/mo',    rating: 4.5, tags: ['Research'], icon: '⚡', category: 'Research AI' },
  { name: 'Heygen',           provider: 'Heygen',      pricing: '$29/mo',    rating: 4.7, tags: ['Video'],    icon: '🎥', category: 'Video Generation' },
  { name: 'Ideogram',         provider: 'Ideogram',    pricing: 'Free/$8',   rating: 4.5, tags: ['Image'],    icon: '🖌️', category: 'Image Generation' },
  { name: 'Jasper',           provider: 'Jasper',      pricing: '$39/mo',    rating: 4.6, tags: ['Writing'],  icon: '📝', category: 'Writing AI' },
  { name: 'Kaiber',           provider: 'Kaiber',      pricing: '$10/mo',    rating: 4.4, tags: ['Video'],    icon: '🎞️', category: 'Video Generation' },
  { name: 'Kling',            provider: 'Kuaishou',    pricing: '$15/mo',    rating: 4.4, tags: ['Video'],    icon: '🎬', category: 'Video Generation' },
  { name: 'Leonardo.ai',      provider: 'Leonardo',    pricing: 'Free/$12',  rating: 4.6, tags: ['Image'],    icon: '🎨', category: 'Image Generation' },
  { name: 'Luma AI',          provider: 'Luma',        pricing: '$29/mo',    rating: 4.7, tags: ['Video','3D'],icon: '🌐', category: 'Video Generation' },
  { name: 'Midjourney',       provider: 'Midjourney',  pricing: '$10/mo',    rating: 4.9, tags: ['Image'],    icon: '🎨', category: 'Image Generation' },
  { name: 'Mistral',          provider: 'Mistral AI',  pricing: 'Pay/use',   rating: 4.6, tags: ['API','LLM'],icon: '💨', category: 'LLM APIs' },
  { name: 'MusicLM',          provider: 'Google',      pricing: 'Free',      rating: 4.4, tags: ['Music'],    icon: '🎹', category: 'Music AI' },
  { name: 'Notion AI',        provider: 'Notion',      pricing: '$10/mo',    rating: 4.6, tags: ['Productivity'],icon: '📓', category: 'Productivity' },
  { name: 'OpenAI API',       provider: 'OpenAI',      pricing: 'Pay/use',   rating: 4.9, tags: ['API','LLM'],icon: '🔌', category: 'LLM APIs' },
  { name: 'Perplexity',       provider: 'Perplexity',  pricing: 'Free/$20',  rating: 4.7, tags: ['Research'], icon: '🧾', category: 'Research AI' },
  { name: 'Pika',             provider: 'Pika Labs',   pricing: '$8/mo',     rating: 4.5, tags: ['Video'],    icon: '📽️', category: 'Video Generation' },
  { name: 'Replit AI',        provider: 'Replit',      pricing: '$20/mo',    rating: 4.4, tags: ['Coding'],   icon: '🌐', category: 'Coding AI' },
  { name: 'Runway ML',        provider: 'Runway',      pricing: '$15/mo',    rating: 4.8, tags: ['Video'],    icon: '🎬', category: 'Video Generation' },
  { name: 'Semantic Scholar', provider: 'AllenAI',     pricing: 'Free',      rating: 4.4, tags: ['Research'], icon: '🔬', category: 'Research AI' },
  { name: 'Sora',             provider: 'OpenAI',      pricing: '$20/mo',    rating: 4.7, tags: ['Video'],    icon: '🎥', category: 'Video Generation' },
  { name: 'Stable Diffusion', provider: 'Stability',   pricing: 'Free',      rating: 4.6, tags: ['Image'],    icon: '🧩', category: 'Image Generation' },
  { name: 'Suno',             provider: 'Suno',        pricing: '$8/mo',     rating: 4.6, tags: ['Music'],    icon: '🎧', category: 'Music AI' },
  { name: 'Tabnine',          provider: 'Tabnine',     pricing: '$12/mo',    rating: 4.5, tags: ['Coding'],   icon: '🧠', category: 'Coding AI' },
  { name: 'Together AI',      provider: 'Together',    pricing: 'Pay/use',   rating: 4.5, tags: ['API','LLM'],icon: '🔗', category: 'LLM APIs' },
  { name: 'Udio',             provider: 'Udio',        pricing: '$10/mo',    rating: 4.5, tags: ['Music'],    icon: '🎼', category: 'Music AI' },
  { name: 'v0 by Vercel',     provider: 'Vercel',      pricing: 'Free/$20',  rating: 4.7, tags: ['Coding','Design'], icon: '⚡', category: 'Coding AI' },
  { name: 'Writesonic',       provider: 'Writesonic',  pricing: '$16/mo',    rating: 4.4, tags: ['Writing'],  icon: '✍️', category: 'Writing AI' },
  { name: 'xAI Grok API',     provider: 'xAI',         pricing: 'Pay/use',   rating: 4.4, tags: ['API','LLM'],icon: '⚡', category: 'LLM APIs' },
  { name: 'You.com',          provider: 'You.com',     pricing: 'Free/$15',  rating: 4.3, tags: ['Research'], icon: '🔍', category: 'Research AI' },
  { name: 'Zapier AI',        provider: 'Zapier',      pricing: '$20/mo',    rating: 4.5, tags: ['Automation'],icon: '⚡', category: 'Productivity' },
  { name: 'Zed AI',           provider: 'Zed',         pricing: 'Free',      rating: 4.3, tags: ['Coding'],   icon: '🖥️', category: 'Coding AI' },
];

const categoryTabs = [...new Set(allAITools.map(t => t.category))].sort();

const popularTools = allAITools
  .filter(t => ['ChatGPT','Claude','Gemini','Midjourney','Runway ML','Cursor','Perplexity','GitHub Copilot','Suno','DALL·E 3'].includes(t.name));

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
  { name: 'Dec', chatgpt: 96, claude: 88, gemini: 90, midjourney: 75 },
];

const recentComparisons = [
  { title: 'ChatGPT vs Claude', date: 'May 10, 2026', icon: '💬' },
  { title: 'Gemini vs Cursor', date: 'May 09, 2026', icon: '🤖' },
  { title: 'Midjourney vs DALL·E 3', date: 'May 08, 2026', icon: '🎨' },
  { title: 'Claude vs Gemini', date: 'May 07, 2026', icon: '🧠' },
];

function ToolCard({ tool, isSelected, onToggle }) {
  return (
    <div
      onClick={() => onToggle(tool)}
      className={`glass-panel p-5 rounded-3xl border transition duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-neon-purple shadow-[0_0_25px_rgba(168,85,247,0.25)] bg-neon-purple/5'
          : 'hover:border-neon-purple/40'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">{tool.name}</h3>
            <p className="text-xs text-gray-400">{tool.provider}</p>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shrink-0 ${isSelected ? 'bg-neon-purple border-neon-purple text-white' : 'border-gray-700 text-gray-500'}`}>
          {isSelected ? '✓' : '+'}
        </div>
      </div>
      <div className="text-sm text-gray-300 mb-3 font-mono">{tool.pricing}</div>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 rounded-full bg-neon-purple/10 text-neon-purple text-[11px] border border-neon-purple/20">{tool.category}</span>
        {tool.tags.map((tag) => <span key={tag} className="px-2 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{tag}</span>)}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">{tool.rating}</span>
        <span className="text-[#fbbf24] text-xs">{'★'.repeat(Math.round(tool.rating))}</span>
      </div>
    </div>
  );
}

export default function AIToolsDashboard() {
  const [activeSection, setActiveSection]     = useState('popular-tools');
  const [activeCategory, setActiveCategory]   = useState(categoryTabs[0]);
  const [selectedTools, setSelectedTools]     = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');

  const categoryTools = useMemo(() => {
    const base = allAITools.filter(t => t.category === activeCategory);
    const filtered = searchQuery
      ? base.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.provider.toLowerCase().includes(searchQuery.toLowerCase()))
      : base;
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeCategory, searchQuery]);

  const toggleToolSelection = (tool) => {
    const already = selectedTools.some(i => i.name === tool.name);
    if (already) setSelectedTools(selectedTools.filter(i => i.name !== tool.name));
    else if (selectedTools.length < 5) setSelectedTools([...selectedTools, tool]);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'popular-tools':
        return (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Popular Tools</h2>
                <p className="text-gray-400 text-sm">Top-rated AI tools — click any to add to comparison.</p>
              </div>
              <button onClick={() => setActiveSection('categories')} className="px-4 py-2 rounded-xl bg-neon-purple/10 text-neon-purple text-sm font-semibold transition hover:bg-neon-purple/15">
                Browse A–Z
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTools.map(tool => (
                <ToolCard key={tool.name} tool={tool} isSelected={selectedTools.some(i => i.name === tool.name)} onToggle={toggleToolSelection} />
              ))}
            </div>
          </section>
        );

      case 'categories':
        return (
          <section className="animate-fade-in-up">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Categories <span className="text-neon-purple text-base font-normal ml-1">(A–Z)</span>
                </h2>
                <p className="text-gray-400 text-sm">{categoryTools.length} tools in <span className="text-neon-purple font-medium">{activeCategory}</span></p>
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-dark rounded-2xl px-4 py-3 text-sm bg-[#09090d] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 w-56"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3 mb-6">
              {categoryTabs.map(tab => (
                <button key={tab} type="button" onClick={() => { setActiveCategory(tab); setSearchQuery(''); }}
                  className={`nav-pill ${activeCategory === tab ? 'active-purple' : ''}`}>
                  {tab}
                </button>
              ))}
            </div>

            {categoryTools.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p>No tools found matching "{searchQuery}".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryTools.map(tool => (
                  <ToolCard key={tool.name} tool={tool} isSelected={selectedTools.some(i => i.name === tool.name)} onToggle={toggleToolSelection} />
                ))}
              </div>
            )}
          </section>
        );

      case 'ai-trend-analysis':
        return (
          <section className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">AI Trend Analysis</h2>
              <p className="text-gray-400 text-sm">Track AI tool popularity across 2026.</p>
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
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={aiTrendData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="chatgpt" stroke="#10a37f" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="claude" stroke="#d97757" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gemini" stroke="#1a73e8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="midjourney" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        );

      case 'recent-comparisons':
        return (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Comparisons</h2>
                <p className="text-gray-400 text-sm">Your latest AI tool comparison history.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-white/5 text-sm text-gray-300 transition hover:bg-white/10">View All</button>
            </div>
            <div className="grid gap-4">
              {recentComparisons.map(item => (
                <div key={item.title} className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">{item.icon}</div>
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
        return null;
    }
  };

  return (
    <DashboardLayout context="ai" activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Tools Dashboard</h1>
          <p className="text-gray-400 text-sm">Browse {allAITools.length}+ AI tools A–Z. Select up to 5 to compare.</p>
        </div>
        {renderSection()}
      </div>

      <FloatingCompareDock selectedItems={selectedTools} onRemove={toggleToolSelection} onCompare={() => setShowCompareModal(true)} type="ai" />
      <ComparisonModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} type="ai" selectedItems={selectedTools} />
      <Chatbot type="ai_tools" />
    </DashboardLayout>
  );
}
