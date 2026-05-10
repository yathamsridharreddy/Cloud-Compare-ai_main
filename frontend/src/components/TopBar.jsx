import { Link } from 'react-router-dom';

export default function TopBar() {
  const userName = localStorage.getItem('userName') || 'User';
  
  return (
    <div className="h-16 border-b border-white/5 bg-dark-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Left: Branding (only visible on mobile or when sidebar is hidden) */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center">
          <span className="text-white text-xs">☁️</span>
        </div>
        <span className="font-bold">CloudCompare</span>
      </div>

      {/* Middle: Search (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-auto pl-12">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search AI tools, categories..." 
            className="block w-full pl-10 pr-16 py-2 border border-white/5 rounded-full bg-dark-800 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-500 bg-dark-900 px-1.5 py-0.5 rounded border border-gray-700">Ctrl K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 ml-auto">
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        </button>
        <button className="text-gray-400 hover:text-white transition-colors relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-neon-purple rounded-full"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[2px] cursor-pointer">
          <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center overflow-hidden">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`} alt={userName} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
