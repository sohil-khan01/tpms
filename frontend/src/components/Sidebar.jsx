import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiChartBar, 
  HiCloudArrowUp, 
  HiUserGroup, 
  HiUsers, 
  HiViewColumns, 
  HiChatBubbleLeftRight, 
  HiSparkles, 
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiUser,
  HiChevronLeft,
  HiChevronRight,
  HiBars3,
  HiMagnifyingGlass,
  HiClipboardDocumentList
} from 'react-icons/hi2';
import { authAPI } from '../utils/api';

const Sidebar = ({ darkMode, adminUser, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [actualUserData, setActualUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log to check adminUser prop
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sidebar - adminUser prop:', adminUser);
      
      // Check user authorities
      authAPI.checkAuthorities().then(authorities => {
        console.log('Current user authorities:', authorities);
      }).catch(err => {
        console.error('Failed to check authorities:', err);
      });
    }
  }, [adminUser]);

  // Fetch actual user data from API — skip if adminUser already has complete data
  useEffect(() => {
    // adminUser from localStorage already has all needed fields (name, email, role)
    // No need to make an extra API call that may fail due to role-based restrictions
    if (adminUser) {
      setActualUserData(adminUser);
    }
  }, [adminUser?.id]);

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
    { id: 'dashboard', icon: HiChartBar, label: 'Dashboard', path: '/dashboard' },
    { id: 'upload', icon: HiCloudArrowUp, label: 'Upload Resume', path: '/upload' },
    { id: 'members', icon: HiUserGroup, label: 'Members', path: '/members', adminOnly: true },
    { id: 'candidates', icon: HiUsers, label: 'All Candidates', path: '/candidates' },
    { id: 'jd-matcher', icon: HiViewColumns, label: 'JD Matcher', path: '/jd-matcher' },
    { id: 'messaging', icon: HiChatBubbleLeftRight, label: 'Messaging', path: '/messaging' },
    { id: 'customizer', icon: HiSparkles, label: 'Resume Customizer', path: '/customizer', premium: true },
    { id: 'candidateSearch', icon: HiMagnifyingGlass, label: 'Talent Radar', path: '/candidate-search' },
    { id: 'hiring-pipeline', icon: HiViewColumns, label: 'Hiring Pipeline', path: '/hiring-pipeline' },
    { id: 'online-test', icon: HiClipboardDocumentList, label: 'Online Test', path: '/online-test' },
    { id: 'settings', icon: HiCog6Tooth, label: 'Settings', path: '/settings' }
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
          className="text-white p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <HiBars3 className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg font-bold text-white flex-1 text-center">TalentPool AI</h1>
        
        {/* User info in mobile header */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {getUserInitials()}
          </div>
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
            {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
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
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
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
                <IconComponent className="text-2xl" />
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
            );
          })}
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
            <div className="flex items-center gap-2 p-2 min-w-0">
              <button
                onClick={handleUserClick}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors flex-1 cursor-pointer min-w-0"
                title={`${getDisplayName()} - ${getUserRole()}`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-sm truncate">{getDisplayName()}</p>
                  <p className="text-xs text-slate-400 truncate">{getUserRole()}</p>
                </div>
              </button>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded cursor-pointer"
                  title="View Profile"
                >
                  <HiUser className="text-xl" />
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
                  <HiArrowRightOnRectangle className="text-xl" />
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
                <HiUser className="text-lg" />
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
                <HiArrowRightOnRectangle className="text-lg" />
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