import { useState } from 'react';

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

    // TODO: Replace with your actual API endpoint
    try {
      // const response = await fetch('YOUR_API_ENDPOINT/admin/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // });
      // const data = await response.json();

      // Mock authentication - replace with real logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (credentials.email === 'admin@company.com' && credentials.password === 'admin123') {
        const adminData = {
          id: 1,
          name: 'Sarah Johnson',
          email: credentials.email,
          role: 'Senior HR Manager',
          avatar: null,
        };
        onLogin(adminData);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'admin@company.com',
      password: 'admin123',
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-slate-900' : 'bg-slate-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl text-white font-bold">TP</span>
          </div>
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            TalentPool AI
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
                Email Address
              </label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
                placeholder="Enter your email"
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
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
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
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500'}`}>
                  Demo Access
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className={`mt-4 w-full py-2 px-4 border rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Use Demo Credentials
            </button>
          </div>

          <div className={`mt-6 text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <p>Demo Credentials:</p>
            <p>Email: admin@company.com</p>
            <p>Password: admin123</p>
          </div>
        </div>

        <div className={`text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <p>© 2024 TalentPool AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;