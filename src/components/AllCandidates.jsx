import { useState, useEffect } from 'react';

const AllCandidates = ({ darkMode, onViewCandidate }) => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    // TODO: Replace with your actual API endpoint
    const fetchCandidates = async () => {
      try {
        // const response = await fetch('YOUR_API_ENDPOINT/candidates');
        // const data = await response.json();
        
        // Mock data
        setCandidates([
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
          {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.w@email.com',
            phone: '+1 234 567 8903',
            skills: ['Vue.js', 'PHP', 'MySQL', 'Laravel'],
            experience: '6 years',
            education: 'MS Computer Science',
            uploadDate: '2024-03-05',
            matchScore: 90,
          },
          {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+1 234 567 8904',
            skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
            experience: '3 years',
            education: 'BS Software Engineering',
            uploadDate: '2024-03-04',
            matchScore: 82,
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !filterSkill || candidate.skills.some(skill => 
      skill.toLowerCase().includes(filterSkill.toLowerCase())
    );
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        All Candidates
      </h2>
      <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Browse and manage your talent pool
      </p>

      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm`}>
        <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className={`w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCandidates.map((candidate) => (
            <div 
              key={candidate.id} 
              className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {candidate.name.charAt(0)}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {candidate.matchScore}% Match
                </span>
              </div>

              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {candidate.name}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {candidate.education}
              </p>

              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>📧</span>
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>📞</span>
                  <span>{candidate.phone}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span>💼</span>
                  <span>{candidate.experience}</span>
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
                onClick={() => onViewCandidate && onViewCandidate(candidate.id)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              No candidates found
            </h3>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCandidates;