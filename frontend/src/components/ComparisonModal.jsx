import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { api } from '../utils/api';

export default function ComparisonModal({ isOpen, onClose, type, selectedItems }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      fetchComparison();
    }
  }, [isOpen, selectedItems]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      if (type === 'ai') {
        const itemNames = selectedItems.map(item => item.name);
        const res = await api.aiCompare({ purpose: "General Analysis", selected_tools: itemNames });
        if (res.success) {
          setData(res.data);
        }
      } else {
        const category = selectedItems[0]?.category || "Compute";
        const itemNames = selectedItems.map(item => `${item.provider} ${item.service || item.service_name || ''}`.trim());
        const res = await api.cloudCompare({ category, serviceType: "all", selected_services: itemNames, hours: 730 });
        if (res.success) {
          setData(res.data);
        }
      }
    } catch (error) {
      console.error("Comparison fetch failed:", error);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const iconForRow = (row) => row?.serviceIcon || row?.categoryIcon || row?.icon || (type === 'ai' ? '🤖' : '☁️');
  const labelForRow = (row) => type === 'ai' ? row.tool_name : row.service_name;
  const providerForRow = (row) => type === 'ai' ? row.provider : row.platform;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        ></motion.div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {type === 'ai' ? 'AI Tools Comparison Report' : 'Cloud Services Comparison Report'}
              </h2>
              <p className="text-sm text-gray-400">AI-generated analysis based on real-time data</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-neon-purple animate-pulse font-medium">Generating AI Comparison...</p>
              </div>
            ) : data ? (
              <div className="space-y-8">
                
                {/* Winner / Recommendation Banner */}
                {data.recommendation || (data.tools && data.tools[0]) ? (
                  <div className={`p-6 rounded-xl border ${type === 'ai' ? 'bg-neon-purple/10 border-neon-purple/30' : 'bg-neon-blue/10 border-neon-blue/30'} flex gap-6 items-start`}>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                      {type === 'ai' ? '🏆' : iconForRow(data.recommendation)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">AI Recommendation</h3>
                      {type !== 'ai' && data.recommendation ? (
                        <p className="text-sm font-semibold mb-2" style={{ color: data.recommendation.providerColor || '#38bdf8' }}>
                          {data.recommendation.platform} {data.recommendation.service_name}
                        </p>
                      ) : null}
                      <p className="text-gray-300">
                        {type === 'ai' 
                          ? data.tools[0]?.description 
                          : data.recommendation?.reason || "Based on the requested configuration, this is the optimal choice."}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart (Performance/Features) */}
                  <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-6 text-center">Performance vs Popularity</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={type === 'ai' ? data.tools : data.services}>
                          <PolarGrid stroke="#2a2a3a" />
                          <PolarAngleAxis dataKey={type === 'ai' ? 'tool_name' : 'service_name'} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey={type === 'ai' ? 'score' : 'performance_score'} stroke={type === 'ai' ? '#a855f7' : '#38bdf8'} fill={type === 'ai' ? '#a855f7' : '#38bdf8'} fillOpacity={0.4} />
                          <Radar name="Popularity" dataKey={type === 'ai' ? 'score' : 'popularity_score'} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                          <Tooltip contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '8px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bar Chart (Pricing/Score) */}
                  <div className="glass-panel p-6 rounded-xl border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-6 text-center">
                      {type === 'ai' ? 'Overall AI Score' : 'Monthly Estimated Cost'}
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={type === 'ai' ? data.tools : data.services} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                          <XAxis dataKey={type === 'ai' ? 'tool_name' : 'provider'} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey={type === 'ai' ? 'score' : 'cost'} fill={type === 'ai' ? '#a855f7' : '#38bdf8'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="text-xs uppercase bg-white/5 text-gray-300">
                        <tr>
                          <th className="px-6 py-4 font-bold">{type === 'ai' ? 'Tool' : 'Provider'}</th>
                          <th className="px-6 py-4 font-bold">{type === 'ai' ? 'Provider' : 'Service'}</th>
                          <th className="px-6 py-4 font-bold">Pricing</th>
                          <th className="px-6 py-4 font-bold">Score</th>
                          <th className="px-6 py-4 font-bold">Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(type === 'ai' ? data.tools : data.services)?.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-6 py-4 font-bold text-white">
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">{iconForRow(row)}</span>
                                <span>{providerForRow(row)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">{labelForRow(row)}</td>
                            <td className="px-6 py-4 text-[#f59e0b] font-mono">{type === 'ai' ? row.pricing : `$${row.price_per_hour}/hr`}</td>
                            <td className="px-6 py-4 font-bold">{type === 'ai' ? row.score : row.performance_score}</td>
                            <td className="px-6 py-4 text-xs">{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-red-400">
                <p>Failed to load comparison data.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
