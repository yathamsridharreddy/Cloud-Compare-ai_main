import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Chatbot from '../components/Chatbot';
import FloatingCompareDock from '../components/FloatingCompareDock';
import ComparisonModal from '../components/ComparisonModal';
import { api } from '../utils/api';

const fallbackCloudServices = [
  { provider: 'AWS', service: 'EC2', category: 'Compute', pricing: '$0.046/hr', performance: 9.2, popularity: 98, regions: 32, regionTags: ['US', 'EU', 'APAC'], logo: 'AWS', providerColor: '#ff9900', icon: '🖥️', desc: 'Elastic Compute Cloud virtual machines with broad instance families and mature autoscaling.' },
  { provider: 'Azure', service: 'Virtual Machines', category: 'Compute', pricing: '$0.052/hr', performance: 8.9, popularity: 95, regions: 60, regionTags: ['US', 'EU', 'Asia'], logo: 'AZ', providerColor: '#0078d4', icon: '🖥️', desc: 'Enterprise VMs with strong Windows, Active Directory, and hybrid cloud integration.' },
  { provider: 'GCP', service: 'Compute Engine', category: 'Compute', pricing: '$0.043/hr', performance: 9.0, popularity: 88, regions: 40, regionTags: ['Global'], logo: 'GCP', providerColor: '#4285f4', icon: '🖥️', desc: 'Flexible Google Cloud VMs with custom machine types and strong sustained-use pricing.' },
  { provider: 'OCI', service: 'Compute', category: 'Compute', pricing: '$0.025/hr', performance: 9.4, popularity: 72, regions: 48, regionTags: ['US', 'EU', 'Asia'], logo: 'OCI', providerColor: '#f80000', icon: '🖥️', desc: 'High-performance virtual machines and bare metal instances with aggressive pricing.' },
  { provider: 'Alibaba', service: 'ECS', category: 'Compute', pricing: '$0.031/hr', performance: 8.5, popularity: 76, regions: 28, regionTags: ['Asia', 'EU'], logo: 'ALI', providerColor: '#ff6a00', icon: '🖥️', desc: 'Elastic Compute Service for Asia-Pacific workloads, especially China and Southeast Asia.' },
  { provider: 'AWS', service: 'Lambda', category: 'Serverless', pricing: '$0.20/1M req', performance: 9.2, popularity: 97, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '⚡', desc: 'Event-driven functions with deep AWS integrations and broad runtime support.' },
  { provider: 'AWS', service: 'S3', category: 'Storage', pricing: '$0.023/GB', performance: 9.5, popularity: 99, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '🗄️', desc: 'The reference object storage service with extreme durability and ecosystem support.' },
  { provider: 'Azure', service: 'Blob Storage', category: 'Storage', pricing: '$0.018/GB', performance: 9.0, popularity: 92, regions: 60, regionTags: ['Global'], logo: 'AZ', providerColor: '#0078d4', icon: '🗄️', desc: 'Scalable object storage with hot, cool, archive, and geo-redundant tiers.' },
  { provider: 'GCP', service: 'Cloud Storage', category: 'Storage', pricing: '$0.020/GB', performance: 9.2, popularity: 87, regions: 40, regionTags: ['Global'], logo: 'GCP', providerColor: '#4285f4', icon: '🗄️', desc: 'Strongly consistent object storage with multi-region and analytics-friendly options.' },
  { provider: 'AWS', service: 'RDS', category: 'Database', pricing: '$0.017/hr', performance: 9.1, popularity: 96, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '🛢️', desc: 'Managed relational databases for PostgreSQL, MySQL, MariaDB, Oracle, and SQL Server.' },
  { provider: 'AWS', service: 'EKS', category: 'Kubernetes', pricing: '$0.10/hr', performance: 9.1, popularity: 95, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '☸️', desc: 'Managed Kubernetes with deep AWS networking, IAM, and autoscaling integration.' },
  { provider: 'GCP', service: 'GKE', category: 'Kubernetes', pricing: '$0.10/hr', performance: 9.6, popularity: 91, regions: 40, regionTags: ['Global'], logo: 'GCP', providerColor: '#4285f4', icon: '☸️', desc: 'Highly mature managed Kubernetes from the original Kubernetes creators.' },
  { provider: 'AWS', service: 'VPC', category: 'Networking', pricing: 'Usage based', performance: 9.0, popularity: 98, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '🌐', desc: 'Foundational virtual networking for subnets, routing, gateways, and private access.' },
  { provider: 'AWS', service: 'SageMaker', category: 'AI/ML', pricing: '$0.065/hr', performance: 9.3, popularity: 94, regions: 32, regionTags: ['Global'], logo: 'AWS', providerColor: '#ff9900', icon: '🧠', desc: 'End-to-end ML platform for training, deployment, MLOps, and model monitoring.' },
  { provider: 'GCP', service: 'Vertex AI', category: 'AI/ML', pricing: 'Usage based', performance: 9.4, popularity: 89, regions: 40, regionTags: ['Global'], logo: 'GCP', providerColor: '#4285f4', icon: '🧠', desc: "Google's unified ML and generative AI platform with strong model operations." },
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

const categories = ['AI/ML', 'Compute', 'Database', 'Kubernetes', 'Networking', 'Serverless', 'Storage'];
const regions = ['US East', 'US West', 'EU West', 'Asia Pacific', 'Middle East'];
const countries = ['United States', 'Germany', 'India', 'Australia', 'UAE'];

const recentComparisons = [
  { title: 'AWS vs Azure', date: 'May 10, 2026', color: '#ff9900', icon: 'AWS' },
  { title: 'GCP vs OCI', date: 'May 09, 2026', color: '#4285f4', icon: 'GCP' },
  { title: 'AWS vs GCP', date: 'May 08, 2026', color: '#10b981', icon: 'AWS' },
  { title: 'AWS vs Alibaba', date: 'May 07, 2026', color: '#f97316', icon: 'ALI' }
];

function ServiceIcon({ service, size = 'md' }) {
  const dimensions = size === 'lg' ? 'w-14 h-14 rounded-3xl' : 'w-12 h-12 rounded-2xl';
  return (
    <div className={`${dimensions} border border-white/10 bg-white/5 flex items-center justify-center shrink-0 relative overflow-hidden`}>
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: service.providerColor || service.color || '#38bdf8' }}></span>
      <span className="text-xl leading-none">{service.icon || service.categoryIcon || '☁️'}</span>
    </div>
  );
}

