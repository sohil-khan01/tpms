import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CiLogout } from "react-icons/ci";
import { membersAPI } from '../utils/api';

const Sidebar = ({ darkMode, adminUser, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [actualUserData, setActualUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const lastFetchedUserId = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to check adminUser prop
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sidebar - adminUser prop:', adminUser);
    }
  }, [adminUser]);

  // Fetch actual user data from API (only once per user)
  useEffect(() => {
    const fetchUserData = async () => {
      // Don't fetch if no user ID
      if (!adminUser?.id) {
        console.log('Sidebar - No admin user ID available');
        return;
      }

      // Don't fetch if already loading
      if (userDataLoading) {
        console.log('Sidebar - Already loading user data, skipping...');
        return;
      }

      // Don't fetch if we already have data for this user
      if (lastFetchedUserId.current === adminUser.id) {
        console.log('Sidebar - User data already fetched for ID:', adminUser.id);
        return;
      }

      // Don't fetch if we already know there's an auth issue
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated !== 'true') {
        console.log('Sidebar - Not authenticated, skipping user data fetch');
        return;
      }

      try {
        setUserDataLoading(true);
        console.log('Sidebar - Fetching user data for ID:', adminUser.id);
        const userData = await membersAPI.getById(adminUser.id);
        console.log('Sidebar - Fetched user data:', userData);
        setActualUserData(userData);
        lastFetchedUserId.current = adminUser.id; // Mark as fetched
      } catch (error) {
        console.error('Sidebar - Failed to fetch user data:', error);
        
        // Mark as attempted to prevent retries
        lastFetchedUserId.current = adminUser.id;
        
        // If it's an authentication error, don't retry and use fallback data
        if (error.message.includes('Session expired') || error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('Sidebar - Authentication error detected, using localStorage data as fallback');
          setActualUserData(null);
        } else if (error.message.includes('Access denied') || error.message.includes('403') || error.message.includes('Forbidden')) {
          console.log('Sidebar - Access forbidden, user may not have permission to view member details');
          setActualUserData(null);
        } else {
          // For other errors, continue with adminUser data
          setActualUserData(null);
        }
      } finally {
        setUserDataLoading(false);
      }
    };

    // Only fetch if we haven't fetched for this user yet
    if (adminUser?.id && lastFetchedUserId.current !== adminUser.id && !userDataLoading) {
      fetchUserData();
    }
  }, [adminUser?.id]); // Only depend on adminUser.id

  // Helper function to get user initials
  const getUserInitials = () => {
    const userData = actualUserData || adminUser;
    
    if (userData?.name) {
      const nameParts = userData.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
      } else {
        return nameParts[0].length >= 2 
          ? (nameParts[0].charAt(0) + nameParts[0].charAt(1)).toUpperCase()
          : nameParts[0].charAt(0).toUpperCase();
      }
    } else if (userData?.username) {
      // Handle username format like "john.doe" or "john_doe" or "john-doe"
      const parts = userData.username.split(/[\s._-]+/);
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      } else {
        return parts[0].length >= 2 
          ? (parts[0].charAt(0) + parts[0].charAt(1)).toUpperCase()
          : parts[0].charAt(0).toUpperCase();
      }
    }
    return 'U';
  };

  // Helper function to get display name
  const getDisplayName = () => {
    const userData = actualUserData || adminUser;
    if (!userData) return 'User';
    
    // Try different name fields
    const name = userData.name || userData.fullName || userData.username || 'User';
    return name;
  };

  // Helper function to get display email
  const getDisplayEmail = () => {
    const userData = actualUserData || adminUser;
    if (!userData) return 'user@company.com';
    return userData.email || 'user@company.com';
  };

  // Helper function to get user role display
  const getUserRole = () => {
    const userData = actualUserData || adminUser;
    if (!userData || !userData.role) return 'User';
    
    // Format role for display
    const role = userData.role.toUpperCase();
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'MANAGER':
        return 'Manager';
      case 'TEAM_LEAD':
        return 'Team Lead';
      case 'RECRUITER':
        return 'Recruiter';
      case 'SENIOR_RECRUITER':
        return 'Senior Recruiter';
      case 'HR_EXECUTIVE':
        return 'HR Executive';
      default:
        // If role doesn't match, return as is but formatted
        return userData.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { id: 'upload', icon: '📤', label: 'Upload Resume', path: '/upload' },
    { id: 'members', icon: '🧑‍💼', label: 'Members', path: '/members', adminOnly: true },
    { id: 'candidates', icon: '👥', label: 'All Candidates', path: '/candidates' },
    // { id: 'jd-matcher', icon: '🎯', label: 'JD Matcher', path: '/jd-matcher' },
    // { id: 'messaging', icon: '💬', label: 'Messaging', path: '/messaging' },
    // { id: 'customizer', icon: '✨', label: 'Resume Customizer', path: '/customizer', premium: true },
    // { id: 'settings', icon: '⚙️', label: 'Settings', path: '/settings' },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      const userData = actualUserData || adminUser;
      return userData?.role === 'ADMIN' || userData?.role === 'Admin';
    }
    return true;
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleUserClick = () => {
    if (isCollapsed) {
      setShowUserMenu(!showUserMenu);
    } else {
      navigate('/profile');
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        <h1 className="text-lg font-bold text-white">TalentPool AI</h1>
        
        {/* User info in mobile header */}
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {getUserInitials()}
          </div>
          {adminUser && (
            <div className="text-xs text-slate-300 mt-1 text-center">
              <div>{(localStorage.getItem(""))}</div>
              <div className="text-slate-400">{getUserRole()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-transparent bg-opacity-30 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-900 text-white'}
          h-screen transition-all duration-300 ease-in-out flex flex-col
          
          lg:relative
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          
          fixed top-0 left-0 z-50 w-60
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          shadow-2xl lg:shadow-none
        `}
      >
        {/* Desktop Header */}
        <div className={`p-4 hidden lg:flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b ${darkMode ? 'border-slate-700' : 'border-slate-700'}`}>
          {!isCollapsed && <h1 className="text-xl font-bold">TalentPool AI</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-xl hover:bg-slate-800 p-2 rounded transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Mobile Header inside sidebar */}
        <div className="lg:hidden p-6 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Menu</h1>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white text-2xl hover:bg-slate-700 p-2 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          
     
          
    
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} p-3 rounded-lg mb-2 transition-all relative cursor-pointer ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-2xl">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {item.premium && (
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                      PRO
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className={`p-2 border-t ${darkMode ? 'border-slate-700' : 'border-slate-700'} relative`}>
          {isCollapsed ? (
            <button
              onClick={handleUserClick}
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="User menu"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {getUserInitials()}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2">
              <button
                onClick={handleUserClick}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors flex-1 cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getUserInitials()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{getDisplayName()}</p>
                  <p className="text-xs text-slate-400">{getUserRole()}</p>
                </div>
              </button>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded cursor-pointer"
                  title="View Profile"
                >
                  👤
                </button>
                <button
                  onClick={() => {
                    const confirmed = window.confirm('Are you sure you want to logout?');
                    if (confirmed) {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded cursor-pointer"
                  title="Logout"
                >
                  <CiLogout />
                </button>
              </div>
            </div>
          )}

          {/* Collapsed User Menu */}
          {isCollapsed && showUserMenu && (
            <div className="absolute bottom-full left-full mb-2 ml-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 min-w-48 z-50">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="font-medium text-white">{getDisplayName()}</p>
                <p className="text-xs text-slate-400">{getUserRole()}</p>
                <p className="text-xs text-slate-500">{getDisplayEmail()}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>👤</span>
                View Profile
              </button>
              <button
                onClick={() => {
                  const confirmed = window.confirm('Are you sure you want to logout?');
                  if (confirmed) {
                    onLogout();
                    setShowUserMenu(false);
                  }
                }}
                className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
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
    </>
  );
};

export default Sidebar;