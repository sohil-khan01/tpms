import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesAPI, handleAPIError } from '../utils/api';
import { HiExclamationTriangle, HiMagnifyingGlass } from 'react-icons/hi2';
import ImageZoomModal from './ImageZoomModal';
import { PageLoader } from './PageLoader';

const SOURCE_LABELS = {
  LINKEDIN_SOURCED: 'LinkedIn',
  FACEBOOK: 'Facebook',
  AGENCY: 'Agency',
  COMPANY_HIRE: 'Company Hire',
  REFERRAL: 'Referral',
  JOB_PORTAL: 'Job Portal',
  CAMPUS_HIRE: 'Campus Hire',
  DIRECT_APPLY: 'Direct Apply',
  INTERNAL_TRANSFER: 'Internal Transfer',
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  PASSIVE: 'Passive',
};

const formatSource = (val) => SOURCE_LABELS[val] || val || 'Unknown';
const formatStatus = (val) => STATUS_LABELS[val] || val || 'Unknown';

const getSourceBadgeClass = (raw) => {
  const val = SOURCE_LABELS[raw] || raw || '';
  if (val === 'LinkedIn')       return 'bg-blue-100 text-blue-700';
  if (val === 'Facebook')       return 'bg-indigo-100 text-indigo-700';
  if (val === 'Agency')         return 'bg-purple-100 text-purple-700';
  if (val === 'Company Hire')   return 'bg-teal-100 text-teal-700';
  if (val === 'Referral')       return 'bg-orange-100 text-orange-700';
  if (val === 'Job Portal')     return 'bg-cyan-100 text-cyan-700';
  if (val === 'Campus Hire')    return 'bg-pink-100 text-pink-700';
  if (val === 'Direct Apply')   return 'bg-blue-100 text-blue-700';
  if (val === 'Internal Transfer') return 'bg-violet-100 text-violet-700';
  return 'bg-slate-100 text-slate-600';
};

