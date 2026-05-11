import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { api } from '../utils/api';

/* ── Palette ─────────────────────────────────────────────── */
const COLORS = ['#a855f7', '#38bdf8', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

/* ── Skeleton loader ─────────────────────────────────────── */
function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

/* ── Analytics card wrapper ──────────────────────────────── */
function AnalyticsCard({ icon, title, children, accent = '#a855f7' }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: `0 0 30px ${accent}22` }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-5 overflow-hidden"
      style={{ boxShadow: `0 0 0 1px ${accent}18` }}
    >
      {/* Glow corner */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: accent }} />
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Insight card ────────────────────────────────────────── */
function InsightCard({ text, accent = '#a855f7' }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
      <span className="text-base mt-0.5" style={{ color: accent }}>💡</span>
      <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}

/* ── Custom tooltip ──────────────────────────────────────── */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#a855f7' }}>
          {p.name}: <span className="font-bold">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ── Derive chart data from backend response ─────────────── */
function deriveAIChartData(tools = [], selectedItems = []) {
  return tools.map((t, i) => {
    const meta = selectedItems.find(s => s.name === t.tool_name) || {};
    const priceStr = meta.pricing || t.pricing || '$0';
    const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || (i + 1) * 8;
    const score = parseFloat(t.score) || (meta.rating ? meta.rating * 10 : 70 + i * 5);
    const popularity = meta.rating ? meta.rating * 10 : 75 + i * 3;
    const valueScore = score / Math.max(priceNum, 1);
    return {
      name: t.tool_name || t.name || `Tool ${i + 1}`,
      provider: t.provider || meta.provider || '—',
      pricing: t.pricing || meta.pricing || '—',
      description: t.description || '—',
      bestUse: t.best_use || meta.tags?.join(', ') || '—',
      cost: priceNum,
      performance: score,
      ranking: score,
      popularity,
      value: parseFloat(valueScore.toFixed(2)),
      platform: t.provider || meta.provider || 'Unknown',
    };
  });
}

function deriveCloudChartData(services = [], selectedItems = []) {
  return services.map((s, i) => {
    const meta = selectedItems.find(m => m.provider?.includes(s.platform || '') || m.provider === s.provider) || {};
    const priceNum = parseFloat(s.price_per_hour || s.cost || meta.pricing?.replace(/[^0-9.]/g, '') || (i + 1) * 0.03);
    const perf = parseFloat(s.performance_score || meta.rating || 8 + i * 0.2);
    return {
      name: s.platform || s.provider || `Service ${i + 1}`,
      provider: s.provider || s.platform || '—',
      pricing: s.price_per_hour ? `$${s.price_per_hour}/hr` : meta.pricing || '—',
      description: s.description || '—',
      bestUse: s.best_use || meta.regions?.join(', ') || '—',
      cost: parseFloat((priceNum * 730).toFixed(2)),
      performance: parseFloat((perf * 10).toFixed(1)),
      ranking: parseFloat((perf * 9.8).toFixed(1)),
      popularity: parseFloat((perf * 9.5).toFixed(1)),
      value: parseFloat((perf / Math.max(priceNum, 0.001)).toFixed(2)),
      platform: s.platform || s.provider || 'Unknown',
    };
  });
}

function generateInsights(chartData, type) {
  if (!chartData.length) return [];
  const sorted = [...chartData];
  const cheapest = [...sorted].sort((a, b) => a.cost - b.cost)[0];
  const fastest  = [...sorted].sort((a, b) => b.performance - a.performance)[0];
  const bestVal  = [...sorted].sort((a, b) => b.value - a.value)[0];
  const mostPop  = [...sorted].sort((a, b) => b.popularity - a.popularity)[0];
  return [
    `${cheapest.name} offers the lowest cost${type === 'cloud' ? ' at $' + cheapest.cost + '/mo' : ' at ' + cheapest.pricing + '.'}.`,
    `${fastest.name} leads in performance with a score of ${fastest.performance}.`,
    `${bestVal.name} delivers the best value (cost-to-performance ratio).`,
    `${mostPop.name} has the highest popularity score among the compared ${type === 'ai' ? 'tools' : 'services'}.`,
  ];
}

