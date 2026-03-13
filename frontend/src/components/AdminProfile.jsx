import { useState, useEffect } from 'react';
import { membersAPI, handleAPIError } from '../utils/api';

const AdminProfile = ({ darkMode, adminUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualUserData, setActualUserData] = useState(null);
  const [adminData, setAdminData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    role: 'Loading...',
    department: 'Loading...',
    company: 'TechCorp Solutions',
    joinDate: '2024-01-01',
    location: 'Not specified',
  });

  // Debug log to check adminUser prop
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AdminProfile - adminUser prop:', adminUser);
    }
  }, [adminUser]);

  // Helper function to get formatted role name
  const getFormattedRole = (role) => {
    if (!role) return 'User';
    
    const upperRole = role.toUpperCase();
    switch (upperRole) {
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
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Fetch actual user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!adminUser?.id) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('Fetching user data for ID:', adminUser.id);
        const userData = await membersAPI.getById(adminUser.id);
        console.log('Fetched user data:', userData);
        console.log('User role from API:', userData?.role);
        console.log('Formatted role:', getFormattedRole(userData?.role));
        
        setActualUserData(userData);
        
        // Update adminData with fetched data
        setAdminData({
          name: userData.name || userData.fullName || userData.username || 'User',
          email: userData.email || 'user@company.com',
          phone: userData.phone || 'Not provided',
          role: getFormattedRole(userData.role),
          department: userData.department || 'Not specified',
          company: 'TechCorp Solutions',
          joinDate: userData.createdAt || userData.joinDate || '2024-01-01',
          location: 'Not specified',
        });
        
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        
        // If it's an authentication error, user might be deactivated
        if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('AdminProfile - User appears to be deactivated, using localStorage data only');
          // Use fallback to adminUser data
          if (adminUser) {
            setAdminData({
              name: adminUser.name || adminUser.username || 'User',
              email: adminUser.email || 'user@company.com',
              phone: adminUser.phone || 'Not provided',
              role: getFormattedRole(adminUser.role),
              department: adminUser.department || 'Not specified',
              company: 'TechCorp Solutions',
              joinDate: adminUser.createdAt || adminUser.joinDate || '2024-01-01',
              location: 'Not specified',
            });
          }
        } else {
          setError(handleAPIError(error));
          
          // Fallback to adminUser data for other errors too
          if (adminUser) {
            setAdminData({
              name: adminUser.name || adminUser.username || 'User',
              email: adminUser.email || 'user@company.com',
              phone: adminUser.phone || 'Not provided',
              role: getFormattedRole(adminUser.role),
              department: adminUser.department || 'Not specified',
              company: 'TechCorp Solutions',
              joinDate: adminUser.createdAt || adminUser.joinDate || '2024-01-01',
              location: 'Not specified',
            });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [adminUser?.id]);

  const [stats] = useState({
    candidatesReviewed: 1247,
    interviewsScheduled: 89,
    hiresCompleted: 23,
    avgResponseTime: '2.4 hours',
  });

  const handleSave = async () => {
    if (!adminUser?.id) {
      alert('User ID not found. Cannot save profile.');
      return;
    }

    // Basic validation
    if (!adminData.name.trim()) {
      alert('Name is required.');
      return;
    }

    if (!adminData.email.trim()) {
      alert('Email is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Phone validation (if provided)
    if (adminData.phone && adminData.phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(adminData.phone.replace(/\D/g, ''))) {
        alert('Please enter a valid 10-digit phone number.');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Prepare data for API call
      const updateData = {
        name: adminData.name.trim(),
        email: adminData.email.trim(),
        phone: adminData.phone.trim() || null,
        department: adminData.department.trim() || null,
        // Note: Role should typically not be editable by user themselves
        // role: adminData.role
      };

      console.log('Updating profile with data:', updateData);
      
      // Call the update API
      const updatedUser = await membersAPI.update(adminUser.id, updateData);
      console.log('Profile updated successfully:', updatedUser);
      
      // Update the actual user data state
      setActualUserData(updatedUser);
      
      // Update localStorage with new data
      const updatedAdminUser = { ...adminUser, ...updateData };
      localStorage.setItem('adminUser', JSON.stringify(updatedAdminUser));
      
      setIsEditing(false);
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(`Failed to update profile: ${handleAPIError(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        {(() => {
          if (loading) return 'Loading Profile...';
          if (!actualUserData?.role && !adminUser?.role) return 'User Profile';
          
          const role = (actualUserData?.role || adminUser?.role || '').toUpperCase();
          switch (role) {
            case 'ADMIN':
              return 'Admin Profile';
            case 'MANAGER':
              return 'Manager Profile';
            case 'TEAM_LEAD':
              return 'Team Lead Profile';
            case 'RECRUITER':
              return 'Recruiter Profile';
            case 'SENIOR_RECRUITER':
              return 'Senior Recruiter Profile';
            case 'HR_EXECUTIVE':
              return 'HR Executive Profile';
            default:
              const formattedRole = (actualUserData?.role || adminUser?.role || 'User')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
              return `${formattedRole} Profile`;
          }
        })()}
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className={`${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Loading user profile...
            </span>
          </div>
        </div>
      )}


 
      {/* Main Profile Content - Only show when not loading */}
      {!loading && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className={`lg:col-span-1 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
              {(() => {
                if (adminData.name) {
                  const nameParts = adminData.name.trim().split(/\s+/);
                  if (nameParts.length >= 2) {
                    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
                  } else {
                    return nameParts[0].length >= 2 
                      ? (nameParts[0].charAt(0) + nameParts[0].charAt(1)).toUpperCase()
                      : nameParts[0].charAt(0).toUpperCase();
                  }
                }
                return 'U';
              })()}
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {adminData.name}
            </h3>
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {adminData.role}
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {adminData.department}
            </p>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>📧</span>
              <span>{adminData.email}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>📞</span>
              <span>{adminData.phone}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>🏢</span>
              <span>{adminData.company}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>📍</span>
              <span>{adminData.location}</span>
            </div>
            <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <span>📅</span>
              <span>Joined {new Date(adminData.joinDate).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
            className={`w-full mt-6 py-2 rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Loading...' : (isEditing ? 'Cancel Edit' : 'Edit Profile')}
          </button>
        </div>

        {/* Profile Details */}
        <div className={`lg:col-span-2 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Profile Information
            </h3>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.name}
                  onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.name}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                  placeholder="Enter your email address"
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.email}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={adminData.phone}
                  onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                  pattern="[0-9]{10}"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                  placeholder="Enter 10-digit phone number"
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.phone}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Role
              </label>
              <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'} bg-slate-100 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-lg`}>
                {adminData.role}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Role cannot be changed by user
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.department}
                  onChange={(e) => setAdminData({...adminData, department: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                  placeholder="Enter your department"
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.department}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6 text-center`}>
          <div className="text-3xl mb-2">👥</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {stats.candidatesReviewed}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Candidates Reviewed
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6 text-center`}>
          <div className="text-3xl mb-2">📅</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {stats.interviewsScheduled}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Interviews Scheduled
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6 text-center`}>
          <div className="text-3xl mb-2">✅</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {stats.hiresCompleted}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Hires Completed
          </div>
        </div>

        <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6 text-center`}>
          <div className="text-3xl mb-2">⚡</div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {stats.avgResponseTime}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Avg Response Time
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;