import { useState, useEffect } from "react";
import { searchAPI, candidatesAPI, jdAPI, handleAPIError } from "../utils/api";
import { InlineLoader, ButtonLoader } from './PageLoader';
import { 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal,
  HiUsers,
  HiChartBarSquare,
  HiCheckCircle,
  HiXCircle,
  HiEnvelope,
  HiBriefcase,
  HiAcademicCap,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi2';

// Score Ring Component
function ScoreRing({ score, darkMode }) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const color = getScoreColor(score);

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={darkMode ? '#374151' : '#e5e7eb'}
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`} style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// Skill Tag Component
function SkillTag({ skill, type, darkMode }) {
  const getTagStyles = () => {
    switch (type) {
      case 'matched':
        return {
          bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
          border: darkMode ? 'border-green-700' : 'border-green-200',
          text: darkMode ? 'text-green-400' : 'text-green-700',
          icon: <HiCheckCircle className="w-3 h-3" />
        };
      case 'missing':
        return {
          bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
          border: darkMode ? 'border-red-700' : 'border-red-200',
          text: darkMode ? 'text-red-400' : 'text-red-700',
          icon: <HiXCircle className="w-3 h-3" />
        };
      default:
        return {
          bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: darkMode ? 'border-blue-700' : 'border-blue-200',
          text: darkMode ? 'text-blue-400' : 'text-blue-700',
          icon: null
        };
    }
  };

  const styles = getTagStyles();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles.bg} ${styles.border} ${styles.text} whitespace-nowrap`}>
      {styles.icon}
      {skill}
    </span>
  );
}

