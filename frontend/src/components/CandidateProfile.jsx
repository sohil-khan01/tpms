import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CandidateProfile = ({ candidateId, darkMode }) => {
  const navigate = useNavigate();
  const [candidate] = useState({
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 234 567 8900',
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    portfolio: 'johndoe.dev',
    
    // Professional Info
    currentRole: 'Senior Full Stack Developer',
    experience: '5 years',
    expectedSalary: '$120,000 - $140,000',
    availability: 'Available in 2 weeks',
    
    // Education
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'Stanford University',
        year: '2019',
        gpa: '3.8/4.0'
      },
      {
        degree: 'Master of Science in Software Engineering',
        school: 'UC Berkeley',
        year: '2021',
        gpa: '3.9/4.0'
      }
    ],
    
    // Skills
    skills: {
      technical: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB'],
      soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Agile/Scrum']
    },
    
    // Experience
    workExperience: [
      {
        company: 'TechCorp Inc.',
        role: 'Senior Full Stack Developer',
        duration: '2022 - Present',
        description: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%.',
        achievements: [
          'Increased system performance by 40%',
          'Led team of 5 developers',
          'Reduced bug reports by 35%'
        ]
      },
      {
        company: 'StartupXYZ',
        role: 'Full Stack Developer',
        duration: '2020 - 2022',
        description: 'Built scalable web applications using React and Node.js. Collaborated with cross-functional teams to deliver features.',
        achievements: [
          'Developed 3 major product features',
          'Improved code coverage to 85%',
          'Mentored 2 junior developers'
        ]
      }
    ],
    
    // Projects
    projects: [
      {
        name: 'E-commerce Platform',
        tech: ['React', 'Node.js', 'PostgreSQL'],
        description: 'Built a full-featured e-commerce platform with payment integration and admin dashboard.',
        link: 'github.com/johndoe/ecommerce'
      },
      {
        name: 'Task Management App',
        tech: ['Vue.js', 'Express', 'MongoDB'],
        description: 'Developed a collaborative task management application with real-time updates.',
        link: 'github.com/johndoe/taskapp'
      }
    ],
    
    // AI Analysis
    aiAnalysis: {
      matchScore: 92,
      strengths: [
        'Strong full-stack development experience',
        'Leadership and team management skills',
        'Modern technology stack proficiency',
        'Proven track record of performance improvements'
      ],
      concerns: [
        'May be overqualified for junior positions',
        'Salary expectations might be high for some roles'
      ],
      recommendations: [
        'Excellent fit for senior developer roles',
        'Consider for team lead positions',
        'Strong candidate for startup environments'
      ]
    },
    
    uploadDate: '2024-03-08',
    lastUpdated: '2024-03-10',
    status: 'Active',
    tags: ['Featured', 'High Priority', 'Quick Hire']
  });

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'analysis', label: 'AI Analysis', icon: '🤖' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Contact Information
                </h4>
                <div className="space-y-2">
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>📧</span>
                    <span>{candidate.email}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>📞</span>
                    <span>{candidate.phone}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>📍</span>
                    <span>{candidate.location}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>💼</span>
                    <a href={`https://${candidate.linkedIn}`} className="text-blue-600 hover:underline">
                      {candidate.linkedIn}
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Professional Summary
                </h4>
                <div className="space-y-2">
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Current Role:</strong> {candidate.currentRole}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Experience:</strong> {candidate.experience}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Expected Salary:</strong> {candidate.expectedSalary}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Availability:</strong> {candidate.availability}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-6">
            {candidate.workExperience.map((exp, index) => (
              <div key={index} className={`border-l-4 border-blue-500 pl-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-r-lg`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {exp.role}
                  </h4>
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {exp.duration}
                  </span>
                </div>
                <p className={`font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {exp.company}
                </p>
                <p className={`mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {exp.description}
                </p>
                <div>
                  <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Key Achievements:
                  </h5>
                  <ul className="space-y-1">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx} className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-6">
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Technical Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.technical.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Soft Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.soft.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            {candidate.education.map((edu, index) => (
              <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {edu.degree}
                </h4>
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {edu.school} • {edu.year}
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  GPA: {edu.gpa}
                </p>
              </div>
            ))}
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-4">
            {candidate.projects.map((project, index) => (
              <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {project.name}
                  </h4>
                  <a
                    href={`https://${project.link}`}
                    className="text-blue-600 hover:underline text-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Project →
                  </a>
                </div>
                <p className={`mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'analysis':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {candidate.aiAnalysis.matchScore}%
              </div>
              <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Overall Match Score
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-green-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 text-green-800 ${darkMode ? 'text-green-400' : ''}`}>
                  ✅ Strengths
                </h4>
                <ul className="space-y-2">
                  {candidate.aiAnalysis.strengths.map((strength, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-yellow-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 text-yellow-800 ${darkMode ? 'text-yellow-400' : ''}`}>
                  ⚠️ Concerns
                </h4>
                <ul className="space-y-2">
                  {candidate.aiAnalysis.concerns.map((concern, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {concern}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-blue-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 text-blue-800 ${darkMode ? 'text-blue-400' : ''}`}>
                  💡 Recommendations
                </h4>
                <ul className="space-y-2">
                  {candidate.aiAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/candidates')}
          className={`p-2 rounded-lg hover:bg-slate-200 ${darkMode ? 'hover:bg-slate-700 text-white' : 'text-slate-600'}`}
        >
          ← Back
        </button>
        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Candidate Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className={`lg:col-span-1 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {candidate.name}
            </h3>
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {candidate.currentRole}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              {candidate.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send Message
            </button>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Schedule Interview
            </button>
            <button className={`w-full py-2 border rounded-lg transition-colors ${
              darkMode 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}>
              Download Resume
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`lg:col-span-3 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm`}>
          {/* Tabs */}
          <div className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} p-6`}>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'text-slate-300 hover:bg-slate-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;