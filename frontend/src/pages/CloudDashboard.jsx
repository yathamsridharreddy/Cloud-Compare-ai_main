import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';
import { api } from '../utils/api';

const trendData = [
  { name: 'Jan', aws: 0.040, azure: 0.045, gcp: 0.038, oci: 0.020, alibaba: 0.028 },
  { name: 'Feb', aws: 0.042, azure: 0.046, gcp: 0.039, oci: 0.021, alibaba: 0.029 },
  { name: 'Mar', aws: 0.043, azure: 0.048, gcp: 0.040, oci: 0.022, alibaba: 0.030 },
  { name: 'Apr', aws: 0.045, azure: 0.050, gcp: 0.042, oci: 0.023, alibaba: 0.031 },
  { name: 'May', aws: 0.046, azure: 0.052, gcp: 0.043, oci: 0.025, alibaba: 0.031 }
];

export default function CloudDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await api.cloudPopular();
      if (res.success) setServices(res.data);
    } catch (error) {
      console.error("Failed to fetch cloud services:", error);
    }
    setLoading(false);
  };

  const handleScroll = (id) => {
    setActiveTab(id);
    const target = document.getElementById(`${id}-section`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleServiceSelection = (service) => {
    if (selectedServices.find(s => s.provider === service.provider && s.service === service.service)) {
      setSelectedServices(selectedServices.filter(s => !(s.provider === service.provider && s.service === service.service)));
    } else {
      if (selectedServices.length < 5) {
        setSelectedServices([...selectedServices, service]);
      } else {
        alert("You can only compare up to 5 services at once.");
      }
    }
  };

  const handleCompare = () => {
    setShowCompareModal(true);
  };

  const formatCost = (value) => `$${value.toFixed(3)}`;

  return (
    <DashboardLayout context="cloud">
      <div className="max-w-7xl mx-auto space-y-8" id="overview-section">
        
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cloud Compare</h1>
          <p className="text-gray-400 text-sm mb-6">Compare cloud providers, services, pricing, performance & regions.</p>
        </div>

        {/* Popular Cloud Services */}
        <section id="popular-section" className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Popular Cloud Services</h2>
            <button className="text-xs text-neon-blue hover:text-white font-medium">View All</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
              // Loading Skeletons
              [...Array(5)].map((_, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl flex flex-col items-center text-center animate-pulse">
                  <div className="w-16 h-12 bg-white/5 rounded mb-3"></div>
                  <div className="h-4 w-20 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 w-16 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-white/5 rounded mb-2"></div>
                  <div className="h-3 w-12 bg-white/5 rounded"></div>
                </div>
              ))
            ) : (
              services.slice(0, 5).map((service, index) => {
                const isSelected = selectedServices.some(s => s.provider === service.provider && s.service === service.service);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleServiceSelection(service)}
                    className={`glass-panel p-4 rounded-xl transition-all duration-300 cursor-pointer group flex flex-col items-center text-center relative overflow-hidden ${isSelected ? 'border-neon-blue shadow-[0_0_15px_rgba(56,189,248,0.3)] bg-neon-blue/5' : 'hover:border-neon-blue/50'}`}
                  >
                    <div className="absolute top-2 left-2 z-20">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-neon-blue border-neon-blue text-white' : 'border-gray-500 text-transparent group-hover:border-neon-blue'}`}>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-16 h-12 flex items-center justify-center mb-3 relative z-10 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                      <span className="text-3xl">{service.logo || '☁️'}</span>
                    </div>
                    <h3 className="text-white font-bold text-sm relative z-10">{service.provider}</h3>
                    <p className="text-gray-500 text-xs mb-2 relative z-10">{service.service}</p>
                    <div className="text-xs text-gray-400 font-mono mb-2 bg-dark-900/50 px-2 py-0.5 rounded border border-gray-800">{service.pricing}</div>
                    <div className="text-xs font-semibold text-[#f59e0b] relative z-10">★ {service.performance} <span className="text-gray-500 font-normal ml-1">🔥{service.popularity}</span></div>
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
            <h3 className="text-base font-bold text-white mb-4">Top Categories</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center py-2 px-3 bg-neon-blue/10 rounded-lg text-sm text-neon-blue font-medium cursor-pointer">
                <span>Compute</span>
                <span>28</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 text-sm text-gray-400 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <span>Storage</span>
                <span>24</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 text-sm text-gray-400 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <span>Database</span>
                <span>18</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 text-sm text-gray-400 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <span>Networking</span>
                <span>20</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 text-sm text-gray-400 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                <span>AI / ML</span>
                <span>16</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">View All Categories</button>
          </div>

          {/* Col 2: Trend Graph */}
          <div id="analysis-section" className="lg:col-span-6 glass-panel rounded-xl p-5 h-full flex flex-col pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">Cloud Pricing Trend (2026)</h3>
              <select className="bg-dark-900 border border-gray-700 text-xs rounded px-2 py-1 outline-none">
                <option>2026</option>
              </select>
            </div>
            
            <div className="flex gap-4 mb-4 text-xs font-medium">
              <div className="flex items-center gap-1 text-[#ff9900]"><span className="w-2 h-2 bg-[#ff9900] rounded-full"></span> AWS</div>
              <div className="flex items-center gap-1 text-[#00a4ef]"><span className="w-2 h-2 bg-[#00a4ef] rounded-full"></span> Azure</div>
              <div className="flex items-center gap-1 text-[#4285f4]"><span className="w-2 h-2 bg-[#4285f4] rounded-full"></span> GCP</div>
              <div className="flex items-center gap-1 text-[#f80000]"><span className="w-2 h-2 bg-[#f80000] rounded-full"></span> OCI</div>
            </div>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={formatCost} axisLine={false} tickLine={false} width={60} />
                  <Tooltip 
                    formatter={(value) => [formatCost(value)]}
                    contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="aws" stroke="#ff9900" strokeWidth={3} dot={{ fill: '#ff9900', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="azure" stroke="#00a4ef" strokeWidth={3} dot={{ fill: '#00a4ef', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gcp" stroke="#4285f4" strokeWidth={3} dot={{ fill: '#4285f4', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="oci" stroke="#f80000" strokeWidth={3} dot={{ fill: '#f80000', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Col 3: Recent Comparisons */}
          <div id="recent-section" className="lg:col-span-3 glass-panel rounded-xl p-5 h-full pt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Recent Comparisons</h3>
              <button className="text-xs text-neon-blue hover:text-white font-medium">View All</button>
            </div>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-[#ff9900]/20 rounded-lg flex items-center justify-center shrink-0 text-[#ff9900] text-xs font-bold">AWS</div>
                <div>
                  <h4 className="text-sm font-bold text-white">AWS vs Azure</h4>
                  <p className="text-[10px] text-gray-500">May 10, 2026 • 10:30 AM</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors">
                <div className="w-10 h-10 bg-[#4285f4]/20 rounded-lg flex items-center justify-center shrink-0 text-[#4285f4] text-xs font-bold">GCP</div>
                <div>
                  <h4 className="text-sm font-bold text-white">GCP vs OCI</h4>
                  <p className="text-[10px] text-gray-500">May 09, 2026 • 08:45 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <FloatingCompareDock 
        selectedItems={selectedServices} 
        onRemove={toggleServiceSelection} 
        onCompare={handleCompare} 
        type="cloud" 
      />

      <ComparisonModal 
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        type="cloud"
        selectedItems={selectedServices}
      />

      <Chatbot type="cloud" />
    </DashboardLayout>
  );
}