// Candidate Card Component
function CandidateCard({ candidate, index, darkMode }) {
  const [expanded, setExpanded] = useState(false);

  const getExperienceColor = (match) => {
    switch (match) {
      case 'strong': return 'text-green-600';
      case 'partial': return 'text-amber-600';
      case 'weak': return 'text-red-600';
      default: return darkMode ? 'text-slate-400' : 'text-slate-600';
    }
  };

  return (
    <div 
      className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg sm:rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-4 sm:p-6">
        {/* Mobile: Vertical Layout, Desktop: Horizontal Layout */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Score Ring - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:block flex-shrink-0">
            <ScoreRing score={candidate.score || 0} darkMode={darkMode} />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Mobile Score Badge */}
            <div className="sm:hidden mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">{candidate.score || 0}</span>
                </div>
                <div>
                  <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {candidate.name || 'Unknown'}
                  </h3>
                  {candidate.experienceMatch && (
                    <span className={`text-xs font-medium capitalize ${getExperienceColor(candidate.experienceMatch)}`}>
                      {candidate.experienceMatch} Match
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                {expanded ? 
                  <HiChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} /> :
                  <HiChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                }
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {candidate.name || 'Unknown Candidate'}
                </h3>
                {candidate.experienceMatch && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getExperienceColor(candidate.experienceMatch)}`}>
                    {candidate.experienceMatch} Match
                  </span>
                )}
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
              >
                {expanded ? 
                  <HiChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} /> :
                  <HiChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                }
              </button>
            </div>

            {/* Contact Info - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <HiEnvelope className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.email || 'N/A'}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <HiBriefcase className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{candidate.totalExperienceYears ? `${candidate.totalExperienceYears} yrs` : 'N/A'}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <HiAcademicCap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{candidate.title || 'N/A'}</span>
              </div>
            </div>

            {candidate.summary && (
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 sm:mb-4 line-clamp-2`}>
                {candidate.summary}
              </p>
            )}

            {/* Quick Skills Preview */}
            {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
              <div className="mb-3 sm:mb-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {candidate.matchedSkills.slice(0, 3).map((skill, idx) => (
                    <SkillTag key={idx} skill={skill} type="matched" darkMode={darkMode} />
                  ))}
                  {candidate.matchedSkills.length > 3 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      +{candidate.matchedSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className={`mt-4 sm:mt-6 pt-4 sm:pt-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} animate-in slide-in-from-top-2 duration-300`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Matched Skills */}
              {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                <div>
                  <h4 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                    <HiCheckCircle className="w-4 h-4 flex-shrink-0" />
                    Matched ({candidate.matchedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {candidate.matchedSkills.map((skill, idx) => (
                      <SkillTag key={idx} skill={skill} type="matched" darkMode={darkMode} />
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {candidate.missingSkills && candidate.missingSkills.length > 0 && (
                <div>
                  <h4 className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    <HiXCircle className="w-4 h-4 flex-shrink-0" />
                    Missing ({candidate.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {candidate.missingSkills.map((skill, idx) => (
                      <SkillTag key={idx} skill={skill} type="missing" darkMode={darkMode} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium cursor-pointer text-sm sm:text-base">
                View Profile
              </button>
              <button className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-medium cursor-pointer text-sm sm:text-base">
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ label, icon, active, onClick, darkMode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors cursor-pointer text-xs sm:text-sm ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : darkMode
          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

// Main Component
export default function CandidateSearch({ darkMode }) {
  const [activeTab, setActiveTab] = useState("text");
  const [jdText, setJdText] = useState("");
  const [minScore, setMinScore] = useState(50);
  const [expMatch, setExpMatch] = useState("all");
  const [topN, setTopN] = useState(10);
  const [candidateId, setCandidateId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [scoreJd, setScoreJd] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [results, setResults] = useState(null);
  const [singleResult, setSingleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for dropdowns
  const [allCandidates, setAllCandidates] = useState([]);
  const [allJDs, setAllJDs] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingJDs, setLoadingJDs] = useState(false);

  // Fetch all candidates
  const fetchAllCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const data = await candidatesAPI.getAllUnpaged();
      setAllCandidates(data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Fetch all JDs
  const fetchAllJDs = async () => {
    setLoadingJDs(true);
    try {
      const jds = await jdAPI.getAll();
      
      // Function to extract title from JD content
      const extractTitleFromContent = (content) => {
        if (!content) return 'Untitled JD';
        
        const lines = content.split('\n').filter(line => line.trim());
        
        // Look for common job title patterns
        const titlePatterns = [
          /^(job title|position|role):\s*(.+)/i,
          /^(.+?)\s*-\s*(job|position|role)/i,
          /^(.+?)\s*job\s*(description|posting)/i,
          /^(.+?)\s*position/i,
          /^(.+?)\s*role/i,
        ];
        
        // Helper function to clean asterisks and extra whitespace
        const cleanTitle = (title) => {
          return title.replace(/\*+/g, '').trim();
        };
        
        // Check first few lines for title patterns
        for (let i = 0; i < Math.min(5, lines.length); i++) {
          const line = lines[i].trim();
          
          if (line.length < 3 || 
              line.toLowerCase().startsWith('job description') ||
              line.toLowerCase().startsWith('position:') ||
              line.toLowerCase().startsWith('role:')) {
            continue;
          }
          
          for (const pattern of titlePatterns) {
            const match = line.match(pattern);
            if (match && match[2]) {
              return cleanTitle(match[2]);
            }
          }
          
          if (i === 0 && line.length <= 100 && 
              !line.toLowerCase().startsWith('we are') &&
              !line.toLowerCase().startsWith('about') &&
              !line.toLowerCase().startsWith('company')) {
            return cleanTitle(line);
          }
        }
        
        const firstLine = lines[0];
        if (firstLine && firstLine.length <= 100) {
          return cleanTitle(firstLine);
        }
        
        const jobKeywords = content.toLowerCase().match(/(software engineer|developer|manager|analyst|designer|consultant|specialist|coordinator|director|lead|senior|junior|full.?stack|frontend|backend|devops|data scientist|product manager)/i);
        if (jobKeywords) {
          return jobKeywords[0].replace(/\b\w/g, l => l.toUpperCase()) + ' Position';
        }
        
        return 'Job Position';
      };
      
      // Transform JDs with extracted titles
      const transformedJDs = jds.map(jd => {
        const content = jd.optimizedJd || jd.originalContent || jd.content || '';
        return {
          ...jd,
          title: extractTitleFromContent(content),
          content: content
        };
      });
      
      setAllJDs(transformedJDs || []);
    } catch (err) {
      console.error('Failed to fetch JDs:', err);
    } finally {
      setLoadingJDs(false);
    }
  };

  // Load data when component mounts or when tabs change
  useEffect(() => {
    if (activeTab === "score" && allCandidates.length === 0) {
      fetchAllCandidates();
    }
    if (activeTab === "score" && allJDs.length === 0) {
      fetchAllJDs();
    }
    if ((activeTab === "text" || activeTab === "filtered") && allJDs.length === 0) {
      fetchAllJDs();
    }
  }, [activeTab]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setSingleResult(null);

    try {
      if (activeTab === "text") {
        // Use selected JD or manual text
        const jdToUse = selectedJdId ? 
          allJDs.find(jd => jd.id === parseInt(selectedJdId))?.content || jdText :
          jdText;
        const data = await searchAPI.byJDText(jdToUse);
        setResults(data.candidates || data);
      } else if (activeTab === "filtered") {
        // Use selected JD or manual text
        const jdToUse = selectedJdId ? 
          allJDs.find(jd => jd.id === parseInt(selectedJdId))?.content || jdText :
          jdText;
        const data = await searchAPI.withFilters({
          jd: jdToUse,
          minScore,
          experienceMatch: expMatch === "all" ? null : expMatch,
          topN,
        });
        setResults(data.candidates || data);
      } else if (activeTab === "score") {
        // Use selected candidate ID or manual ID
        const candidateIdToUse = candidateId || 
          (candidateName ? allCandidates.find(c => c.name === candidateName)?.id : null);
        if (!candidateIdToUse) {
          setError("Please select a candidate or enter a candidate ID");
          return;
        }
        
        // Use selected JD content or manual text
        const jdToUse = selectedJdId ? 
          allJDs.find(jd => jd.id === parseInt(selectedJdId))?.content || scoreJd :
          scoreJd;
        
        if (!jdToUse.trim()) {
          setError("Please select a JD or enter job requirements");
          return;
        }
        
        const data = await searchAPI.scoreCandidate(Number(candidateIdToUse), jdToUse);
        setSingleResult(data);
      }
    } catch (e) {
      setError(handleAPIError(e));
    } finally {
      setLoading(false);
    }
  };

  const canSearch = activeTab === "score" 
    ? (candidateId || candidateName) && (scoreJd.trim() || selectedJdId)
    : (jdText.trim().length > 10 || selectedJdId);

  const totalResults = results?.length || 0;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <HiMagnifyingGlass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Talent Radar
              </h1>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                AI-powered candidate discovery and matching
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-blue-50'} rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <HiUsers className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Candidates</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>1,247</p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-green-50'} rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <HiChartBarSquare className={`w-8 h-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Avg Match Score</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>78%</p>
                </div>
              </div>
            </div>
            <div className={`${darkMode ? 'bg-slate-700' : 'bg-purple-50'} rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <HiSparkles className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>AI Searches</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>342</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          <TabButton
            label="JD Search"
            icon={<HiMagnifyingGlass className="w-4 h-4" />}
            active={activeTab === "text"}
            onClick={() => setActiveTab("text")}
            darkMode={darkMode}
          />
          <TabButton
            label="Advanced Filter"
            icon={<HiAdjustmentsHorizontal className="w-4 h-4" />}
            active={activeTab === "filtered"}
            onClick={() => setActiveTab("filtered")}
            darkMode={darkMode}
          />
          <TabButton
            label="Score Candidate"
            icon={<HiChartBarSquare className="w-4 h-4" />}
            active={activeTab === "score"}
            onClick={() => setActiveTab("score")}
            darkMode={darkMode}
          />
        </div>

        {/* Search Forms */}
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-4 sm:p-6 mb-8`}>
          {(activeTab === "text" || activeTab === "filtered") && (
            <div>
              {/* JD Selection Dropdown */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Job Description (Optional)
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => {
                    setSelectedJdId(e.target.value);
                    if (e.target.value) {
                      const selectedJD = allJDs.find(jd => jd.id === parseInt(e.target.value));
                      if (selectedJD) {
                        setJdText(selectedJD.content || '');
                      }
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'border-slate-300 text-slate-900'
                  }`}
                  disabled={loadingJDs}
                >
                  <option value="">
                    {loadingJDs ? 'Loading JDs...' : 'Select a saved JD or enter manually below'}
                  </option>
                  {allJDs.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title} - {jd.content ? jd.content.substring(0, 40) + '...' : 'No content'}
                    </option>
                  ))}
                </select>
              </div>

              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Job Description {selectedJdId ? '(Auto-filled from selection)' : ''}
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={6}
                placeholder="Paste your job description here or select from dropdown above..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />

              {activeTab === "filtered" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Minimum Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Experience Match
                    </label>
                    <select
                      value={expMatch}
                      onChange={(e) => setExpMatch(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="all">All Levels</option>
                      <option value="strong">Strong Match</option>
                      <option value="partial">Partial Match</option>
                      <option value="weak">Weak Match</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Max Results
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={topN}
                      onChange={(e) => setTopN(Number(e.target.value))}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "score" && (
            <div className="space-y-6">
              {/* Two Column Layout - Left: Candidate, Right: Job Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN - CANDIDATE SELECTION */}
                <div className="space-y-4">
                  {/* Select Candidate Dropdown */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Select Candidate
                    </label>
                    <select
                      value={candidateName}
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        if (e.target.value) {
                          const selectedCandidate = allCandidates.find(c => c.name === e.target.value);
                          if (selectedCandidate) {
                            setCandidateId(selectedCandidate.id.toString());
                          }
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'border-slate-300 text-slate-900'
                      }`}
                      disabled={loadingCandidates}
                    >
                      <option value="">
                        {loadingCandidates ? 'Loading candidates...' : 'Select a candidate'}
                      </option>
                      {allCandidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.name}>
                          {candidate.name} - {candidate.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Candidate ID Manual Entry */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Candidate ID (Manual Entry)
                    </label>
                    <input
                      type="number"
                      value={candidateId}
                      onChange={(e) => setCandidateId(e.target.value)}
                      placeholder="Enter candidate ID (e.g., 123)"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'border-slate-300 text-slate-900 placeholder-slate-500'
                      }`}
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Use dropdown above or enter ID manually
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN - JOB DESCRIPTION */}
                <div className="space-y-4">
                  {/* Select Job Description Dropdown */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Select Job Description
                    </label>
                    <select
                      value={selectedJdId}
                      onChange={(e) => {
                        setSelectedJdId(e.target.value);
                        if (e.target.value) {
                          const selectedJD = allJDs.find(jd => jd.id === parseInt(e.target.value));
                          if (selectedJD) {
                            setScoreJd(selectedJD.content || '');
                          }
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'border-slate-300 text-slate-900'
                      }`}
                      disabled={loadingJDs}
                    >
                      <option value="">
                        {loadingJDs ? 'Loading JDs...' : 'Select a job description'}
                      </option>
                      {allJDs.map((jd) => (
                        <option key={jd.id} value={jd.id}>
                          {jd.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Description Manual Entry */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Job Description (Manual Entry)
                    </label>
                    <textarea
                      value={scoreJd}
                      onChange={(e) => setScoreJd(e.target.value)}
                      placeholder="Enter job requirements or select from dropdown above..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                          : 'border-slate-300 text-slate-900 placeholder-slate-500'
                      }`}
                    />
                    <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Use dropdown above or enter requirements manually
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={!canSearch || loading}
            className={`mt-6 w-full py-3 sm:py-4 rounded-lg font-medium transition-colors cursor-pointer text-sm sm:text-base ${
              canSearch && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <ButtonLoader text={`Searching...`} />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <HiMagnifyingGlass className="w-4 h-4" />
                {`Search ${activeTab === "score" ? "Candidate" : "Candidates"}`}
              </span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-8`}>
            <p className={`${darkMode ? 'text-red-400' : 'text-red-700'} text-sm sm:text-base`}>
              {error}
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-4 sm:p-6 animate-pulse`}>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full flex-shrink-0`}></div>
                  <div className="flex-1 space-y-3">
                    <div className={`h-4 sm:h-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded w-1/3`}></div>
                    <div className={`h-3 sm:h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded w-2/3`}></div>
                    <div className={`h-3 sm:h-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded w-1/2`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {(results || singleResult) && !loading && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
              <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Search Results
              </h2>
              {results && (
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${
                  darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {totalResults} candidate{totalResults !== 1 ? 's' : ''} found
                </span>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {singleResult && (
                <CandidateCard candidate={singleResult} index={0} darkMode={darkMode} />
              )}
              {results && results.map((candidate, index) => (
                <CandidateCard key={candidate.candidateId || index} candidate={candidate} index={index} darkMode={darkMode} />
              ))}
            </div>

            {results && totalResults === 0 && (
              <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg sm:rounded-xl border p-6 sm:p-12 text-center`}>
                <HiUsers className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <h3 className={`text-base sm:text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  No candidates found
                </h3>
                <p className={`text-xs sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Try adjusting your search criteria or job description.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}