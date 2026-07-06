import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jdAPI, searchAPI, handleAPIError } from '../utils/api';
import { HiDocumentText, HiMagnifyingGlass, HiTrash, HiEye, HiCalendar, HiCheckCircle, HiEnvelope, HiPhone, HiBriefcase, HiArrowLeft, HiArrowRight, HiXMark } from 'react-icons/hi2';
import { PageLoader } from './PageLoader';

const UploadedJDs = ({ darkMode }) => {
  const navigate = useNavigate();
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Matching state
  const [selectedJD, setSelectedJD] = useState(null);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [matching, setMatching] = useState(false);
  const [showMatches, setShowMatches] = useState(false);

  // Candidate selection for pipeline
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  useEffect(() => {
    fetchJDs();
  }, []);

  const fetchJDs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real JDs from backend
      const data = await jdAPI.getAll();
      console.log('Fetched JDs:', data);
      
      // Function to extract title from JD content
      const extractTitleFromContent = (content) => {
        if (!content) return 'Untitled JD';
        
        // Try to find job title patterns in the content
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
          
          // Skip very short lines or lines with common prefixes
          if (line.length < 3 || 
              line.toLowerCase().startsWith('job description') ||
              line.toLowerCase().startsWith('position:') ||
              line.toLowerCase().startsWith('role:')) {
            continue;
          }
          
          // Check against patterns
          for (const pattern of titlePatterns) {
            const match = line.match(pattern);
            if (match && match[2]) {
              return cleanTitle(match[2]);
            }
          }
          
          // If first line looks like a title (not too long, not starting with common words)
          if (i === 0 && line.length <= 100 && 
              !line.toLowerCase().startsWith('we are') &&
              !line.toLowerCase().startsWith('about') &&
              !line.toLowerCase().startsWith('company')) {
            return cleanTitle(line);
          }
        }
        
        // Fallback: use first meaningful line or extract from keywords
        const firstLine = lines[0];
        if (firstLine && firstLine.length <= 100) {
          return cleanTitle(firstLine);
        }
        
        // Try to find job-related keywords and create a title
        const jobKeywords = content.toLowerCase().match(/(software engineer|developer|manager|analyst|designer|consultant|specialist|coordinator|director|lead|senior|junior|full.?stack|frontend|backend|devops|data scientist|product manager)/i);
        if (jobKeywords) {
          return jobKeywords[0].replace(/\b\w/g, l => l.toUpperCase()) + ' Position';
        }
        
        return 'Job Position';
      };
      
      // Transform backend data to required format
      const transformedJDs = data.map(jd => {
        const content = jd.optimizedJd || jd.originalContent || jd.content || '';
        return {
          id: jd.id,
          title: extractTitleFromContent(content),
          description: content || 'No description available',
          uploadDate: jd.createdAt || jd.uploadDate || new Date().toISOString(),
          status: jd.status === 'SUCCESS' ? 'Active' : (jd.status || 'Active'),
          matchedCandidates: jd.matchedCandidates || 0,
        };
      });
      
      setJds(transformedJDs);
    } catch (err) {
      console.error('Failed to fetch JDs:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this JD?');
    if (!confirmed) return;

    try {
      // Call actual delete API
      await jdAPI.delete(id);
      setJds(jds.filter(jd => jd.id !== id));
      alert('JD deleted successfully!');
    } catch (err) {
      console.error('Failed to delete JD:', err);
      alert(`Failed to delete JD: ${handleAPIError(err)}`);
    }
  };

  const handleViewMatches = async (jd) => {
    setSelectedJD(jd);
    setMatching(true);
    setShowMatches(true);
    setError(null);

    try {
      // Use the by-jd-text API to get matched candidates
      const jdContent = jd.description || '';
      const response = await searchAPI.byJDText(jdContent);
      
      // Handle different response formats
      let matchedResults = [];
      if (Array.isArray(response)) {
        matchedResults = response;
      } else if (response.candidates && Array.isArray(response.candidates)) {
        matchedResults = response.candidates;
      } else if (response.data && Array.isArray(response.data)) {
        matchedResults = response.data;
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
      }
      
      // Transform the results — assign guaranteed unique _uid for selection
      const transformedResults = matchedResults.map((candidate, index) => ({
        ...candidate,
        _uid: String(candidate.id ?? candidate.candidateId ?? candidate.userId ?? `row-${index}`),
        rank: index + 1,
        matchScore: candidate.score || 0,
        matchReasons: candidate.matchReasons || generateMatchReasons(candidate, jdContent),
      }));

      setMatchedCandidates(transformedResults);
    } catch (err) {
      console.error('Matching failed:', err);
      setError(handleAPIError(err));
    } finally {
      setMatching(false);
    }
  };

  const generateMatchReasons = (candidate, jdContent) => {
    const reasons = [];
    
    // If backend provided match reasons, use those
    if (candidate.matchReasons && Array.isArray(candidate.matchReasons)) {
      return candidate.matchReasons;
    }
    
    // Fallback: Generate basic reasons from candidate data
    if (candidate.matchedSkills && candidate.matchedSkills.length > 0) {
      reasons.push(`Matched ${candidate.matchedSkills.length} required skills: ${candidate.matchedSkills.slice(0, 3).join(', ')}`);
    }
    
    if (candidate.totalExperienceYears) {
      reasons.push(`${candidate.totalExperienceYears} years of relevant experience`);
    }
    
    if (candidate.education && candidate.education.length > 0) {
      reasons.push(`${candidate.education[0].degree || 'Relevant education'}`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Profile matches job requirements');
    }
    
    return reasons;
  };

  const handleBackToList = () => {
    setShowMatches(false);
    setSelectedJD(null);
    setMatchedCandidates([]);
    setSelectedCandidateIds([]);
    setCandidateSearch('');
  };

  const toggleCandidateSelect = (uid) => {
    if (!uid) return;
    setSelectedCandidateIds(prev =>
      prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]
    );
  };

  const handleAddToPipeline = () => {
    const selected = matchedCandidates.filter(c => selectedCandidateIds.includes(c._uid));
    const pipelineCards = selected.map(c => {
      let tags = [];
      if (c.skills) {
        if (Array.isArray(c.skills)) {
          tags = c.skills.slice(0, 3).map(s => s.name || s);
        } else if (typeof c.skills === 'object') {
          tags = Object.values(c.skills).flat().filter(Boolean).slice(0, 3);
        }
      }
      return {
        id: c._uid,
        name: c.name || 'N/A',
        role: c.title || c.role || 'Candidate',
        exp: c.totalExperienceYears || c.exp || 0,
        location: c.location || 'N/A',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        tags,
        score: c.score || c.matchScore || 0,
      };
    });

    if (pipelineCards.length === 0) return;

    // Merge with existing pipeline_applied in localStorage
    const existing = JSON.parse(localStorage.getItem('pipeline_applied') || '[]');
    const existingIds = new Set(existing.map(c => c.id));
    const merged = [...existing, ...pipelineCards.filter(c => !existingIds.has(c.id))];
    localStorage.setItem('pipeline_applied', JSON.stringify(merged));
    navigate('/hiring-pipeline');
  };

  // Filtered matched candidates by search
  const filteredMatchedCandidates = matchedCandidates.filter(c => {
    const q = candidateSearch.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.title || '').toLowerCase().includes(q);
  });

  // Normalize IDs to string for consistent comparison
  const isSelected = (uid) => selectedCandidateIds.includes(uid);

  const filteredJDs = jds.filter(jd => {
    const query = searchQuery.toLowerCase();
    return (
      jd.title.toLowerCase().includes(query) ||
      jd.description.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <PageLoader message="Loading job descriptions..." darkMode={darkMode} />;
  }

  return (
    <div className={`p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Show Matches View */}
      {showMatches && selectedJD ? (
        <div>
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBackToList}
              className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                darkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HiArrowLeft className="w-5 h-5" />
              Back to JD List
            </button>
            
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Matching Candidates for: {selectedJD.title}
            </h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              {selectedJD.description.length > 200 
                ? `${selectedJD.description.substring(0, 200)}...` 
                : selectedJD.description
              }
            </p>
          </div>

          {/* Loading State */}
          {matching && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Finding matching candidates...</p>
              </div>
            </div>
          )}

          {/* Matched Candidates */}
          {!matching && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {matchedCandidates.length > 0 ? `Top ${matchedCandidates.length} Matching Candidates` : 'No Matches Found'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {matchedCandidates.length > 0 ? 'Ranked by AI match score' : 'Try uploading more resumes'}
                  </p>
                </div>
              </div>

              {matchedCandidates.length === 0 ? (
                <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-12 text-center`}>
                  <HiMagnifyingGlass className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>No Matching Candidates Found</h3>
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>No candidates in your talent pool match this job description.</p>
                </div>
              ) : (
                <>
                  {/* Search bar for candidates */}
                  <div className="relative mb-4">
                    <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Search candidates by name, email or role..."
                      value={candidateSearch}
                      onChange={e => setCandidateSearch(e.target.value)}
                      className={`w-full pl-10 pr-9 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                    {candidateSearch && (
                      <button onClick={() => setCandidateSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                        <HiXMark className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                      </button>
                    )}
                  </div>

                  {/* Select all / deselect */}
                  {filteredMatchedCandidates.length > 0 && (
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => {
                          const visibleIds = filteredMatchedCandidates.map(c => c._uid);
                          const allSel = visibleIds.every(id => selectedCandidateIds.includes(id));
                          setSelectedCandidateIds(allSel
                            ? selectedCandidateIds.filter(id => !visibleIds.includes(id))
                            : [...new Set([...selectedCandidateIds, ...visibleIds])]
                          );
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                          darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {filteredMatchedCandidates.every(c => selectedCandidateIds.includes(c._uid)) ? 'Deselect All' : 'Select All'}
                      </button>
                      {selectedCandidateIds.length > 0 && (
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {selectedCandidateIds.length} selected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 pb-20">
                    {filteredMatchedCandidates.map((candidate, index) => {
                      const sel = isSelected(candidate._uid);
                      return (
                    <div 
                      key={candidate._uid}
                      onClick={() => toggleCandidateSelect(candidate._uid)}
                      className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-6 cursor-pointer transition-all ${
                        sel
                          ? darkMode ? 'border-blue-500 bg-blue-900/10' : 'border-blue-500 bg-blue-50'
                          : darkMode ? 'hover:border-slate-600' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => toggleCandidateSelect(candidate._uid)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 mt-1 accent-blue-600 cursor-pointer flex-shrink-0"
                        />
                        {/* Rank Badge */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base font-bold mb-2">
                            #{index + 1}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{candidate.matchScore}%</div>
                            <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Match</div>
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          {/* Header with Name and Actions */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                {candidate.name || 'N/A'}
                              </h4>
                              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {candidate.education?.[0]?.degree || 'Education not specified'}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4 flex-shrink-0">
                              <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                                Send Message
                              </button>
                              <button 
                                onClick={() => navigate(`/candidate/${candidate.id}`)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                View Profile
                              </button>
                            </div>
                          </div>

                          {/* Contact Info Row */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              <HiEnvelope className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{candidate.email || 'N/A'}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              <HiPhone className="w-4 h-4 flex-shrink-0" />
                              <span>{candidate.phone || 'N/A'}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              <HiBriefcase className="w-4 h-4 flex-shrink-0" />
                              <span>{candidate.totalExperience || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Skills Section */}
                          <div className="mb-4">
                            <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              Skills:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills && candidate.skills.length > 0 ? (
                                candidate.skills.slice(0, 8).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                                  >
                                    {skill.name || skill}
                                  </span>
                                ))
                              ) : (
                                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  No skills listed
                                </span>
                              )}
                              {candidate.skills && candidate.skills.length > 8 && (
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  +{candidate.skills.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Match Reasons */}
                          <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                            <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-green-400' : 'text-green-900'}`}>
                              <HiCheckCircle className="w-4 h-4" />
                              Why this candidate matches:
                            </p>
                            <ul className="space-y-1">
                              {candidate.matchReasons && candidate.matchReasons.length > 0 ? (
                                candidate.matchReasons.map((reason, idx) => (
                                  <li key={idx} className={`text-sm flex items-start gap-2 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></span>
                                    <span>{reason}</span>
                                  </li>
                                ))
                              ) : (
                                <li className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                                  Profile matches job requirements
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Floating Next Button */}
          {selectedCandidateIds.length > 0 && (
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={handleAddToPipeline}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl shadow-2xl hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm animate-bounce-once"
              >
                Add {selectedCandidateIds.length} to Pipeline
                <HiArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* JD List View */
        <div>
          {/* Header */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Uploaded Job Descriptions
            </h2>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              View and manage all uploaded job descriptions
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
              <p className={darkMode ? 'text-red-400' : 'text-red-700'}>{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-6`}>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total JDs</h3>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{jds.length}</p>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-6`}>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Active JDs</h3>
              <p className="text-3xl font-bold text-green-600">
                {jds.filter(jd => jd.status === 'Active').length}
              </p>
            </div>
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-6`}>
              <h3 className={`text-sm mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Matches</h3>
              <p className="text-3xl font-bold text-blue-600">
                {jds.reduce((sum, jd) => sum + jd.matchedCandidates, 0)}
              </p>
            </div>
          </div> */}

          {/* Search and Filter */}
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm mb-6`}>
            <div className="p-6 border-b border-slate-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                />
                <HiMagnifyingGlass className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`} />
              </div>
            </div>

            {/* JD List */}
            <div className="p-6">
              {filteredJDs.length === 0 ? (
                <div className="text-center py-12">
                  <HiDocumentText className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    No JDs Found
                  </h3>
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                    {searchQuery ? 'Try adjusting your search' : 'Upload your first job description to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJDs.map((jd) => (
                    <div
                      key={jd.id}
                      className={`border rounded-lg p-6 transition-all ${
                        darkMode
                          ? 'border-slate-700 bg-slate-700/50 hover:bg-slate-700'
                          : 'border-slate-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              {jd.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              jd.status === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {jd.status}
                            </span>
                          </div>
                          <p className={`mb-3 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {jd.description.length > 150 
                              ? `${jd.description.substring(0, 150)}...` 
                              : jd.description
                            }
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              <HiCalendar className="w-4 h-4" />
                              <span>Uploaded: {new Date(jd.uploadDate).toLocaleDateString()}</span>
                            </div>
                            {/* <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              <HiCheckCircle className="w-4 h-4" />
                              <span>{jd.matchedCandidates} Matched Candidates</span>
                            </div> */}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewMatches(jd)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <HiEye className="w-4 h-4" />
                          View Matches
                        </button>
                        <button
                          onClick={() => handleDelete(jd.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                            darkMode
                              ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <HiTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedJDs;
