import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  HiMagnifyingGlass, HiBriefcase, HiClock, HiMapPin,
  HiEnvelope, HiPhone, HiXMark, HiSparkles,
  HiChevronRight, HiFunnel, HiDocumentText, HiChevronDown
} from 'react-icons/hi2';
import { InlineLoader } from './PageLoader';
import { jdAPI, handleAPIError, pipelineAPI, candidatesAPI, testResultsAPI, interviewScheduleAPI } from '../utils/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLUMNS = {
  applied:     { id: 'applied',     title: 'Applied',     gradient: 'from-blue-500 to-blue-600',     lightBorder: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',        dot: 'bg-blue-500',   glow: 'shadow-blue-100',   dropBg: 'bg-blue-50/80'   },
  screening:   { id: 'screening',   title: 'Screening',   gradient: 'from-amber-400 to-orange-500',  lightBorder: 'border-amber-100',  badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',     dot: 'bg-amber-500',  glow: 'shadow-amber-100',  dropBg: 'bg-amber-50/80'  },
  online_test: { id: 'online_test', title: 'Online Test', gradient: 'from-cyan-500 to-teal-600',     lightBorder: 'border-cyan-100',   badge: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',        dot: 'bg-cyan-500',   glow: 'shadow-cyan-100',   dropBg: 'bg-cyan-50/80'   },
  interview:   { id: 'interview',   title: 'Interview',   gradient: 'from-violet-500 to-purple-600', lightBorder: 'border-violet-100', badge: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',  dot: 'bg-violet-500', glow: 'shadow-violet-100', dropBg: 'bg-violet-50/80' },
  selected:    { id: 'selected',    title: 'Selected',    gradient: 'from-emerald-500 to-green-600', lightBorder: 'border-emerald-100',badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',dot:'bg-emerald-500', glow:'shadow-emerald-100', dropBg:'bg-emerald-50/80' },
  rejected:    { id: 'rejected',    title: 'Rejected',    gradient: 'from-rose-400 to-red-500',      lightBorder: 'border-rose-100',   badge: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200',        dot: 'bg-rose-400',   glow: 'shadow-rose-100',   dropBg: 'bg-rose-50/80'   },
};

const EMPTY_PIPELINE = { applied: [], screening: [], online_test: [], interview: [], selected: [], rejected: [] };
const PIPELINE_STORAGE_KEY = 'hp_pipeline_'; // prefix + jdId

const COLUMN_AVATAR = {
  applied:     ['from-blue-400 to-blue-600',    'shadow-blue-200'],
  screening:   ['from-amber-400 to-orange-500', 'shadow-amber-200'],
  online_test: ['from-cyan-500 to-teal-600',    'shadow-cyan-200'],
  interview:   ['from-violet-400 to-purple-600','shadow-violet-200'],
  selected:    ['from-emerald-400 to-green-600','shadow-emerald-200'],
  rejected:    ['from-rose-400 to-red-500',     'shadow-rose-200'],
};

const COLUMN_SCORE = {
  applied:     'text-blue-600 bg-blue-50 ring-blue-200',
  screening:   'text-amber-600 bg-amber-50 ring-amber-200',
  online_test: 'text-cyan-600 bg-cyan-50 ring-cyan-200',
  interview:   'text-violet-600 bg-violet-50 ring-violet-200',
  selected:    'text-emerald-600 bg-emerald-50 ring-emerald-200',
  rejected:    'text-rose-500 bg-rose-50 ring-rose-200',
};

const getAvatar = (colId) => COLUMN_AVATAR[colId] || COLUMN_AVATAR.applied;
const getInitials = (name) => (name || 'NA').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
const scoreColor = (colId) => COLUMN_SCORE[colId] || COLUMN_SCORE.applied;

// ─── Modal ────────────────────────────────────────────────────────────────────
const CandidateModal = ({ candidate, column, onClose, darkMode }) => {
  const [downloading, setDownloading] = useState(false);
  
  if (!candidate) return null;
  
  const handleDownloadResume = async (e) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await candidatesAPI.downloadResume(candidate._backendId);
    } catch (err) {
      alert(handleAPIError(err));
    } finally {
      setDownloading(false);
    }
  };
  
  const [grad, shadow] = getAvatar(column.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className={`h-1.5 w-full bg-gradient-to-r ${column.gradient}`} />
        <div className="p-6">
          <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <HiXMark className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} shadow-lg ${shadow} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
              {getInitials(candidate.name)}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.role}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${column.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${column.dot}`} />{column.title}
              </span>
            </div>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-2"><HiSparkles className="w-4 h-4 text-amber-500" /><span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Match Score</span></div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ring-1 ${scoreColor(column.id)}`}>{candidate.score}%</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[[HiBriefcase, `${candidate.exp} yr${candidate.exp !== 1 ? 's' : ''} exp`], [HiMapPin, candidate.location], [HiEnvelope, candidate.email], [HiPhone, candidate.phone]].map(([Icon, val], i) => (
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                <Icon className="w-4 h-4 flex-shrink-0 opacity-60" /><span className="truncate">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(candidate.tags || []).map(tag => (
              <span key={tag} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{tag}</span>
            ))}
          </div>
          {/* Download Resume Button */}
          <button
            onClick={handleDownloadResume}
            disabled={downloading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              downloading ? 'opacity-50 cursor-not-allowed' : ''
            } ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <HiDocumentText className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Resume'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Exam Review Modal ────────────────────────────────────────────────────────
const ExamModal = ({ result, onClose, darkMode }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!result?.resultId) return;
    testResultsAPI.getDetails(result.resultId)
      .then(d => setDetails(Array.isArray(d) ? d : []))
      .catch(() => setDetails([]))
      .finally(() => setLoading(false));
  }, [result?.resultId]);

  if (!result) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Exam Review — {result.user?.name || result.candidateName || 'Candidate'}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-bold ${result.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>
                {Number(result.percentageScore).toFixed(1)}%
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${result.passStatus === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {result.passStatus}
              </span>
              <span className="text-xs text-green-600">✓ {result.correctAnswers} Correct</span>
              <span className="text-xs text-red-500">✗ {result.incorrectAnswers} Wrong</span>
              <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>— {result.unattemptedQuestions} Skipped</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer">&times;</button>
        </div>
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : details.length === 0 ? (
            <p className={`text-sm text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No question details available.</p>
          ) : (
            <div className="space-y-4">
              {details.map((d, idx) => {
                const candidateOptId = d.candidateAnswer?.optionId;
                const correctOptId = d.correctAnswer?.optionId;
                return (
                  <div key={d.resultDetailId} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{d.question?.questionText || '—'}</p>
                      </div>
                      <span className={`text-xs shrink-0 font-semibold ${d.isCorrect ? 'text-green-600' : candidateOptId ? 'text-red-500' : darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                        {d.isCorrect ? `+${d.marksObtained}` : candidateOptId ? '0' : '—'}
                      </span>
                    </div>
                    <div className="space-y-1.5 ml-9">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${candidateOptId === correctOptId ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-green-50 border border-green-200 text-green-700'}`}>
                        <span className="font-bold">{d.correctAnswer?.optionLabel}.</span>
                        <span>{d.correctAnswer?.optionText}</span>
                        <span className="ml-auto text-green-600 font-bold">✓</span>
                      </div>
                      {candidateOptId && candidateOptId !== correctOptId && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                          <span className="font-bold">{d.candidateAnswer?.optionLabel}.</span>
                          <span>{d.candidateAnswer?.optionText}</span>
                          <span className="ml-auto text-red-500 font-bold">✗</span>
                        </div>
                      )}
                      {!candidateOptId && (
                        <div className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                          <span className="italic">Not attempted</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className={`mt-4 pt-4 border-t text-sm font-medium text-center ${darkMode ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
            Total: {result.obtainedMarks} / {result.totalMarks} marks
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
const CandidateCard = ({ candidate, index, column, darkMode, onOpen, onSendTestLink, onViewExam }) => {
  const [grad, shadow] = getAvatar(column.id);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSendLink = async (e) => {
    e.stopPropagation();
    if (sending || sent) return;
    setSending(true);
    try {
      await onSendTestLink(candidate);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (_) {}
    setSending(false);
  };

  const handleDownloadResume = async (e) => {
    e.stopPropagation();
    if (downloading) return;
    setDownloading(true);
    try {
      await candidatesAPI.downloadResume(candidate._backendId);
    } catch (err) {
      alert(handleAPIError(err));
    } finally {
      setDownloading(false);
    }
  };

  const hasResult = candidate.testResult === 'PASS' || candidate.testResult === 'FAIL';

  return (
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          onClick={() => !snapshot.isDragging && onOpen(candidate)}
          className={`group relative rounded-xl border p-3 mb-2 cursor-pointer select-none transition-all duration-200
            ${snapshot.isDragging ? `shadow-2xl ${column.glow} rotate-1 scale-105 opacity-90` : `hover:shadow-md hover:${column.glow} hover:-translate-y-0.5`}
            ${darkMode ? 'bg-slate-700/80 border-slate-600/60 hover:border-slate-500' : 'bg-white border-slate-100 hover:border-slate-200'}
          `}
        >
          <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b ${column.gradient}`} />
          <div className="pl-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} shadow-sm ${shadow} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {getInitials(candidate.name)}
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold text-xs leading-tight truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{candidate.name}</p>
                  <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ring-1 ${scoreColor(column.id)}`}>{candidate.score}%</span>
                {/* Download Resume Button */}
                <button
                  onClick={handleDownloadResume}
                  disabled={downloading}
                  title="Download Resume"
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    downloading ? 'opacity-50 cursor-not-allowed' : ''
                  } ${darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  {downloading ? '⏳' : '📥'}
                </button>
              </div>
            </div>
            <div className={`flex items-center gap-2 text-xs mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="flex items-center gap-0.5"><HiClock className="w-3 h-3" />{candidate.exp}y</span>
              <span className="flex items-center gap-0.5"><HiMapPin className="w-3 h-3" />{candidate.location}</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {(candidate.tags || []).map(tag => (
                <span key={tag} className={`px-1.5 py-0.5 rounded text-xs ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{tag}</span>
              ))}
            </div>

            {/* Online Test column actions */}
            {column.id === 'online_test' && (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                {hasResult ? (
                  <>
                    {/* Result badge — click to view exam */}
                    <button
                      onClick={e => { e.stopPropagation(); onViewExam(candidate); }}
                      title="Click to view exam details"
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 cursor-pointer transition-opacity hover:opacity-80 ${
                        candidate.testResult === 'PASS'
                          ? 'bg-green-100 text-green-700 ring-green-300'
                          : 'bg-red-100 text-red-600 ring-red-300'
                      }`}
                    >
                      {candidate.testResult === 'PASS' ? '✓ PASS' : '✗ FAIL'}
                    </button>
                  </>
                ) : (
                  /* Send Test Link — only when no result yet */
                  <button
                    onClick={handleSendLink}
                    disabled={sending}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      sent ? 'bg-green-100 text-green-700' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    } disabled:opacity-60`}
                  >
                    {sending ? '⏳' : sent ? '✓ Sent' : '📧 Send Test'}
                  </button>
                )}
              </div>
            )}
          </div>
          <HiChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-slate-500' : 'text-slate-300'}`} />
        </div>
      )}
    </Draggable>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────
const PipelineColumn = ({ column, candidates, darkMode, onOpen, onSendTestLink, onViewExam }) => (
  <div className={`flex flex-col rounded-xl overflow-hidden border h-full ${darkMode ? 'bg-slate-800/60 border-slate-700' : `bg-slate-50/80 ${column.lightBorder}`}`}>
    <div className={`bg-gradient-to-r ${column.gradient} px-3 py-2.5 flex items-center justify-between flex-shrink-0`}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/60" />
        <h3 className="text-white font-bold text-xs tracking-wide">{column.title}</h3>
      </div>
      <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">{candidates.length}</span>
    </div>
    <Droppable droppableId={column.id}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.droppableProps}
          className={`flex-1 p-2 min-h-[100px] overflow-y-auto transition-colors duration-200 ${snapshot.isDraggingOver ? darkMode ? 'bg-slate-700/50' : column.dropBg : ''}`}
        >
          {candidates.length === 0 && !snapshot.isDraggingOver && (
            <div className={`flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed ${darkMode ? 'border-slate-600 text-slate-600' : `${column.lightBorder} text-slate-300`}`}>
              <p className="text-xs">Drop here</p>
            </div>
          )}
          {candidates.map((c, i) => (
            <CandidateCard key={c.id} candidate={c} index={i} column={column} darkMode={darkMode} onOpen={onOpen} onSendTestLink={onSendTestLink} onViewExam={onViewExam} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const HiringPipeline = ({ darkMode }) => {
  const [candidates, setCandidates] = useState({ ...EMPTY_PIPELINE });
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState('all');
  const [modal, setModal] = useState(null);
  const [modalCol, setModalCol] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jds, setJds] = useState([]);
  const [jdsLoading, setJdsLoading] = useState(true);
  const [selectedJDId, setSelectedJDId] = useState('');
  const selectedJDIdRef = useRef('');
  const [jdSearching, setJdSearching] = useState(false);
  const [jdSearchError, setJdSearchError] = useState(null);
  const [mapStatus, setMapStatus] = useState(null); // 'success' | 'error' | null
  const [examModal, setExamModal] = useState(null); // test result object for exam review

  // ── localStorage helpers ──────────────────────────────────────────────────
  const saveStages = (jdId, pipeline) => {
    try { localStorage.setItem(PIPELINE_STORAGE_KEY + jdId, JSON.stringify(pipeline)); } catch (_) {}
  };
  const loadStages = (jdId) => {
    try {
      const raw = localStorage.getItem(PIPELINE_STORAGE_KEY + jdId);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  };

  // Load JDs on mount
  useEffect(() => {
    jdAPI.getAll()
      .then(data => setJds(Array.isArray(data) ? data : []))
      .catch(() => setJds([]))
      .finally(() => setJdsLoading(false));
  }, []);

  // Enrich online_test candidates with test results whenever that column changes
  useEffect(() => {
    const onlineTestCards = candidates.online_test;
    if (!onlineTestCards || onlineTestCards.length === 0) return;
    // Only fetch if any card doesn't have a result yet
    const needsEnrichment = onlineTestCards.some(c => !c.testResult && !c._resultChecked);
    if (!needsEnrichment) return;

    testResultsAPI.getAll()
      .then(allResults => {
        if (!Array.isArray(allResults) || allResults.length === 0) return;
        setCandidates(prev => {
          const enriched = prev.online_test.map(c => {
            if (c.testResult || c._resultChecked) return c;
            // Match by candidate id or email
            const match = allResults.find(r =>
              String(r.user?.id) === String(c._backendId) ||
              r.user?.email?.toLowerCase() === c.email?.toLowerCase()
            );
            if (!match) return { ...c, _resultChecked: true };
            return { ...c, testResult: match.passStatus, _resultData: match, _resultChecked: true };
          });
          const updated = { ...prev, online_test: enriched };
          if (selectedJDIdRef.current) saveStages(selectedJDIdRef.current, updated);
          return updated;
        });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.online_test?.length]);

  const extractJDTitle = (jd) => {
    const content = jd.optimizedJd || jd.originalContent || '';
    const lines = content.split('\n').map(l => l.replace(/\*+/g, '').trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 4 && line.length < 80) return line;
    }
    return `JD #${jd.id}`;
  };

  // ── JD select handler ─────────────────────────────────────────────────────
  // Flow:
  //   1. Load saved stages from localStorage (instant)
  //   2. Fetch all candidates from backend
  //   3. POST /candidate/map-candidates-to-jd  → links them to this JD in DB
  //   4. Build pipeline cards, add new ones to Applied, keep existing stage positions
  const handleJDSearch = async (jdId) => {
    setSelectedJDId(jdId);
    selectedJDIdRef.current = jdId;
    setMapStatus(null);
    setJdSearchError(null);

    if (!jdId) {
      setCandidates({ ...EMPTY_PIPELINE });
      return;
    }

    // Step 1: Show saved stages immediately
    const saved = loadStages(jdId);
    if (saved) setCandidates(saved);

    setJdSearching(true);

    try {
      // Step 2: Fetch all candidates
      const allCandidates = await candidatesAPI.getAllUnpaged();
      const candidateList = Array.isArray(allCandidates) ? allCandidates : [];

      if (candidateList.length === 0) {
        setJdSearchError('No candidates found. Upload resumes first.');
        setJdSearching(false);
        return;
      }

      // Step 3: Map all candidates to this JD (POST /candidate/map-candidates-to-jd)
      const candidateIds = candidateList
        .map(c => Number(c.id))
        .filter(id => !isNaN(id) && id > 0);

      try {
        await pipelineAPI.mapCandidatesToJD(Number(jdId), candidateIds);
        setMapStatus('success');
        setTimeout(() => setMapStatus(null), 3000);
      } catch (e) {
        console.warn('mapCandidatesToJD:', e.message);
        setMapStatus('error');
        setTimeout(() => setMapStatus(null), 3000);
      }

      // Step 4: Build cards from candidate list
      const newCards = candidateList.map(c => ({
        id: String(c.id),
        _backendId: Number(c.id),
        name: c.name || c.username || 'N/A',
        role: c.title || c.department || 'Candidate',
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        location: c.location || 'N/A',
        exp: 0,
        score: 0,
        tags: [],
      }));

      setCandidates(prev => {
        // Keep existing stage positions, only add truly new cards to Applied
        const allExistingIds = new Set(Object.values(prev).flat().map(c => c.id));
        const fresh = newCards.filter(c => !allExistingIds.has(c.id));

        // Refresh data on existing cards (name/email may have changed)
        const updated = {};
        for (const stage of Object.keys(prev)) {
          updated[stage] = prev[stage].map(c => {
            const match = newCards.find(n => n.id === c.id);
            return match ? { ...c, name: match.name, email: match.email, phone: match.phone, role: match.role } : c;
          });
        }
        updated.applied = [...updated.applied, ...fresh];

        saveStages(jdId, updated);
        return updated;
      });
    } catch (err) {
      setJdSearchError(handleAPIError(err));
    } finally {
      setJdSearching(false);
    }
  };

  // Drag & drop — stages saved to localStorage only (no backend call)
  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const src = [...candidates[source.droppableId]];
    const dst = source.droppableId === destination.droppableId ? src : [...candidates[destination.droppableId]];
    const [moved] = src.splice(source.index, 1);
    dst.splice(destination.index, 0, moved);

    const updated = { ...candidates, [source.droppableId]: src, [destination.droppableId]: dst };
    setCandidates(updated);
    saveStages(selectedJDIdRef.current, updated);
  };

  const openModal = (candidate) => {
    const colId = Object.keys(candidates).find(k => candidates[k].some(c => c.id === candidate.id));
    setModal(candidate);
    setModalCol(COLUMNS[colId]);
  };

  const handleSendTestLink = async (candidate) => {
    const email = candidate.email;
    if (!email || email === 'N/A') throw new Error('No email for this candidate');
    const cached = JSON.parse(localStorage.getItem('tpms_schedules_cache') || '[]');
    const schedule = cached.find(s =>
      s.user?.email?.toLowerCase() === email.toLowerCase() && s.status !== 'CANCELLED'
    );
    if (schedule) {
      await interviewScheduleAPI.sendTestLink(schedule.interviewId);
    } else {
      throw new Error('No schedule found. Create one in Online Test → Schedules first.');
    }
  };

  const handleViewExam = (candidate) => {
    // Use stored result data if available, otherwise create a minimal object with resultId
    const resultData = candidate._resultData || { resultId: null, user: { name: candidate.name }, passStatus: candidate.testResult, percentageScore: 0, correctAnswers: 0, incorrectAnswers: 0, unattemptedQuestions: 0, obtainedMarks: 0, totalMarks: 0 };
    setExamModal(resultData);
  };  const total = Object.values(candidates).flat().length;
  
  // Improved search functionality - searches across name, role, email, phone, location, and tags
  const filtered = Object.fromEntries(
    Object.entries(candidates).map(([k, v]) => [k, v.filter(c => {
      if (!search) return true;
      const searchLower = search.toLowerCase().trim();
      return (
        c.name?.toLowerCase().includes(searchLower) ||
        c.role?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower) ||
        c.phone?.toLowerCase().includes(searchLower) ||
        c.location?.toLowerCase().includes(searchLower) ||
        (c.tags || []).some(tag => tag.toLowerCase().includes(searchLower))
      );
    })])
  );
  
  const visibleCols = activeStage === 'all' ? Object.values(COLUMNS) : [COLUMNS[activeStage]];

  const SidebarContent = () => (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Search */}
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>SEARCH</label>
        <div className="relative">
          <HiMagnifyingGlass className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input type="text" placeholder="Name or role..." value={search} onChange={e => setSearch(e.target.value)}
            className={`w-full pl-8 pr-7 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"><HiXMark className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} /></button>}
        </div>
      </div>

      {/* Select JD */}
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center gap-1"><HiDocumentText className="w-3 h-3" />SELECT JD</span>
        </label>
        {jdsLoading ? (
          <div className={`py-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}><InlineLoader message="Loading JDs..." darkMode={darkMode} size="sm" /></div>
        ) : jds.length === 0 ? (
          <p className={`text-xs py-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No JDs found. Upload one first.</p>
        ) : (
          <div className="relative">
            <HiDocumentText className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <select value={selectedJDId} onChange={e => handleJDSearch(e.target.value)}
              className={`w-full pl-8 pr-6 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
            >
              <option value="">Select a JD...</option>
              {jds.map(jd => <option key={jd.id} value={String(jd.id)}>{extractJDTitle(jd)}</option>)}
            </select>
            <HiChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
        )}
        {jdSearching && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Mapping candidates...</span>
          </div>
        )}
        {jdSearchError && <p className="text-xs text-red-500 mt-1.5">{jdSearchError}</p>}
        {mapStatus === 'success' && <p className="text-xs mt-1.5 text-green-600">✓ Candidates mapped to JD</p>}
        {mapStatus === 'error' && <p className="text-xs mt-1.5 text-amber-500">⚠ Mapping had an issue</p>}
        {selectedJDId && !jdSearching && total > 0 && (
          <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{total} candidates in pipeline</p>
        )}
      </div>

      {/* Stage Filter */}
      <div>
        <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center gap-1"><HiFunnel className="w-3 h-3" />STAGES</span>
        </label>
        <div className="flex flex-col gap-1.5">
          <button onClick={() => { setActiveStage('all'); setSidebarOpen(false); }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeStage === 'all' ? darkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white' : darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-400" />All Stages</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeStage === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{total}</span>
          </button>
          {Object.values(COLUMNS).map(col => (
            <button key={col.id} onClick={() => { setActiveStage(col.id); setSidebarOpen(false); }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeStage === col.id ? `bg-gradient-to-r ${col.gradient} text-white shadow-sm` : darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeStage === col.id ? 'bg-white/60' : col.dot}`} />
                {col.title}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeStage === col.id ? 'bg-white/20 text-white' : col.badge}`}>{candidates[col.id]?.length ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className={`mt-auto pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
        <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>PIPELINE SUMMARY</p>
        {Object.values(COLUMNS).map(col => {
          const count = candidates[col.id]?.length ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={col.id} className="mb-2">
              <div className="flex justify-between text-xs mb-0.5">
                <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{col.title}</span>
                <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{pct}%</span>
              </div>
              <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${col.gradient} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Header */}
      <div className={`flex-shrink-0 border-b px-4 py-3 flex items-center justify-between ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
        <div>
          <h1 className={`text-lg sm:text-2xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>Hiring Pipeline</h1>
          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {total > 0 ? `${total} candidates · drag to move stages` : 'Select a JD to load candidates into the pipeline'}
          </p>
        </div>
        <button onClick={() => setSidebarOpen(true)}
          className={`lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          <HiFunnel className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className={`hidden lg:flex flex-shrink-0 w-64 flex-col border-r ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <SidebarContent />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className={`relative z-50 w-72 max-w-[85vw] flex flex-col shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Filters & Stages</span>
                <button onClick={() => setSidebarOpen(false)} className={`p-1.5 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Kanban board */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 sm:p-4">
          {/* Mobile stage pills */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-2 flex-shrink-0">
            <button onClick={() => setActiveStage('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${activeStage === 'all' ? darkMode ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white' : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
            >All {total}</button>
            {Object.values(COLUMNS).map(col => (
              <button key={col.id} onClick={() => setActiveStage(col.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${activeStage === col.id ? `bg-gradient-to-r ${col.gradient} text-white` : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
              >{col.title} {candidates[col.id]?.length ?? 0}</button>
            ))}
          </div>

          {/* Board — always visible */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-3 h-full" style={{ minWidth: visibleCols.length > 1 ? `${visibleCols.length * 260}px` : '100%' }}>
                {visibleCols.map(col => (
                  <div key={col.id} className="flex-shrink-0 flex flex-col" style={{ width: visibleCols.length === 1 ? '100%' : '260px' }}>
                    <PipelineColumn column={col} candidates={filtered[col.id] || []} darkMode={darkMode} onOpen={openModal} onSendTestLink={handleSendTestLink} onViewExam={handleViewExam} />
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {modal && modalCol && <CandidateModal candidate={modal} column={modalCol} onClose={() => setModal(null)} darkMode={darkMode} />}
      {examModal && <ExamModal result={examModal} onClose={() => setExamModal(null)} darkMode={darkMode} />}
    </div>
  );
};

export default HiringPipeline;
