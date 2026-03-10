import { useState } from 'react';

const AdminProfile = ({ darkMode, adminUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    name: adminUser?.name || 'Sarah Johnson',
    email: adminUser?.email || 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    role: adminUser?.role || 'Senior HR Manager',
    department: 'Human Resources',
    company: 'TechCorp Solutions',
    joinDate: '2022-01-15',
    location: 'San Francisco, CA',
    bio: 'Experienced HR professional with 8+ years in talent acquisition and management.',
  });

  const [stats] = useState({
    candidatesReviewed: 1247,
    interviewsScheduled: 89,
    hiresCompleted: 23,
    avgResponseTime: '2.4 hours',
  });

  const handleSave = () => {
    // TODO: API call to update profile
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Admin Profile
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className={`lg:col-span-1 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
              {adminData.name.split(' ').map(n => n[0]).join('')}
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
            className="w-full mt-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
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
              {isEditing ? (
                <input
                  type="text"
                  value={adminData.role}
                  onChange={(e) => setAdminData({...adminData, role: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.role}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={adminData.bio}
                  onChange={(e) => setAdminData({...adminData, bio: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              ) : (
                <p className={`px-4 py-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {adminData.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

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