/* ═══════════════════════════════════════════════════════════
   MAIN MODAL
══════════════════════════════════════════════════════════════ */
export default function ComparisonModal({ isOpen, onClose, type, selectedItems }) {
  const [loading, setLoading]   = useState(true);
  const [data, setData]         = useState(null);
  const [chartData, setChartData] = useState([]);

  const accent  = type === 'ai' ? '#a855f7' : '#38bdf8';
  const accent2 = type === 'ai' ? '#38bdf8' : '#a855f7';

  useEffect(() => {
    if (isOpen && selectedItems.length > 0) fetchComparison();
  }, [isOpen, selectedItems]);

  const fetchComparison = async () => {
    setLoading(true);
    setData(null);
    try {
      if (type === 'ai') {
        const res = await api.aiCompare({ purpose: 'General Analysis', selected_tools: selectedItems.map(i => i.name) });
        if (res.success) {
          setData(res.data);
          setChartData(deriveAIChartData(res.data.tools || [], selectedItems));
        }
      } else {
        const res = await api.cloudCompare({ category: 'Compute', selected_services: selectedItems.map(i => i.provider), hours: 730 });
        if (res.success) {
          setData(res.data);
          setChartData(deriveCloudChartData(res.data.services || [], selectedItems));
        }
      }
    } catch (e) {
      console.error('Comparison error:', e);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const insights = generateInsights(chartData, type);
  const platformDist = chartData.map(d => ({ name: d.name, value: d.popularity }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Panel */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className="relative w-full max-w-7xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#08080f 0%,#0d0d1a 100%)',
            border: `1px solid ${accent}28`,
            boxShadow: `0 0 80px ${accent}18, 0 40px 80px #00000090`,
          }}
        >
          {/* ── Gradient header ── */}
          <div className="relative shrink-0 px-6 py-5 border-b border-white/5"
            style={{ background: `linear-gradient(135deg, ${accent}12 0%, transparent 60%)` }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{type === 'ai' ? '🤖' : '☁️'}</span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {type === 'ai' ? 'AI Tools Comparison Report' : 'Cloud Services Comparison Report'}
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  AI-generated analysis based on real-time comparison data • Comparing <span className="font-semibold" style={{ color: accent }}>{selectedItems.length} {type === 'ai' ? 'tools' : 'services'}</span>
                </p>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all text-sm shrink-0">✕</button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? <SkeletonDashboard /> : data ? (
              <div className="p-5 space-y-6">

                {/* ── Recommendation banner ── */}
                {(data.tools?.[0] || data.services?.[0]) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4 p-4 rounded-2xl border"
                    style={{ background: `${accent}10`, borderColor: `${accent}30` }}
                  >
                    <span className="text-3xl shrink-0">🏆</span>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">AI Recommendation</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {type === 'ai'
                          ? (data.tools[0]?.description || 'Based on analysis, the top-ranked tool stands out across all dimensions.')
                          : (data.recommendation?.reason || 'Based on your requirements, the top service delivers the best balance of cost and performance.')}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Chart grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {/* 1. Cost Comparison */}
                  <AnalyticsCard icon="💰" title={type === 'ai' ? 'Cost ($/mo)' : 'Est. Monthly Cost ($)'} accent={accent}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip formatter={v => `$${v}`} />} />
                        <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>

                  {/* 2. Performance Score */}
                  <AnalyticsCard icon="⚡" title="Performance Score" accent={accent2}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="performance" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>

                  {/* 3. Ranking Score */}
                  <AnalyticsCard icon="🏅" title="Ranking Score" accent="#10b981">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="ranking" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>

                  {/* 4. Platform Distribution Donut */}
                  <AnalyticsCard icon="🍩" title="Popularity Distribution" accent="#f59e0b">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={platformDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          dataKey="value" nameKey="name" paddingAngle={3}>
                          {platformDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip formatter={v => `${v} pts`} />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>

                  {/* 5. Value Score */}
                  <AnalyticsCard icon="💎" title="Value: Cost vs Performance" accent="#ec4899">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>

                  {/* 6. Popularity by Platform */}
                  <AnalyticsCard icon="📊" title="Popularity by Tool" accent="#38bdf8">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="popularity" radius={[0, 6, 6, 0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </AnalyticsCard>
                </div>

                {/* ── AI Insights ── */}
                {insights.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🧠</span>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">AI Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {insights.map((insight, i) => (
                        <InsightCard key={i} text={insight} accent={COLORS[i % COLORS.length]} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Comparison Summary Table ── */}
                <div className="rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2"
                    style={{ background: `${accent}08` }}>
                    <span className="text-base">📋</span>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Comparison Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="text-[11px] uppercase bg-white/5 text-gray-400">
                        <tr>
                          <th className="px-5 py-3 font-bold">{type === 'ai' ? 'Tool' : 'Provider'}</th>
                          <th className="px-5 py-3 font-bold">Provider</th>
                          <th className="px-5 py-3 font-bold">Pricing</th>
                          <th className="px-5 py-3 font-bold">Performance</th>
                          <th className="px-5 py-3 font-bold">Best Use</th>
                          <th className="px-5 py-3 font-bold">Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3 font-bold text-white">{row.name}</td>
                            <td className="px-5 py-3 text-gray-300">{row.provider}</td>
                            <td className="px-5 py-3 font-mono text-amber-400">{row.pricing}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                                  <div className="h-1.5 rounded-full" style={{ width: `${Math.min(row.performance, 100)}%`, background: COLORS[idx % COLORS.length] }} />
                                </div>
                                <span className="text-xs font-bold text-white">{row.performance}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-xs">{row.bestUse}</td>
                            <td className="px-5 py-3 text-xs text-gray-500 max-w-[200px] truncate">{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-red-400 space-y-2">
                <span className="text-3xl">⚠️</span>
                <p className="text-sm">Failed to load comparison data. Please try again.</p>
                <button onClick={fetchComparison} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">Retry</button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
