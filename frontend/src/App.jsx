import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadResume from './components/UploadResume';
import AllCandidates from './components/AllCandidates';
import JDMatcher from './components/JDMatcher';
import MessagingCenter from './components/MessagingCenter';
import ResumeCustomizer from './components/ResumeCustomizer';
import Settings from './components/Settings';
import AdminProfile from './components/AdminProfile';
import CandidateProfile from './components/CandidateProfile';
import Login from './components/Login';
import LogoutListener from './components/LogoutListener';
import WebSocketStatus from './components/WebSocketStatus';
import './App.css';
import Members from './components/Members';


function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState('');

  // Load authentication state and dark mode preference from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('adminUser');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('App.jsx - Loading saved data:', { savedAuth, savedUser });
    }
    
    if (savedAuth === 'true' && savedUser) {
      const userData = JSON.parse(savedUser);
      if (process.env.NODE_ENV === 'development') {
        // console.log('App.jsx - Parsed user data:', userData);
      }
      setIsAuthenticated(true);
      setAdminUser(userData);
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Global error handler for 401 errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      // Check if it's a 401 error from fetch
      if (event.reason && event.reason.message && event.reason.message.includes('Session expired')) {
        console.log('🚨 Global 401 error detected, forcing logout...');
        handleLogout();
      }
    };

    // Listen for unhandled promise rejections (like API 401 errors)
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
    const checkAuthState = () => {
      const savedAuth = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('adminUser');
      
      // If user was authenticated but now localStorage is cleared, update state immediately
      if (isAuthenticated && (!savedAuth || savedAuth !== 'true' || !savedUser)) {
        console.log('🔄 Authentication state lost, updating app state immediately...');
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    };

    // Check immediately
    checkAuthState();

    // Set up interval to check more frequently for faster response
    const authCheckInterval = setInterval(checkAuthState, 200);

    // Listen for storage changes (when other tabs or API calls clear auth)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' && e.newValue !== 'true') {
        console.log('🔄 Authentication cleared by WebSocket/API, logging out immediately...');
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (userData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('App.jsx - Received user data:', userData);
    }
    setIsAuthenticated(true);
    setAdminUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    console.log('🧹 Performing client-side logout cleanup');
    
    // Show logout message
    setLogoutMessage('Logging out...');
    
    // Clear state and storage immediately (don't wait for API)
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    
    // Try to call backend logout API in background (optional)
    try {
      await authAPI.logout();
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.warn('⚠️ Backend logout failed (this is okay for JWT systems):', error.message);
      // This is not critical for JWT-based systems since logout is primarily client-side
    }
    
    // Clear the message after a short delay
    setTimeout(() => {
      setLogoutMessage('');
    }, 2000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleViewCandidateProfile = (candidateId) => {
    setSelectedCandidateId(candidateId);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    // Ensure URL is at root when not authenticated
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
    
    return (
      <div>
        {logoutMessage && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {logoutMessage}
          </div>
        )}
        <Login onLogin={handleLogin} darkMode={darkMode} />
      </div>
    );
  }

  return (
    <Router>
      <div className={`flex h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
        {/* WebSocket Logout Listener - Only active when user is authenticated */}
        {isAuthenticated && adminUser && (
          <>
            <LogoutListener 
              currentUser={adminUser} 
              onLogout={handleLogout}
            />
            <WebSocketStatus currentUser={adminUser} />
         
          </>
        )}
        
        <Sidebar 
          darkMode={darkMode}
          adminUser={adminUser}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <Routes>
            {/* Default route - redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Main routes */}
             <Route 
              path="/dashboard" 
              element={<Dashboard darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />} 
            /> 
            <Route 
              path="/upload" 
              element={<UploadResume darkMode={darkMode} />} 
            />
            <Route 
              path="/jd-matcher" 
              element={<JDMatcher darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />} 
            />
            <Route 
              path="/candidates" 
              element={<AllCandidates darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />} 
            />
            <Route 
              path="/members" 
              element={<Members darkMode={darkMode} />} 
            />
            <Route 
              path="/messaging" 
              element={<MessagingCenter darkMode={darkMode} />} 
            />
            <Route 
              path="/customizer" 
              element={<ResumeCustomizer darkMode={darkMode} />} 
            />
            <Route 
              path="/profile" 
              element={
                <AdminProfile 
                  darkMode={darkMode} 
                  adminUser={adminUser}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} 
            />
            <Route 
              path="/candidate/:id" 
              element={
                <CandidateProfile 
                  candidateId={selectedCandidateId} 
                  darkMode={darkMode}
                />
              } 
            /> 
            
            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;