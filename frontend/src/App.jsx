import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { authAPI } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import UploadResume from './components/UploadResume';
import AllCandidates from './components/AllCandidates';
import JDMatcher from './components/JDMatcher';
import JDManagement from './components/JDManagement';
import UploadedJDs from './components/UploadedJDs';
import MessagingCenter from './components/MessagingCenter';
import ResumeCustomizer from './components/ResumeCustomizer';
import Settings from './components/Settings';
import AdminProfile from './components/AdminProfile';
import CandidateProfile from './components/CandidateProfile';
import Login from './components/Login';
import LogoutListener from './components/LogoutListener';
import Members from './components/Members';
import HomePage from './components/HomePage';
import FresherRegistration from './components/FresherRegistration';
import CandidateSearch from './components/Candidatesearch';
import HiringPipeline from './components/HiringPipeline';
import OnlineTest from './components/OnlineTest';
import CandidateTestPortal from './components/CandidateTestPortal';

// ProtectedRoute — redirects to login if not authenticated, preserving the intended path
const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function AppRoutes({ isAuthenticated, darkMode, setDarkMode, adminUser, handleLogin, handleLogout }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const location = useLocation();

  // After login, redirect to the page user was trying to visit
  const from = location.state?.from?.pathname || '/dashboard';

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<FresherRegistration />} />
        <Route path="/login" element={<Login onLogin={handleLogin} darkMode={darkMode} />} />
        <Route path="/test" element={<CandidateTestPortal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <LogoutListener currentUser={adminUser} onLogout={handleLogout} />
      <Sidebar darkMode={darkMode} adminUser={adminUser} onLogout={handleLogout} />
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard darkMode={darkMode} onViewCandidate={(id) => setSelectedCandidateId(id)} />} />
          <Route path="/upload" element={<UploadResume darkMode={darkMode} />} />
          <Route path="/jd-matcher" element={<JDMatcher darkMode={darkMode} onViewCandidate={(id) => setSelectedCandidateId(id)} />} />
          <Route path="/jd-management" element={<JDManagement darkMode={darkMode} />} />
          <Route path="/uploaded-jds" element={<UploadedJDs darkMode={darkMode} />} />
          <Route path="/candidates" element={<AllCandidates darkMode={darkMode} onViewCandidate={(id) => setSelectedCandidateId(id)} />} />
          <Route path="/members" element={<Members darkMode={darkMode} />} />
          <Route path="/messaging" element={<MessagingCenter darkMode={darkMode} />} />
          <Route path="/customizer" element={<ResumeCustomizer darkMode={darkMode} />} />
          <Route path="/profile" element={<AdminProfile darkMode={darkMode} adminUser={adminUser} />} />
          <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />} />
          <Route path="/candidate/:id" element={<CandidateProfile candidateId={selectedCandidateId} darkMode={darkMode} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/candidate-search" element={<CandidateSearch darkMode={darkMode} />} />
          <Route path="/hiring-pipeline" element={<HiringPipeline darkMode={darkMode} />} />
          <Route path="/online-test" element={<OnlineTest darkMode={darkMode} />} />
          <Route path="/test" element={<CandidateTestPortal />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const [adminUser, setAdminUser] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('adminUser');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(savedUser));
    } else {
      setIsAuthenticated(false);
    }

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Watch localStorage for auth changes (triggered by LogoutListener)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAuth = localStorage.getItem('isAuthenticated');
      if (isAuthenticated && savedAuth !== 'true') {
        setIsAuthenticated(false);
        setAdminUser(null);
      }
    };

    const interval = setInterval(handleStorageChange, 300);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Sync dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setAdminUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    try { await authAPI.logout(); } catch (_) {}
  };

  // Still checking localStorage — render nothing to avoid flash
  if (isAuthenticated === null) return null;

  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        adminUser={adminUser}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
