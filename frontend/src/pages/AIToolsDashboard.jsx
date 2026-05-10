import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';
import { api } from '../utils/api';

const trendData = [
  { name: 'Jan', chatgpt: 65, claude: 40, gemini: 50, midjourney: 45 },
  { name: 'Feb', chatgpt: 68, claude: 45, gemini: 55, midjourney: 48 },
  { name: 'Mar', chatgpt: 70, claude: 55, gemini: 58, midjourney: 50 },
  { name: 'Apr', chatgpt: 75, claude: 60, gemini: 65, midjourney: 52 },
  { name: 'May', chatgpt: 85, claude: 68, gemini: 62, midjourney: 55 },
  { name: 'Jun', chatgpt: 88, claude: 75, gemini: 68, midjourney: 58 },
  { name: 'Jul', chatgpt: 90, claude: 80, gemini: 70, midjourney: 60 },
  { name: 'Aug', chatgpt: 95, claude: 85, gemini: 75, midjourney: 65 }
];

export default function AIToolsDashboard() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [popularRes, catRes] = await Promise.all([
        api.aiToolsPopular(),
        api.aiToolsCategories()
      ]);
      if (popularRes.success) setTools(popularRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (error) {
      console.error("Failed to fetch initial AI data:", error);
    }
    setLoading(false);
  };

  const handleCategoryClick = async (categoryId) => {
    setActiveCategory(categoryId);
    setLoading(true);
    try {
      if (categoryId === 'all') {
        const res = await api.aiToolsPopular();
        if (res.success) setTools(res.data);
      } else {
        const res = await api.aiToolsByCategory(categoryId);
        if (res.success) setTools(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch category tools:", error);
    }
    setLoading(false);
  };

  const toggleToolSelection = (tool) => {
    if (selectedTools.find(t => t.name === tool.name)) {
      setSelectedTools(selectedTools.filter(t => t.name !== tool.name));
    } else {
      if (selectedTools.length < 5) {
        setSelectedTools([...selectedTools, tool]);
      } else {
        alert("You can only compare up to 5 tools at once.");
      }
    }
  };

  const handleCompare = () => {
    setShowCompareModal(true);
  };

  return (
    <DashboardLayout context="ai">
      <div className="max-w-7xl mx-auto space-y-8" id="overview-section">
        
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Tools Compare</h1>
          <p className="text-gray-400 text-sm mb-6">Discover, compare and analyze the best AI tools across all categories.</p>
        </div>

        {/* Popular AI Tools */}
        <section id="popular-section" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{activeCategory === 'all' ? 'Popular AI Tools' : `${categories.find(c => c.id === activeCategory)?.name || 'AI'} Tools`}</h2>
            <button className="text-xs text-neon-purple hover:text-white font-medium" onClick={() => handleCategoryClick('all')}>View All</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loading ? (
              // Loading Skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl flex flex-col items-center text-center animate-pulse">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl mb-3"></div>
                  <div className="h-4 w-20 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-white/5 rounded"></div>
                </div>
              ))
            ) : (
              tools.map((tool, index) => {
                const isSelected = selectedTools.some(t => t.name === tool.name);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleToolSelection(tool)}
                    className={`glass-panel p-4 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden ${isSelected ? 'border-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-neon-purple/5' : 'hover:border-neon-purple/50'}`}
                  >
                    <div className="absolute top-2 left-2 z-20">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-neon-purple border-neon-purple text-white' : 'border-gray-500 text-transparent group-hover:border-neon-purple'}`}>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <span className="text-3xl">{tool.logo || '🤖'}</span>
                    </div>
                    <h3 className="text-white font-bold text-sm relative z-10">{tool.name}</h3>
                    <p className="text-gray-500 text-[10px] mb-2 font-medium relative z-10">{tool.provider} • {tool.category}</p>
                    <div className="text-[10px] text-gray-400 font-mono mb-2 bg-dark-900/50 px-2 py-0.5 rounded border border-gray-800">{tool.pricing}</div>
                    <div className="text-xs font-semibold text-[#f59e0b] relative z-10">★ {tool.rating} <span className="text-gray-600 font-normal ml-1">🔥{tool.popularity}</span></div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="categories-section">
          
          {/* Col 1: Categories */}
          <div className="lg:col-span-3 glass-panel rounded-xl p-5 h-full">
            <h3 className="text-base font-bold text-white mb-4">Categories</h3>
            <div className="space-y-1">
              <div 
                onClick={() => handleCategoryClick('all')}
                className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors ${activeCategory === 'all' ? 'bg-neon-purple/10 text-neon-purple font-medium' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <span>🌐 All Categories</span>
                <span>Top</span>
              </div>
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors ${activeCategory === cat.id ? 'bg-neon-purple/10 text-neon-purple font-medium' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <span>{cat.icon} {cat.name}</span>
                  <span className="text-xs bg-dark-900 px-2 py-0.5 rounded-full border border-gray-800">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Trend Graph */}
          <div id="analysis-section" className="lg:col-span-6 glass-panel rounded-xl p-5 h-full flex flex-col pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">AI Tools Trend (2026)</h3>
              <select className="bg-dark-900 border border-gray-700 text-xs rounded px-2 py-1 outline-none">
                <option>2026</option>
              </select>
            </div>
            
            <div className="flex gap-4 mb-4 text-xs font-medium">
              <div className="flex items-center gap-1 text-[#10a37f]"><span className="w-2 h-2 bg-[#10a37f] rounded-full"></span> ChatGPT</div>
              <div className="flex items-center gap-1 text-[#d97757]"><span className="w-2 h-2 bg-[#d97757] rounded-full"></span> Claude</div>
              <div className="flex items-center gap-1 text-[#1a73e8]"><span className="w-2 h-2 bg-[#1a73e8] rounded-full"></span> Gemini</div>
              <div className="flex items-center gap-1 text-[#a855f7]"><span className="w-2 h-2 bg-[#a855f7] rounded-full"></span> Midjourney</div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="chatgpt" stroke="#10a37f" strokeWidth={3} dot={{ fill: '#10a37f', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="claude" stroke="#d97757" strokeWidth={3} dot={{ fill: '#d97757', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gemini" stroke="#1a73e8" strokeWidth={3} dot={{ fill: '#1a73e8', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="midjourney" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Col 3: Recent Comparisons */}
          <div id="recent-section" className="lg:col-span-3 glass-panel rounded-xl p-5 h-full pt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Recent Comparisons</h3>
              <button className="text-xs text-neon-purple hover:text-white font-medium">View All</button>
            </div>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-[#d97757]/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[#d97757]">✴️</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ChatGPT vs Claude</h4>
                  <p className="text-[10px] text-gray-500">May 10, 2026 • 10:30 AM</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-[#00d2ff]/20 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[#00d2ff]">🖼️</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Midjourney vs DALL-E</h4>
                  <p className="text-[10px] text-gray-500">May 09, 2026 • 08:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <FloatingCompareDock 
        selectedItems={selectedTools} 
        onRemove={toggleToolSelection} 
        onCompare={handleCompare} 
        type="ai" 
      />
      
      <ComparisonModal 
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        type="ai"
        selectedItems={selectedTools}
      />

      <Chatbot type="ai_tools" />
    </DashboardLayout>
  );
}
