import { useState } from 'react';
import { authAPI, handleAPIError } from '../utils/api';

const Login = ({ onLogin, darkMode }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authAPI.login({
        username: credentials.email,
        password: credentials.password,
      });

      // Check if user is active before allowing login
      if (data.status && (data.status === 'INACTIVE' || data.status === 'DELETED')) {
        setError('Your account has been deactivated or deleted. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      // Success - API returned valid response
      if (process.env.NODE_ENV === 'development') {
        console.log('Login API response:', data);
      }
      
      // Handle different possible response structures
      let userData = data;
      
      // If response has a nested user object
      if (data.user) {
        userData = data.user;
      }
      
      // If response has a nested data object
      if (data.data) {
        userData = data.data;
      }
      
      const adminData = {
        id: userData.id || userData.userId || 1,
        name: userData.name || userData.fullName || 
              (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : 
               userData.firstName || userData.lastName || userData.username),
        username: userData.username || userData.email,
        email: userData.email || credentials.email,
        phone: userData.phone || userData.phoneNumber,
        department: userData.department,
        role: userData.role || userData.userRole || 'User',
        status: userData.status || userData.accountStatus || 'ACTIVE',
        token: userData.token || userData.accessToken || data.token || data.accessToken,
        createdAt: userData.createdAt || userData.joinDate,
      };
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Processed admin data:', adminData);
        console.log('User role for security:', adminData.role);
      }
      
      // Store token for future API calls
      if (adminData.token) {
        localStorage.setItem('authToken', adminData.token);
      }
      
      onLogin(adminData);
    } catch (error) {
      console.error('Login failed:', error);
      
      // Check if error is related to inactive account
      if (error.message && error.message.toLowerCase().includes('inactive')) {
        setError('Your account has been deactivated. Please contact your administrator.');
      } else if (error.message && error.message.toLowerCase().includes('deleted')) {
        setError('Your account no longer exists. Please contact your administrator.');
      } else {
        setError(handleAPIError(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDemoLogin = () => {
  //   setCredentials({
  //     email: 'admin@1234',
  //     password: 'admin@1234',
  //   });
  // };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl text-white font-bold">TP</span>
          </div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Ai Powered TalentPool Management System 
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Admin Dashboard Login
          </p>
        </div>

        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-lg p-8`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Username
              </label>
              <input
                type="text"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className={`ml-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Remember me
                </span>
              </label>
              {/* <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>

        <div className={`text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <p>© 2024 TalentPool AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;