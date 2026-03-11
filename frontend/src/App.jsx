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
import './App.css';
import Members from './components/Members';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Load authentication state and dark mode preference from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('adminUser');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(savedUser));
    }
    
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

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
    setIsAuthenticated(true);
    setAdminUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      // Call backend logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
      // Continue with logout even if API fails
    } finally {
      // Clear local storage and state
      setIsAuthenticated(false);
      setAdminUser(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('authToken');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleViewCandidateProfile = (candidateId) => {
    setSelectedCandidateId(candidateId);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} darkMode={darkMode} />;
  }

  return (
    <Router>
      <div className={`flex h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
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
              element={<AdminProfile darkMode={darkMode} adminUser={adminUser} />} 
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