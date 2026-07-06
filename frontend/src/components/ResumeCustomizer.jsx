import { useState, useEffect, useRef } from 'react';
import { jdAPI, searchAPI, resumeAPI, handleAPIError } from '../utils/api';
import {
  HiStar, HiPaintBrush, HiBuildingOffice2, HiDocumentText,
  HiMagnifyingGlass, HiCheckCircle, HiArrowDownTray, HiEnvelope,
  HiXMark, HiChevronDown, HiSparkles, HiUserGroup, HiExclamationTriangle
} from 'react-icons/hi2';
import html2pdf from 'html2pdf.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cleanTitle = (text = '') =>
  text.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim().split('\n')[0].slice(0, 80);

const extractJDTitle = (jd) => {
  if (jd.title && jd.title.trim()) return cleanTitle(jd.title);
  const desc = jd.optimizedJd || jd.originalContent || '';
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const clean = cleanTitle(line);
    if (clean.length > 4 && clean.length < 80) return clean;
  }
  return `JD #${jd.id}`;
};

const TEMPLATES = [
  { id: 'modern',    name: 'Modern',    icon: <HiPaintBrush className="text-3xl text-blue-600" />,   desc: 'Clean & contemporary',  headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700',    accent: 'text-blue-600',   border: 'border-blue-600' },
  { id: 'corporate', name: 'Corporate', icon: <HiBuildingOffice2 className="text-3xl text-slate-600" />, desc: 'Traditional business', headerBg: 'bg-slate-800',                                  accent: 'text-slate-800',  border: 'border-slate-800' },
  { id: 'creative',  name: 'Creative',  icon: <HiStar className="text-3xl text-purple-600" />,        desc: 'Eye-catching & bold',   headerBg: 'bg-gradient-to-r from-purple-600 to-pink-600',   accent: 'text-purple-600', border: 'border-purple-600' },
  { id: 'minimal',   name: 'Minimal',   icon: <HiDocumentText className="text-3xl text-green-600" />, desc: 'Simple & elegant',      headerBg: 'bg-green-600',                                  accent: 'text-green-600',  border: 'border-green-600' },
];

// ─── Resume Preview HTML ──────────────────────────────────────────────────────
const ResumePreview = ({ candidate, templateId, options, previewRef }) => {
  const tpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const d = candidate.fullData || candidate;
  const allSkills = d.skills
    ? Object.values(d.skills).flat().filter(Boolean)
    : [];

  return (
    <div className="bg-white text-black p-8 font-sans text-sm" ref={previewRef}>
      <div className={`${tpl.headerBg} text-white p-6 rounded-lg mb-6`}>
        <h1 className="text-3xl font-bold mb-1">{candidate.name}</h1>
        <p className="opacity-90 text-base">{candidate.title || d.title || ''}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs opacity-80">
          {candidate.email && <span>{candidate.email}</span>}
          {d.phone && <span>{d.phone}</span>}
          {d.location && <span>{d.location}</span>}
        </div>
      </div>

      {candidate.summary && (
        <div className="mb-5">
          <h2 className={`text-base font-bold ${tpl.accent} mb-2 border-b-2 ${tpl.border} pb-1`}>Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
        </div>
      )}

      {d.experience?.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-base font-bold ${tpl.accent} mb-2 border-b-2 ${tpl.border} pb-1`}>Experience</h2>
          {d.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-gray-800">{exp.jobTitle || 'Position'}</p>
                  <p className={`${tpl.accent} font-semibold text-xs`}>{exp.companyName || 'Company'}</p>
                </div>
                <span className="text-gray-500 text-xs">{exp.startDate} {exp.endDate ? `– ${exp.endDate}` : '– Present'}</span>
              </div>
              {exp.description && <p className="text-gray-600 text-xs mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {d.education?.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-base font-bold ${tpl.accent} mb-2 border-b-2 ${tpl.border} pb-1`}>Education</h2>
          {d.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-gray-800">{edu.degree || 'Degree'}</p>
              <p className={`${tpl.accent} text-xs`}>{edu.institution}</p>
              {edu.graduationYear && <p className="text-gray-500 text-xs">{edu.graduationYear}</p>}
            </div>
          ))}
        </div>
      )}

      {allSkills.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-base font-bold ${tpl.accent} mb-2 border-b-2 ${tpl.border} pb-1`}>Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {allSkills.map((s, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-xs text-white ${tpl.headerBg}`}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {options.includeCoverLetter && (
        <div className="mt-6 pt-4 border-t-2 border-gray-200">
          <h2 className={`text-base font-bold ${tpl.accent} mb-2`}>Cover Letter</h2>
          <p className="text-gray-700 leading-relaxed text-xs">
            Dear Hiring Manager,<br /><br />
            I am writing to express my strong interest in this position. With my background in {candidate.title || 'the relevant field'} and proven track record, I am confident in my ability to contribute to your team.<br /><br />
            Thank you for considering my application.<br /><br />
            Best regards,<br />{candidate.name}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ResumeCustomizer = ({ darkMode }) => {
  // JD state
  const [jds, setJds] = useState([]);
  const [jdsLoading, setJdsLoading] = useState(true);
  const [selectedJD, setSelectedJD] = useState(null);

  // Candidates state
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  // Template + options
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [options, setOptions] = useState({ includeCoverLetter: false, includeReferences: false });

  // Preview / generate
  const [previewCandidate, setPreviewCandidate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedTemplate, setUploadedTemplate] = useState(null);
  const previewRef = useRef(null);

  // ── Fetch JDs on mount ──
  useEffect(() => {
    jdAPI.getAll()
      .then(data => setJds(Array.isArray(data) ? data : []))
      .catch(() => setJds([]))
      .finally(() => setJdsLoading(false));
  }, []);

  // ── Fetch candidates when JD selected ──
  const handleJDSelect = async (jd) => {
    setSelectedJD(jd);
    setMatchedCandidates([]);
    setSelectedCandidateIds([]);
    setSearchQuery('');
    setCandidatesError(null);
    if (!jd) return;

    setCandidatesLoading(true);
    try {
      const jdContent = jd.optimizedJd || jd.originalContent || '';
      const result = await searchAPI.byJDText(jdContent);
      const list = Array.isArray(result) ? result : (result?.candidates || result?.data || []);
      const mapped = list.map((c, idx) => ({
        id: c.id ?? c.candidateId ?? c.userId ?? `idx-${idx}`,
        name: c.name || c.candidateName || c.username || 'N/A',
        email: c.email || 'N/A',
        title: c.title || c.jobTitle || '',
        score: c.score ?? c.matchScore ?? c.similarityScore ?? 0,
        summary: c.summary || '',
        fullData: c,
      }));
      setMatchedCandidates(mapped);
    } catch (err) {
      setCandidatesError(handleAPIError(err));
    } finally {
      setCandidatesLoading(false);
    }
  };

  // ── Candidate selection ──
  const toggleCandidate = (id) => {
    if (id === undefined || id === null) return;
    setSelectedCandidateIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visible = filteredCandidates.map(c => c.id);
    const allSelected = visible.every(id => selectedCandidateIds.includes(id));
    setSelectedCandidateIds(allSelected
      ? selectedCandidateIds.filter(id => !visible.includes(id))
      : [...new Set([...selectedCandidateIds, ...visible])]
    );
  };

  const filteredCandidates = matchedCandidates.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
  });

  // ── Generate preview ──
  const handleGenerate = (candidate) => {
    setPreviewCandidate(candidate);
    setShowPreview(true);
  };

  // ── Download PDF ──
  const handleDownload = () => {
    if (!previewRef.current || !previewCandidate) return;
    html2pdf().set({
      margin: 10,
      filename: `${previewCandidate.name}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    }).from(previewRef.current).save();
  };

  // ── Send email ──
  const handleSendEmail = async () => {
    if (!previewCandidate) return;
    setSendingEmail(true);
    setError(null);
    try {
      const res = await resumeAPI.sendResumeEmail(previewCandidate.id, {
        template: selectedTemplate,
        candidateName: previewCandidate.name,
        candidateEmail: previewCandidate.email,
        ...options,
      });
      if (res?.success) {
        alert(`Resume sent to ${previewCandidate.email}`);
        setShowPreview(false);
      } else {
        setError(res?.error || 'Failed to send email');
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setSendingEmail(false);
    }
  };

  const card = `rounded-xl border shadow-sm p-5 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`;
  const label = `block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const inputCls = `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`;

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Resume Customizer</h2>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Select a JD → pick matched candidates → generate custom resumes</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-semibold">
          <HiStar className="w-3.5 h-3.5" />Premium
        </span>
      </div>

      {error && (
        <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 text-sm ${darkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <HiExclamationTriangle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── LEFT: JD + Candidates ── */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* JD Selector */}
          <div className={card}>
            <p className={label}>STEP 1 — SELECT JOB DESCRIPTION</p>
            {jdsLoading ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading JDs...</span>
              </div>
            ) : jds.length === 0 ? (
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No JDs found. Upload a JD first.</p>
            ) : (
              <div className="relative">
                <select
                  onChange={e => {
                    const jd = jds.find(j => String(j.id) === e.target.value);
                    handleJDSelect(jd || null);
                  }}
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  defaultValue=""
                >
                  <option value="" disabled>Choose a job description...</option>
                  {jds.map((jd, idx) => (
                    <option key={jd.id ?? idx} value={jd.id}>{extractJDTitle(jd)}</option>
                  ))}
                </select>
                <HiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>
            )}

            {selectedJD && (
              <div className={`mt-3 p-3 rounded-lg text-xs ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 text-blue-800'}`}>
                <span className="font-semibold">Selected:</span> {extractJDTitle(selectedJD)}
              </div>
            )}
          </div>

          {/* Matched Candidates */}
          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <p className={label}>STEP 2 — SELECT CANDIDATES</p>
              {matchedCandidates.length > 0 && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {selectedCandidateIds.length} / {matchedCandidates.length} selected
                </span>
              )}
            </div>

            {!selectedJD ? (
              <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
                <HiSparkles className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">Select a JD above to see matched candidates</p>
              </div>
            ) : candidatesLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Finding matched candidates...</p>
                </div>
              </div>
            ) : candidatesError ? (
              <div className={`p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}`}>{candidatesError}</div>
            ) : matchedCandidates.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
                <HiUserGroup className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No candidates matched for this JD</p>
              </div>
            ) : (
              <>
                {/* Search + Select All */}
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <HiMagnifyingGlass className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`${inputCls} pl-8 py-2`}
                    />
                  </div>
                  <button
                    onClick={toggleAll}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      filteredCandidates.every(c => selectedCandidateIds.includes(c.id))
                        ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                        : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filteredCandidates.every(c => selectedCandidateIds.includes(c.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Candidate List */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {filteredCandidates.map((candidate, idx) => {
                    const isSelected = selectedCandidateIds.includes(candidate.id) || 
                                       selectedCandidateIds.includes(String(candidate.id));
                    return (
                      <div
                        key={candidate.id ?? idx}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                            : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
                        }`}
                        onClick={() => toggleCandidate(candidate.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCandidate(candidate.id)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded cursor-pointer accent-blue-600 flex-shrink-0"
                        />
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isSelected ? 'bg-blue-600' : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</p>
                          <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.email}</p>
                          {candidate.title && <p className={`text-xs truncate ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{candidate.title}</p>}
                        </div>
                        {candidate.score > 0 && (
                          <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                            candidate.score >= 80 ? 'bg-green-100 text-green-700' : candidate.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {candidate.score}%
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); handleGenerate(candidate); }}
                          className="flex-shrink-0 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          Preview
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: Template + Options ── */}
        <div className="flex flex-col gap-5">
          <div className={card}>
            <p className={label}>STEP 3 — UPLOAD TEMPLATE</p>

            {/* Template grid — commented out for now */}
            {/* <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-3 border-2 rounded-xl cursor-pointer transition-all text-center ${
                    selectedTemplate === t.id
                      ? darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                      : darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">{t.icon}</div>
                  <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.name}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.desc}</p>
                  {selectedTemplate === t.id && (
                    <div className="flex items-center justify-center gap-1 mt-1.5 text-blue-600 text-xs">
                      <HiCheckCircle className="w-3 h-3" />Selected
                    </div>
                  )}
                </div>
              ))}
            </div> */}

            {/* Upload Template */}
            <label
              className={`flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                uploadedTemplate
                  ? darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                  : darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-blue-400'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.html,.txt"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setUploadedTemplate(f);
                  e.target.value = '';
                }}
              />
              {uploadedTemplate ? (
                <>
                  <HiCheckCircle className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <p className={`text-sm font-semibold truncate max-w-[180px] ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {uploadedTemplate.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {(uploadedTemplate.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); setUploadedTemplate(null); }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <HiXMark className="w-3 h-3" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <HiDocumentText className={`w-10 h-10 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Click to upload template
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      PDF, DOC, DOCX, HTML, TXT
                    </p>
                  </div>
                </>
              )}
            </label>

            {!uploadedTemplate && (
              <p className={`text-xs mt-2 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Upload any resume template file — candidate data will be mapped onto it
              </p>
            )}
          </div>

          <div className={card}>
            <p className={label}>OPTIONS</p>
            <div className="space-y-3">
              {[
                ['includeCoverLetter', 'Add cover letter'],
                ['includeReferences', 'Include references'],
              ].map(([key, lbl]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={e => setOptions(p => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                  />
                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{lbl}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate for selected */}
          {selectedCandidateIds.length > 0 && (
            <div className={card}>
              <p className={label}>GENERATE RESUMES</p>
              <p className={`text-xs mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {selectedCandidateIds.length} candidate{selectedCandidateIds.length > 1 ? 's' : ''} selected
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {matchedCandidates.filter(c => selectedCandidateIds.includes(c.id)).map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleGenerate(c)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all cursor-pointer"
                  >
                    <HiDocumentText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {showPreview && previewCandidate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Resume Preview</h3>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{previewCandidate.name} · {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className={`p-1.5 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <ResumePreview candidate={previewCandidate} templateId={selectedTemplate} options={options} previewRef={previewRef} />
            </div>

            <div className={`flex gap-3 px-5 py-4 border-t flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <HiArrowDownTray className="w-4 h-4" />Download PDF
              </button>
              <button onClick={handleSendEmail} disabled={sendingEmail} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${sendingEmail ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                <HiEnvelope className="w-4 h-4" />{sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
              <button onClick={() => setShowPreview(false)} className={`px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeCustomizer;
