import { useState, useEffect } from 'react';
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

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    setActiveTab('dashboard');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminUser');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleViewCandidateProfile = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setActiveTab('candidate-profile');
  };

  const handleBackFromProfile = () => {
    setSelectedCandidateId(null);
    setActiveTab('candidates');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} darkMode={darkMode} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />;
      case 'upload':
        return <UploadResume darkMode={darkMode} />;
      case 'jd-matcher':
        return <JDMatcher darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />;
      case 'candidates':
        return <AllCandidates darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />;
      case 'messaging':
        return <MessagingCenter darkMode={darkMode} />;
      case 'customizer':
        return <ResumeCustomizer darkMode={darkMode} />;
      case 'profile':
        return <AdminProfile darkMode={darkMode} adminUser={adminUser} />;
      case 'settings':
        return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case 'candidate-profile':
        return (
          <CandidateProfile 
            candidateId={selectedCandidateId} 
            onBack={handleBackFromProfile}
            darkMode={darkMode}
          />
        );
      case 'analytics':
        return (
          <div className="p-8">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Analytics
            </h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              Coming soon...
            </p>
          </div>
        );
      default:
        return <Dashboard darkMode={darkMode} onViewCandidate={handleViewCandidateProfile} />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode}
        adminUser={adminUser}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;