export default function CloudDashboard() {
  const [activeSection, setActiveSection] = useState('popular-services');
  const [cloudServices, setCloudServices] = useState(fallbackCloudServices);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Compute');
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.cloudPopular().then((res) => {
      if (mounted && res.success && Array.isArray(res.data)) {
        setCloudServices(res.data);
      }
    }).catch(() => {
      setCloudServices(fallbackCloudServices);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return cloudServices.filter((service) => {
      const regionTags = service.regionTags || service.regions || [];
      const matchesRegion = Array.isArray(regionTags)
        ? regionTags.includes('Global') || regionTags.some((region) => selectedRegion.includes(region.split(' ')[0]) || region.includes(selectedRegion.split(' ')[0]))
        : true;
      return matchesRegion && service.category === selectedCategory;
    });
  }, [cloudServices, selectedCategory, selectedRegion]);

  const toggleServiceSelection = (service) => {
    const alreadySelected = selectedServices.some((item) => `${item.provider}-${item.service}` === `${service.provider}-${service.service}`);
    if (alreadySelected) {
      setSelectedServices(selectedServices.filter((item) => `${item.provider}-${item.service}` !== `${service.provider}-${service.service}`));
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
                const isSelected = selectedServices.some((item) => `${item.provider}-${item.service}` === `${service.provider}-${service.service}`);
                return (
                  <div key={`${service.provider}-${service.service}`} onClick={() => toggleServiceSelection(service)} className={`glass-panel p-5 rounded-3xl border transition duration-300 cursor-pointer overflow-hidden ${isSelected ? 'border-neon-blue shadow-[0_0_25px_rgba(56,189,248,0.25)] bg-neon-blue/5' : 'hover:border-neon-blue/40'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <ServiceIcon service={service} />
                        <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Cloud Service</p>
                        <h3 className="text-xl font-semibold text-white mt-2">{service.service}</h3>
                        <p className="text-sm font-semibold" style={{ color: service.providerColor || '#38bdf8' }}>{service.provider}</p>
                        </div>
                      </div>
                      <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center ${isSelected ? 'bg-neon-blue border-neon-blue text-white' : 'border-gray-700 text-gray-500'}`}>
                        {isSelected ? '✓' : '+'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-3">{service.pricing}</div>
                    <p className="text-xs text-gray-400 leading-5 mb-4">{service.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(service.regionTags || []).map((region) => (
                        <span key={region} className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{region}</span>
                      ))}
                      <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[11px]">{service.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span className="font-semibold text-white">{service.performance}</span>
                      <span className="text-[#fbbf24]">{'★'.repeat(Math.min(5, Math.round((service.performance || 0) / 2)))}</span>
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
                <div key={`${service.provider}-${service.service}`} className="glass-panel p-5 rounded-3xl border border-white/10 bg-white/5">
                  <div className="flex justify-between items-center mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <ServiceIcon service={service} />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{service.service}</h3>
                        <p className="text-xs" style={{ color: service.providerColor || '#38bdf8' }}>{service.provider}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{service.pricing}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">{service.desc}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 rounded-full bg-white/5">Category: {selectedCategory}</span>
                    <span className="px-2 py-1 rounded-full bg-white/5">Country: {selectedCountry}</span>
                    <span className="px-2 py-1 rounded-full bg-white/5">{service.regions} regions</span>
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
