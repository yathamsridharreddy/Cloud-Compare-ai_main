import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ context = 'ai', activeSection, onSectionSelect }) {
  const location = useLocation();
  const isCloud = context === 'cloud' || location.pathname.includes('cloud');
  const userName = localStorage.getItem('userName') || 'User';
  const plan = "Pro Plan"; // Keep hardcoded for now or fetch if available

  const handleSectionSelect = (sectionKey) => {
    if (typeof onSectionSelect === 'function') {
      onSectionSelect(sectionKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/login.html';
  };

  const getSectionClass = (sectionKey) => {
    if (activeSection === sectionKey) {
      return `sidebar-link ${isCloud ? 'active' : 'active-purple'}`;
    }
    return 'sidebar-link';
  };

  return (
    <div className="w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-dark-900/80 backdrop-blur-xl flex flex-col z-40 hidden lg:flex">
      
      {/* Logo */}
      <Link to="/dashboard" className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
        <div className="w-8 h-8 rounded bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,112,243,0.3)]">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
        </div>
        <span className="font-bold text-lg tracking-tight">CloudCompare <span className="text-neon-purple text-xs ml-0.5">AI</span></span>
      </Link>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 no-scrollbar">
        
        {/* MAIN */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Main</div>
          <div className="space-y-1">
            <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard
            </Link>
            {!isCloud && (
              <Link to="/ai-tools" className={`sidebar-link ${location.pathname !== '/dashboard' ? 'active-purple' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                AI Tools Compare
              </Link>
            )}
            {isCloud && (
              <Link to="/cloud-compare" className={`sidebar-link active`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                Cloud Compare
              </Link>
            )}
          </div>
        </div>

        {/* CONTEXT SPECIFIC */}
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{isCloud ? 'Cloud' : 'AI Tools'}</div>
          <div className="space-y-1">
            <button type="button" onClick={() => handleSectionSelect(isCloud ? 'popular-services' : 'popular-tools')} className={getSectionClass(isCloud ? 'popular-services' : 'popular-tools')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Popular {isCloud ? 'Services' : 'Tools'}
            </button>
            <button type="button" onClick={() => handleSectionSelect(isCloud ? 'categories-regions' : 'categories')} className={getSectionClass(isCloud ? 'categories-regions' : 'categories')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              Categories {isCloud ? '& Regions' : ''}
            </button>
            <button type="button" onClick={() => handleSectionSelect(isCloud ? 'cloud-pricing-trend' : 'ai-trend-analysis')} className={getSectionClass(isCloud ? 'cloud-pricing-trend' : 'ai-trend-analysis')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              {isCloud ? 'Cloud Pricing Trend' : 'AI Trend Analysis'}
            </button>
            <button type="button" onClick={() => handleSectionSelect('recent-comparisons')} className={getSectionClass('recent-comparisons')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Recent Comparisons
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div>
          <div className="space-y-1">
            <a href="#" className="sidebar-link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
              Favorites
            </a>
            <a href="#" className="sidebar-link mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Settings
            </a>
          </div>
        </div>

      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`} alt={userName} className="w-9 h-9 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{plan}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Logout
        </button>
      </div>
    </div>
  );
}
