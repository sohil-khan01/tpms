import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";

const Sidebar = ({ darkMode, adminUser, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    // { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { id: 'upload', icon: '📤', label: 'Upload Resume', path: '/upload' },
    // { id: 'jd-matcher', icon: '🎯', label: 'JD Matcher', path: '/jd-matcher' },
    // { id: 'candidates', icon: '👥', label: 'All Candidates', path: '/candidates' },
    // { id: 'messaging', icon: '💬', label: 'Messaging', path: '/messaging' },
    // { id: 'customizer', icon: '✨', label: 'Resume Customizer', path: '/customizer', premium: true },
    // { id: 'analytics', icon: '📈', label: 'Analytics', path: '/analytics' },
    // { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  const handleUserClick = () => {
    if (isCollapsed) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate('/profile');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'} h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col relative`}>
      <div className={`p-6 flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-slate-700'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold">TalentPool AI</h1>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-2xl hover:bg-slate-800 p-2 rounded"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-4 p-3 rounded-lg mb-2 transition-colors relative ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            {!isCollapsed && (
              <span className="font-medium flex-1 text-left">{item.label}</span>
            )}
            {!isCollapsed && item.premium && (
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                PRO
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-700'} relative`}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleUserClick}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors flex-1"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).join('') : '👤'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="font-medium">{adminUser?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-400">{adminUser?.email || 'admin@company.com'}</p>
              </div>
            )}
          </button>
          
          {!isCollapsed && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => navigate('/profile')}
                className="text-xs text-slate-400 hover:text-white transition-colors p-1"
                title="View Profile"
              >
                👤
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors p-1"
                title="Logout"
              >
                <CiLogout />
              </button>
            </div>
          )}
        </div>

        {/* Collapsed User Menu */}
        {isCollapsed && showUserMenu && (
          <div className="absolute bottom-full left-full mb-2 ml-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 min-w-48 z-50">
            <div className="px-4 py-2 border-b border-slate-700">
              <p className="font-medium text-white">{adminUser?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400">{adminUser?.email || 'admin@company.com'}</p>
            </div>
            <button
              onClick={() => {
                navigate('/profile');
                setShowUserMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>👤</span>
              View Profile
            </button>
            <button
              onClick={() => {
                onLogout();
                setShowUserMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors flex items-center gap-2"
            >
              <span><CiLogout /></span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Backdrop for collapsed menu */}
      {isCollapsed && showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;