const AllCandidates = ({ darkMode, onViewCandidate }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImages, setProfileImages] = useState({});

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  // Image zoom state
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);

  // Debounce search input — wait 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // reset to first page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch candidates from backend
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await candidatesAPI.getAll(page, pageSize, sortBy, sortDir, debouncedSearch);

        // Backend returns nested Page object: { page: { content: [....], totalElements, totalPages, ... }, ... }
        const pageData = data.page || data;
        const list = Array.isArray(pageData.content) ? pageData.content : (Array.isArray(data.content) ? data.content : []);
        
        // Handle different response formats
        const totalElem = pageData.totalElements || data.totalElements || list.length;
        const totalPgs = pageData.totalPages || data.totalPages || Math.ceil(totalElem / pageSize);
        
        console.log('Backend response structure:', {
          hasPageObject: !!data.page,
          pageData: pageData,
          totalElements: totalElem,
          totalPages: totalPgs,
          listLength: list.length
        });
        
        setTotalElements(totalElem);
        setTotalPages(totalPgs);

        console.log('Raw API response:', data);
        console.log('Response keys:', Object.keys(data));
        console.log('Pagination data:', { 
          totalElements: data.totalElements, 
          totalPages: data.totalPages,
          number: data.number,
          size: data.size,
          numberOfElements: data.numberOfElements,
          listLength: list.length,
          page,
          pageSize,
          isLastPage: page >= (data.totalPages - 1),
          nextPageDisabled: page >= (data.totalPages - 1)
        });

        const transformedCandidates = list.map(candidate => {
          let skillsArray = [];
          if (candidate.skills) {
            if (typeof candidate.skills === 'object' && !Array.isArray(candidate.skills)) {
              skillsArray = [
                ...(Array.isArray(candidate.skills.frontEnd)  ? candidate.skills.frontEnd  : []),
                ...(Array.isArray(candidate.skills.backEnd)   ? candidate.skills.backEnd   : []),
                ...(Array.isArray(candidate.skills.databases) ? candidate.skills.databases : []),
                ...(Array.isArray(candidate.skills.devops)    ? candidate.skills.devops    : []),
                ...(Array.isArray(candidate.skills.other)     ? candidate.skills.other     : []),
              ].map(skill => ({ name: skill }));
            } else if (Array.isArray(candidate.skills)) {
              skillsArray = candidate.skills;
            }
          }

          // Extract education degree from education array
          let educationDisplay = 'Not specified';
          let institutionDisplay = '';
          if (Array.isArray(candidate.education) && candidate.education.length > 0) {
            const latestEducation = candidate.education[0];
            if (latestEducation.degree) {
              educationDisplay = latestEducation.degree;
            }
            if (latestEducation.institution) {
              institutionDisplay = latestEducation.institution;
            }
          } else if (candidate.department) {
            educationDisplay = candidate.department;
          }

          return {
            id: candidate.id,
            name: candidate.name || 'N/A',
            email: candidate.email || 'N/A',
            phone: candidate.phone || 'N/A',
            skills: skillsArray,
            experience: candidate.totalExperience || 'N/A',
            education: educationDisplay,
            educationInstitution: institutionDisplay,
            uploadDate: candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString('en-GB') : 'N/A',
            lastUpdated: candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleDateString('en-GB') : 'N/A',
            matchScore: candidate.matchScore || 0,
            source: candidate.candidateSource,
            status: candidate.candidateThread,
          };
        });

        setCandidates(transformedCandidates);

        // Fetch profile images for all candidates
        transformedCandidates.forEach(async (candidate) => {
          try {
            const imageUrl = await candidatesAPI.getProfileImage(candidate.id);
            if (imageUrl) {
              setProfileImages(prev => ({ ...prev, [candidate.id]: imageUrl }));
            }
          } catch {
            console.log(`No profile image for candidate ${candidate.id}`);
          }
        });
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [page, pageSize, sortBy, sortDir, debouncedSearch]);

  // Apply client-side skill filter only (name/email search is server-side now)
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSkill = !filterSkill || 
      (Array.isArray(candidate.skills) && candidate.skills.some(skill =>
        skill.name?.toLowerCase().includes(filterSkill.toLowerCase())
      ));
    return matchesSkill;
  });

  // Reset to page 0 when skill filter changes
  useEffect(() => {
    setPage(0);
  }, [filterSkill]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="ml-1 opacity-30">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return <PageLoader message="Loading candidates..." darkMode={darkMode} />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-6 text-center`}>
          <HiExclamationTriangle className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
            Failed to Load Candidates
          </h3>
          <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        All Candidates
      </h2>
      <p className={`mb-6 sm:mb-8 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Browse and manage your talent pool ({totalElements} total)
      </p>

      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg sm:rounded-xl border shadow-sm`}>
        <div className={`p-4 sm:p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <HiMagnifyingGlass className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>
            <input
              type="text"
              placeholder="Filter by skill..."
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className={`w-full sm:w-48 px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            <select
              value={pageSize.toString()}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className={`w-full sm:w-32 px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {[5, 10, 20, 50].map(n => (
                <option key={n} value={n.toString()}>{n} / page</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
              <tr>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sr. No.</th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('name')}
                >Candidate <SortIcon field="name" /></th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('email')}
                >Contact <SortIcon field="email" /></th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('education')}
                >Education <SortIcon field="education" /></th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('candidateSource')}
                >Source <SortIcon field="candidateSource" /></th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('candidateThread')}
                >Status <SortIcon field="candidateThread" /></th>
                <th
                  className={`text-left p-4 text-sm font-semibold cursor-pointer select-none ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}
                  onClick={() => handleSort('updatedAt')}
                >Updated At <SortIcon field="updatedAt" /></th>
                <th className={`text-left p-4 text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate, index) => (
                <tr key={candidate.id} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <td className="p-4">
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {page * pageSize + index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {profileImages[candidate.id] ? (
                        <img 
                          src={profileImages[candidate.id]} 
                          alt={candidate.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setSelectedImageId(candidate.id);
                            setShowImageZoom(true);
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ display: profileImages[candidate.id] ? 'none' : 'flex' }}
                      >
                        {candidate.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{candidate.email}</p>
                      <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{candidate.phone}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {candidate.education && candidate.education !== 'Not specified' ? (
                        <>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {candidate.education}
                          </p>
                          {candidate.educationInstitution && (
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {candidate.educationInstitution}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                          Not specified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSourceBadgeClass(candidate.source)}`}>
                      {formatSource(candidate.source)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      STATUS_LABELS[candidate.status] === 'Active' || candidate.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_LABELS[candidate.status] === 'Active' || candidate.status === 'Active'
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      {formatStatus(candidate.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {candidate.updatedAt}
                    </span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => {
                        onViewCandidate && onViewCandidate(candidate.id);
                        navigate(`/candidate/${candidate.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-4">
          {filteredCandidates.map((candidate, index) => (
            <div 
              key={candidate.id} 
              className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}
            >
              {/* Card Header - Name & Avatar */}
              <div className="flex items-center gap-3 mb-4">
                {profileImages[candidate.id] ? (
                  <img 
                    src={profileImages[candidate.id]} 
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setSelectedImageId(candidate.id);
                      setShowImageZoom(true);
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ display: profileImages[candidate.id] ? 'none' : 'flex' }}
                >
                  {candidate.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {page * pageSize + index + 1}. {candidate.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {candidate.email}
                  </p>
                </div>
              </div>

              {/* Card Content - Grid Layout */}
              <div className="space-y-3">
                {/* Phone */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone</span>
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{candidate.phone}</span>
                </div>

                {/* Education */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Education</span>
                  <div className="text-right">
                    {candidate.education && candidate.education !== 'Not specified' ? (
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {candidate.education}
                        </p>
                        {candidate.educationInstitution && (
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {candidate.educationInstitution}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Not specified
                      </span>
                    )}
                  </div>
                </div>

                {/* Source & Status - Side by side */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Source</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeClass(candidate.source)}`}>
                      {formatSource(candidate.source)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_LABELS[candidate.status] === 'Active' || candidate.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_LABELS[candidate.status] === 'Active' || candidate.status === 'Active'
                          ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      {formatStatus(candidate.status)}
                    </span>
                  </div>
                </div>

                {/* Updated At */}
                <div className="flex justify-between items-start">
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Updated</span>
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {candidate.updatedAt}
                  </span>
                </div>
              </div>

              {/* Card Footer - Action Button */}
              <button 
                onClick={() => {
                  onViewCandidate && onViewCandidate(candidate.id);
                  navigate(`/candidate/${candidate.id}`);
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm cursor-pointer transition-colors"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && !loading && (
          <div className="p-12 text-center">
            <HiMagnifyingGlass className={`text-6xl mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              No candidates found
            </h3>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {totalElements === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, totalElements)} of {totalElements}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Previous
              </button>

              <div className="items-center gap-1">
              {(() => {
                const items = [];
                const delta = 2;

                if (totalPages <= 1) return null;

                // Show all pages if totalPages <= 5
                if (totalPages <= 5) {
                  for (let i = 0; i < totalPages; i++) {
                    items.push(i);
                  }
                } else {
                  // Show first page
                  items.push(0);

                  // Calculate range around current page
                  const rangeStart = Math.max(1, page - delta);
                  const rangeEnd = Math.min(totalPages - 2, page + delta);

                  // Add ellipsis before range if needed
                  if (rangeStart > 1) items.push('...');

                  // Add page range
                  for (let i = rangeStart; i <= rangeEnd; i++) {
                    items.push(i);
                  }

                  // Add ellipsis after range if needed
                  if (rangeEnd < totalPages - 2) items.push('...');

                  // Show last page
                  items.push(totalPages - 1);
                }

                return items.map((item, idx) =>
                  item === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className={`px-2 py-1.5 text-sm select-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        page === item
                          ? 'bg-blue-600 text-white'
                          : darkMode
                            ? 'text-slate-300 hover:bg-slate-700'
                            : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                );
              })()}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  page >= totalPages - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showImageZoom}
        imageUrl={selectedImageId && profileImages[selectedImageId] ? profileImages[selectedImageId] : ''}
        imageName={selectedImageId ? candidates.find(c => c.id === selectedImageId)?.name : ''}
        onClose={() => {
          setShowImageZoom(false);
          setSelectedImageId(null);
        }}
      />
    </div>
  );
};

export default AllCandidates;
