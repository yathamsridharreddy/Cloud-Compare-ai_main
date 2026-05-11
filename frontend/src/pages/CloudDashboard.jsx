import { useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';

const cloudServices = [
  { provider: 'Alibaba ECS', pricing: '$0.031/hr', rating: 8.6, regions: ['Asia', 'EU'], icon: '☁️' },
  { provider: 'AWS EC2', pricing: '$0.046/hr', rating: 9.2, regions: ['US', 'EU', 'APAC'], icon: '☁️' },
  { provider: 'Azure VM', pricing: '$0.052/hr', rating: 9.0, regions: ['US', 'EU', 'Asia'], icon: '☁️' },
  { provider: 'GCP Compute', pricing: '$0.043/hr', rating: 9.0, regions: ['Global'], icon: '☁️' },
  { provider: 'OCI Compute', pricing: '$0.025/hr', rating: 8.5, regions: ['US', 'EU'], icon: '☁️' }
];

const cloudTrendData = [
  { name: 'Jan', aws: 0.046, azure: 0.052, gcp: 0.043, oci: 0.025 },
  { name: 'Feb', aws: 0.045, azure: 0.051, gcp: 0.042, oci: 0.024 },
  { name: 'Mar', aws: 0.047, azure: 0.053, gcp: 0.044, oci: 0.025 },
  { name: 'Apr', aws: 0.048, azure: 0.054, gcp: 0.045, oci: 0.026 },
  { name: 'May', aws: 0.046, azure: 0.052, gcp: 0.043, oci: 0.025 },
  { name: 'Jun', aws: 0.045, azure: 0.051, gcp: 0.042, oci: 0.024 },
  { name: 'Jul', aws: 0.044, azure: 0.050, gcp: 0.041, oci: 0.024 },
  { name: 'Aug', aws: 0.045, azure: 0.051, gcp: 0.042, oci: 0.025 },
  { name: 'Sep', aws: 0.046, azure: 0.052, gcp: 0.043, oci: 0.025 },
  { name: 'Oct', aws: 0.047, azure: 0.053, gcp: 0.044, oci: 0.026 },
  { name: 'Nov', aws: 0.048, azure: 0.054, gcp: 0.045, oci: 0.027 },
  { name: 'Dec', aws: 0.049, azure: 0.055, gcp: 0.046, oci: 0.028 }
];

const categories = ['AI/ML', 'Compute', 'Database', 'Kubernetes', 'Networking', 'Storage'];
const regions = ['US East', 'US West', 'EU West', 'Asia Pacific', 'Middle East'];
const countries = ['United States', 'Germany', 'India', 'Australia', 'UAE'];

const recentComparisons = [
  { title: 'AWS vs Azure', date: 'May 10, 2026', color: '#ff9900', icon: 'AWS' },
  { title: 'GCP vs OCI', date: 'May 09, 2026', color: '#4285f4', icon: 'GCP' },
  { title: 'AWS vs GCP', date: 'May 08, 2026', color: '#10b981', icon: 'AWS' },
  { title: 'AWS vs Alibaba', date: 'May 07, 2026', color: '#f97316', icon: 'ALI' }
];

export default function CloudDashboard() {
  const [activeSection, setActiveSection] = useState('popular-services');
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Compute');
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const filteredServices = useMemo(() => {
    return cloudServices.filter((service) => {
      const matchesRegion = service.regions.includes('Global') || service.regions.some((region) => selectedRegion.includes(region.split(' ')[0]) || region.includes(selectedRegion.split(' ')[0]));
      return matchesRegion;
    });
  }, [selectedRegion]);

  const toggleServiceSelection = (service) => {
    const alreadySelected = selectedServices.some((item) => item.provider === service.provider);
    if (alreadySelected) {
      setSelectedServices(selectedServices.filter((item) => item.provider !== service.provider));
    } else if (selectedServices.length < 5) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const formatCost = (value) => `$${value.toFixed(3)}`;

  const renderSection = () => {
    switch (activeSection) {
      case 'popular-services':
        return (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Popular Services</h2>
                <p className="text-gray-400 text-sm">Compare pricing, ratings, and region coverage across the biggest cloud providers.</p>
              </div>
              <button onClick={() => setActiveSection('categories-regions')} className="px-4 py-2 rounded-xl bg-neon-blue/10 text-neon-blue text-sm font-semibold transition hover:bg-neon-blue/15">
                Explore Categories
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
              {cloudServices.map((service) => {
                const isSelected = selectedServices.some((item) => item.provider === service.provider);
                return (
                  <div key={service.provider} onClick={() => toggleServiceSelection(service)} className={`glass-panel p-5 rounded-3xl border transition duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-neon-blue shadow-[0_0_25px_rgba(56,189,248,0.25)] bg-neon-blue/5' : 'hover:border-neon-blue/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Cloud Service</p>
                        <h3 className="text-xl font-semibold text-white mt-2">{service.provider}</h3>
                      </div>
                      <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${isSelected ? 'bg-neon-blue border-neon-blue text-white' : 'border-gray-700 text-gray-500'}`}>
                        {isSelected ? '✓' : '+'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-4">{service.pricing}</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.regions.map((region) => (
                        <span key={region} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{region}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span className="font-semibold text-white">{service.rating}</span>
                      <span className="text-[#fbbf24]">{'★'.repeat(Math.round(service.rating))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case 'categories-regions':
        return (
          <section className="animate-fade-in-up">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">Categories & Regions</h2>
                <p className="text-gray-400 text-sm">Use filters to narrow down cloud providers by category, region, and country.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="input-dark rounded-2xl px-4 py-3 text-sm bg-[#09090d] border border-white/10">
                  {regions.map((region) => <option key={region} value={region}>{region}</option>)}
                </select>
                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="input-dark rounded-2xl px-4 py-3 text-sm bg-[#09090d] border border-white/10">
                  {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`text-sm px-4 py-2 rounded-full transition ${selectedCategory === category ? 'bg-neon-blue/15 text-white border border-neon-blue' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                  {category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div key={service.provider} className="glass-panel p-5 rounded-3xl border border-white/10 bg-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{service.provider}</h3>
                    <span className="text-xs text-gray-400">{service.pricing}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">Regions: {service.regions.join(', ')}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 rounded-full bg-white/5">Category: {selectedCategory}</span>
                    <span className="px-2 py-1 rounded-full bg-white/5">Country: {selectedCountry}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'cloud-pricing-trend':
        return (
          <section className="animate-fade-in-up">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white">Cloud Pricing Trend</h2>
              <p className="text-gray-400 text-sm">Animated 2026 pricing trend for the major cloud providers.</p>
            </div>
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <div className="flex flex-wrap justify-between gap-4 mb-5">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Year</p>
                  <p className="text-white font-semibold">2026</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ff9900]"></span>AWS</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00a4ef]"></span>Azure</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4285f4]"></span>GCP</div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f80000]"></span>OCI</div>
                </div>
              </div>
              <div className="min-h-[350px]">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={cloudTrendData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(3)}`} axisLine={false} tickLine={false} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: '#0e0e16', border: '1px solid #2a2a3a', borderRadius: '12px' }} formatter={(value) => [`${formatCost(value)}`, 'Price']} />
                    <Line type="monotone" dataKey="aws" stroke="#ff9900" strokeWidth={3} dot={{ r: 4, fill: '#ff9900' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="azure" stroke="#00a4ef" strokeWidth={3} dot={{ r: 4, fill: '#00a4ef' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="gcp" stroke="#4285f4" strokeWidth={3} dot={{ r: 4, fill: '#4285f4' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="oci" stroke="#f80000" strokeWidth={3} dot={{ r: 4, fill: '#f80000' }} activeDot={{ r: 6 }} />
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
                <p className="text-gray-400 text-sm">Latest cloud comparison reports with provider icons and dates.</p>
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
                  <button className="px-4 py-2 rounded-xl bg-neon-blue text-white text-sm transition hover:bg-neon-blue/90">View Report</button>
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return (
          <section className="animate-fade-in-up">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {['popular-services', 'categories-regions', 'cloud-pricing-trend', 'recent-comparisons'].map((section) => (
                <button key={section} onClick={() => setActiveSection(section)} className="glass-panel p-6 rounded-3xl border border-white/10 text-left hover:border-neon-blue/40 transition">
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
    <DashboardLayout context="cloud" activeSection={activeSection} onSectionChange={setActiveSection}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cloud Compare Dashboard</h1>
          <p className="text-gray-400 text-sm">Use the sidebar to navigate the cloud dashboard sections without reloading.</p>
        </div>
        {renderSection()}
      </div>

      <FloatingCompareDock selectedItems={selectedServices} onRemove={(service) => toggleServiceSelection(service)} onCompare={() => setShowCompareModal(true)} type="cloud" />
      <ComparisonModal isOpen={showCompareModal} onClose={() => setShowCompareModal(false)} type="cloud" selectedItems={selectedServices} />
      <Chatbot type="cloud" />
    </DashboardLayout>
  );
}
