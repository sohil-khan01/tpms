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
      <h2 className="text-3xl font-bold text-slate-800 mb-2">All Candidates</h2>
      <p className="text-slate-600 mb-8">Browse and manage your talent pool</p>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by skill..."
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {candidate.name.charAt(0)}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {candidate.matchScore}% Match
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">{candidate.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{candidate.education}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>📧</span>
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>📞</span>
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
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
      </div>
    </div>
  );
};

export default AllCandidates;
