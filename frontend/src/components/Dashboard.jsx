import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, handleAPIError } from '../utils/api';

const Dashboard = ({ darkMode, onViewCandidate }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    newThisWeek: 0,
    activePositions: 0,
    totalMembers: 0,
  });

  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Use mock data directly for faster loading
        // TODO: Replace with actual API calls when backend is ready
        setStats({
          totalCandidates: 1247,
          newThisWeek: 23,
          activePositions: 15,
          totalMembers: 8,
        });

        setRecentCandidates([
          {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 234 567 8900',
            skills: ['React', 'Node.js', 'Python', 'AWS'],
            experience: '5 years',
            education: 'BS Computer Science',
            uploadDate: '2024-03-08',
            matchScore: 92,
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1 234 567 8901',
            skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker'],
            experience: '7 years',
            education: 'MS Software Engineering',
            uploadDate: '2024-03-07',
            matchScore: 88,
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.j@email.com',
            phone: '+1 234 567 8902',
            skills: ['Angular', 'TypeScript', 'MongoDB', 'Express'],
            experience: '4 years',
            education: 'BS Information Technology',
            uploadDate: '2024-03-06',
            matchScore: 85,
          },
        ]);

        // Optional: Try to fetch from backend with timeout (uncomment when backend is ready)
        /*
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const [statsData, candidatesData] = await Promise.all([
            dashboardAPI.getStats({ signal: controller.signal }),
            dashboardAPI.getRecentCandidates({ signal: controller.signal }),
          ]);

          clearTimeout(timeoutId);
          setStats(statsData);
          setRecentCandidates(candidatesData);
        } catch (apiError) {
          console.warn('Backend API not available, using mock data:', apiError);
        }
        */
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Dashboard</h2>
        <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Welcome back! Here's your talent pool overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Total Candidates</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.totalCandidates}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
              ✨
            </div>
            <span className="text-green-600 text-sm font-medium">+{stats.newThisWeek}</span>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">New This Week</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.newThisWeek}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
              💼
            </div>
            <span className="text-blue-600 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Open Positions</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.activePositions}</p>
        </div>

        <div 
          onClick={() => navigate('/members')}
          className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
              🧑‍💼
            </div>
            <span className="text-green-600 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-slate-600 text-sm mb-1">Total Members</h3>
          <p className="text-3xl font-bold text-slate-800">{stats.totalMembers}</p>
        </div>
      </div>

      {/* Recent Candidates Table */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm`}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Recent Candidates</h3>
            <p className="text-slate-600 text-sm">Latest resumes processed by AI</p>
          </div>
          <button
            onClick={() => navigate('/candidates')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden p-4 space-y-4">
          {recentCandidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className={`border rounded-lg p-4 ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {candidate.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {candidate.education}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${candidate.matchScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    {candidate.matchScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email:</span>
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {candidate.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone:</span>
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {candidate.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Experience:</span>
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {candidate.experience}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {candidate.skills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 4 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    +{candidate.skills.length - 4}
                  </span>
                )}
              </div>

              <button 
                onClick={() => {
                  onViewCandidate && onViewCandidate(candidate.id);
                  navigate(`/candidate/${candidate.id}`);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Candidate</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Contact</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Skills</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Experience</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Match Score</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-800">{candidate.name}</p>
                      <p className="text-sm text-slate-500">{candidate.education}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-slate-700">{candidate.email}</p>
                      <p className="text-slate-500">{candidate.phone}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">{candidate.experience}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${candidate.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {candidate.matchScore}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          onViewCandidate && onViewCandidate(candidate.id);
                          navigate(`/candidate/${candidate.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                      >
                        View Profile
                      </button>
                     
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
