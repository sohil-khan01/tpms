import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, candidatesAPI, handleAPIError } from '../utils/api';
import { HiUsers, HiSparkles, HiBriefcase, HiUserGroup, HiExclamationTriangle } from 'react-icons/hi2';
import { SkeletonCard, SkeletonRow } from './PageLoader';

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

        // Fetch stats and recent candidates from API
        const [statsData, recentData] = await Promise.all([
          candidatesAPI.getStats(),
          candidatesAPI.getRecent(3),
        ]);

        // Transform the candidate data to match the expected format
        const transformedCandidates = recentData.map((candidate) => {
          // Extract skills from the nested skills object (front_end, back_end, databases, devops, other)
          let skillsList = [];
          if (candidate.skills) {
            const s = candidate.skills;
            skillsList = [
              ...(Array.isArray(s.front_end) ? s.front_end : []),
              ...(Array.isArray(s.back_end) ? s.back_end : []),
              ...(Array.isArray(s.databases) ? s.databases : []),
              ...(Array.isArray(s.devops) ? s.devops : []),
              ...(Array.isArray(s.other) ? s.other : []),
            ].filter(Boolean);
          }

          return {
            id: candidate.id,
            name: candidate.name || candidate.username || 'Unknown',
            email: candidate.email || 'N/A',
            phone: candidate.phone || 'N/A',
            skills: skillsList,
            education: candidate.education && Array.isArray(candidate.education) 
              ? candidate.education[0]?.degree || 'N/A' 
              : 'N/A',
            uploadDate: candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A',
            matchScore: 85,
          };
        });

        setRecentCandidates(transformedCandidates);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError(handleAPIError(error));
        setRecentCandidates([]);
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

      {/* Error Banner */}
      {error && (
        <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <HiExclamationTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="ml-auto underline text-xs cursor-pointer">Retry</button>
        </div>
      )}

      {/* Stats Cards — skeleton while loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonCard darkMode={darkMode} />
            <SkeletonCard darkMode={darkMode} />
            <SkeletonCard darkMode={darkMode} />
            <SkeletonCard darkMode={darkMode} />
          </>
        ) : (
          <>
            <div
              onClick={() => navigate('/candidates')}
              className={`rounded-xl p-6 border shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HiUsers className="text-2xl text-blue-600" />
                </div>
                <span className="text-green-600 text-sm font-medium">+12%</span>
              </div>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Candidates</h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalCandidates}</p>
            </div>

            <div
              onClick={() => navigate('/candidates')}
              className={`rounded-xl p-6 border shadow-sm cursor-pointer hover:shadow-md hover:border-green-300 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HiSparkles className="text-2xl text-green-600" />
                </div>
                <span className="text-green-600 text-sm font-medium">+{stats.newThisWeek}</span>
              </div>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>New This Week</h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.newThisWeek}</p>
            </div>

            <div className={`rounded-xl p-6 border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HiBriefcase className="text-2xl text-purple-600" />
                </div>
                <span className="text-blue-600 text-sm font-medium">Active</span>
              </div>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Open Positions</h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.activePositions}</p>
            </div>

            <div
              onClick={() => navigate('/members')}
              className={`rounded-xl p-6 border shadow-sm cursor-pointer hover:shadow-md hover:border-orange-300 transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <HiUserGroup className="text-2xl text-orange-600" />
                </div>
                <span className="text-green-600 text-sm font-medium">Active</span>
              </div>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Members</h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalMembers}</p>
            </div>
          </>
        )}
      </div>

      {/* Recent Candidates Table */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm`}>
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Recent Candidates</h3>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Latest resumes processed by AI</p>
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
          {loading ? (
            /* Mobile skeleton */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`border rounded-lg p-4 animate-pulse ${darkMode ? 'border-slate-700 bg-slate-700/50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 rounded w-32 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
                    <div className={`h-3 rounded w-24 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
                  </div>
                </div>
                <div className={`h-8 rounded-lg w-full ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />
              </div>
            ))
          ) : recentCandidates.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>No candidates found</p>
            </div>
          ) : (
            recentCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`border rounded-lg p-4 ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {candidate.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.education}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email:</span>
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{candidate.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone:</span>
                    <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{candidate.phone}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {candidate.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{skill}</span>
                  ))}
                  {candidate.skills.length > 4 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      +{candidate.skills.length - 4}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { onViewCandidate && onViewCandidate(candidate.id); navigate(`/candidate/${candidate.id}`); }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Candidate</th>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contact</th>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Education</th>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Skills</th>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow cols={5} darkMode={darkMode} />
                  <SkeletonRow cols={5} darkMode={darkMode} />
                  <SkeletonRow cols={5} darkMode={darkMode} />
                </>
              ) : recentCandidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>No candidates found</p>
                  </td>
                </tr>
              ) : (
                recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {candidate.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{candidate.email}</p>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{candidate.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{candidate.education}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{skill}</span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">+{candidate.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => { onViewCandidate && onViewCandidate(candidate.id); navigate(`/candidate/${candidate.id}`); }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
