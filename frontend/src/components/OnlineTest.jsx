/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  testCategoryAPI, questionsAPI, questionOptionsAPI,
  interviewScheduleAPI, testResultsAPI, candidatesAPI, membersAPI
} from '../utils/api';
import SearchableSelect from './SearchableSelect';
import ImageZoomModal from './ImageZoomModal';
import { InlineLoader } from './PageLoader';

const TABS = ['Dashboard', 'Schedules', 'Categories', 'Questions', 'Candidates', 'Results'];

// ─── Badge helpers ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    SCHEDULED:   'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED:   'bg-green-100 text-green-700',
    CANCELLED:   'bg-red-100 text-red-700',
    NO_SHOW:     'bg-slate-100 text-slate-600',
    PASS:        'bg-green-100 text-green-700',
    FAIL:        'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const DiffBadge = ({ level }) => {
  const map = { EASY: 'bg-green-100 text-green-700', MEDIUM: 'bg-yellow-100 text-yellow-700', HARD: 'bg-red-100 text-red-700' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[level] || 'bg-slate-100 text-slate-600'}`}>{level}</span>;
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, darkMode, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-xl shadow-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer">&times;</button>
      </div>
      <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

// ─── Field / Input helpers ─────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = (dark) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'
  }`;

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, totalItems, pageSize, onPageChange, darkMode }) => {
  if (totalPages <= 1) return null;
  const start = totalItems === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalItems);
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 2) pages.push('...');
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages - 1);
  }
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Showing {start}–{end} of {totalItems}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
          Previous
        </button>
        {pages.map((p, idx) => p === '...'
          ? <span key={`e${idx}`} className="px-2 text-slate-400">...</span>
          : <button key={p} onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium cursor-pointer ${page === p ? 'bg-blue-600 text-white' : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              {p + 1}
            </button>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page >= totalPages - 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}>
          Next
        </button>
      </div>
    </div>
  );
};

// ─── Search bar ──────────────────────────
const SearchBar = ({ value, onChange, placeholder, darkMode }) => (
  <div className="relative flex-1">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
    <input type="text" placeholder={placeholder || 'Search...'} value={value} onChange={e => onChange(e.target.value)}
      className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
      }`} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardTab = ({ darkMode }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avgScore: 0, passRate: 0, passed: 0, failed: 0 });
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const [avgRes, rateRes, allRes] = await Promise.allSettled([
          testResultsAPI.getAverageScore(),
          testResultsAPI.getPassRate(),
          testResultsAPI.getAll(),
        ]);
        const allData = Array.isArray(allRes.value) ? [...allRes.value].reverse() : [];
        setAllResults(allData);
        const passedCount = allData.filter(r => r.passStatus === 'PASS').length;
        const failedCount = allData.filter(r => r.passStatus === 'FAIL').length;
        const total = allData.length;
        setStats({
          avgScore: typeof avgRes.value === 'number' ? avgRes.value : total > 0 ? allData.reduce((s, r) => s + (r.percentageScore || 0), 0) / total : 0,
          passRate: typeof rateRes.value === 'number' ? rateRes.value : total > 0 ? (passedCount / total) * 100 : 0,
          passed: passedCount,
          failed: failedCount,
        });
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const top5 = [...allResults].sort((a, b) => b.percentageScore - a.percentageScore).slice(0, 5);
  const base = subTab === 'top5' ? top5 : allResults;
  const display = base.filter(r => !search || r.user?.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(display.length / PAGE_SIZE);
  const paginated = display.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const card = (label, value, color) => (
    <div className={`rounded-xl p-5 border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{loading ? '—' : value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {card('Average Score', `${Number(stats.avgScore).toFixed(1)}%`, 'text-blue-600')}
        {card('Pass Rate', `${Number(stats.passRate).toFixed(1)}%`, 'text-green-600')}
        {card('Passed', stats.passed, 'text-green-600')}
        {card('Failed', stats.failed, 'text-red-500')}
      </div>

      <div className={`rounded-xl border shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Performers</h3>
          <div className="flex gap-1">
            {[['all', 'All'], ['top5', 'Top 5']].map(([key, label]) => (
              <button key={key} onClick={() => { setSubTab(key); setPage(0); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  subTab === key ? 'bg-blue-600 text-white' : darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}>{label}</button>
            ))}
          </div>
        </div>
        <div className={`px-6 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search by candidate name..." darkMode={darkMode} />
        </div>
        {loading ? <div className="p-6 text-slate-400 text-sm"><InlineLoader message="Loading test results..." darkMode={darkMode} size="sm" /></div> : paginated.length === 0 ? (
          <p className="p-6 text-slate-400 text-sm">No test results available yet.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>
                    {['Rank', 'Candidate', 'Score', 'Correct', 'Incorrect', 'Skipped', 'Duration', 'Submission', 'Status'].map(h => (
                      <th key={h} className={`text-left px-4 py-3 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => {
                    const rank = page * PAGE_SIZE + i;
                    const rankCls = ['bg-yellow-100 text-yellow-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700'];
                    return (
                      <tr key={r.resultId} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className="px-4 py-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankCls[rank] || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>{rank + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => r.user?.id && navigate(`/candidate/${r.user.id}`)}
                            className={`font-medium text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                          >
                            {r.user?.name || 'N/A'}
                          </button>
                        </td>
                        <td className={`px-4 py-3 font-bold ${r.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>{Number(r.percentageScore).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{r.correctAnswers}</td>
                        <td className="px-4 py-3 text-red-500 font-medium">{r.incorrectAnswers}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.unattemptedQuestions}</td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {r.testDurationSeconds ? `${Math.floor(r.testDurationSeconds / 60)}m ${r.testDurationSeconds % 60}s` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const reason = r.submissionReason || 'MANUAL_SUBMIT';
                            const badges = {
                              MANUAL_SUBMIT: { icon: '✅', text: 'Manual', cls: 'bg-green-100 text-green-700 ring-green-200' },
                              TIME_EXPIRED: { icon: '⏰', text: 'Time Up', cls: 'bg-orange-100 text-orange-700 ring-orange-200' },
                              TAB_SWITCH: { icon: '⚠️', text: 'Tab Switch', cls: 'bg-red-100 text-red-700 ring-red-200' },
                              BROWSER_CLOSE: { icon: '🚫', text: 'Browser Closed', cls: 'bg-red-100 text-red-700 ring-red-200' },
                            };
                            const badge = badges[reason] || badges.MANUAL_SUBMIT;
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 ${badge.cls}`} title={reason}>
                                <span>{badge.icon}</span>
                                <span>{badge.text}</span>
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.passStatus} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((r, i) => {
                const rank = page * PAGE_SIZE + i;
                const rankCls = ['bg-yellow-100 text-yellow-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700'];
                return (
                  <div key={r.resultId} className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankCls[rank] || (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>{rank + 1}</span>
                        <div>
                          <button onClick={() => r.user?.id && navigate(`/candidate/${r.user.id}`)} className={`font-bold text-sm text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{r.user?.name || 'N/A'}</button>
                        </div>
                      </div>
                      <StatusBadge status={r.passStatus} />
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Score</span>
                          <span className={`font-bold ${r.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>{Number(r.percentageScore).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Correct</span>
                          <span className="text-green-600 font-medium">{r.correctAnswers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Incorrect</span>
                          <span className="text-red-500 font-medium">{r.incorrectAnswers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Skipped</span>
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{r.unattemptedQuestions}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Duration</span>
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{r.testDurationSeconds ? `${Math.floor(r.testDurationSeconds / 60)}m ${r.testDurationSeconds % 60}s` : '—'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Submission</span>
                        <div>
                          {(() => {
                            const reason = r.submissionReason || 'MANUAL_SUBMIT';
                            const badges = {
                              MANUAL_SUBMIT: { icon: '✅', text: 'Manual', cls: 'bg-green-100 text-green-700 ring-green-200' },
                              TIME_EXPIRED: { icon: '⏰', text: 'Time Up', cls: 'bg-orange-100 text-orange-700 ring-orange-200' },
                              TAB_SWITCH: { icon: '⚠️', text: 'Tab Switch', cls: 'bg-red-100 text-red-700 ring-red-200' },
                              BROWSER_CLOSE: { icon: '🚫', text: 'Browser Closed', cls: 'bg-red-100 text-red-700 ring-red-200' },
                            };
                            const badge = badges[reason] || badges.MANUAL_SUBMIT;
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${badge.cls}`} title={reason}>
                                <span>{badge.icon}</span>
                                <span>{badge.text}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={display.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const SchedulesTab = ({ darkMode }) => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [members, setMembers] = useState([]); // NEW: For interviewer dropdown
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImages, setProfileImages] = useState({}); // NEW: Store profile images
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  // categoryIds is now an array of integers, difficultyLevels is array of strings
  const [form, setForm] = useState({ candidateId: '', testDate: '', testTime: '10:00', testDurationMinutes: 60, interviewerName: '', interviewLocation: '', remarks: '', categoryIds: [], difficultyLevels: [], maxQuestion: 10 });
  const [saving, setSaving] = useState(false);
  const [sendingLink, setSendingLink] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [interviewerFilter, setInterviewerFilter] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [page, setPage] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedCandidateName, setSelectedCandidateName] = useState('');
  const PAGE_SIZE = 5;

  const CACHE_KEY = 'tpms_schedules_cache';

  const loadFromCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  };

  const saveToCache = (list) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (_) {}
  };

  const reload = async () => {
    setLoading(true);
    try {
      const [s, cands, cats, mems] = await Promise.allSettled([
        interviewScheduleAPI.getAll(),
        candidatesAPI.getAllUnpaged(),
        testCategoryAPI.getAll(),
        membersAPI.getAll(), // NEW: Fetch members for interviewer dropdown
      ]);
      const scheduleList = Array.isArray(s.value) ? [...s.value].reverse() : loadFromCache();
      setSchedules(scheduleList);
      // Keep cache in sync with backend data
      if (Array.isArray(s.value)) saveToCache(scheduleList);
      const candidateList = Array.isArray(cands.value) ? cands.value.map(c => ({ id: c.id, name: c.name || c.username || 'N/A', email: c.email || '' })) : [];
      setCandidates(candidateList);
      
      // NEW: Fetch profile images for all candidates
      const images = {};
      for (const cand of candidateList) {
        try {
          const imageUrl = await candidatesAPI.getProfileImage(cand.id);
          if (imageUrl) {
            images[cand.id] = imageUrl;
          }
        } catch (err) {
          // Silently ignore - profile image is optional
        }
      }
      setProfileImages(images);
      
      setCategories(Array.isArray(cats.value) ? cats.value : []);
      setMembers(Array.isArray(mems.value) ? mems.value.map(m => ({ id: m.id, name: m.name || m.username || 'N/A', email: m.email || '' })) : []); // NEW
    } catch (_) {
      setSchedules(loadFromCache());
    }
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  const openCreate = () => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    setForm({ candidateId: candidates[0]?.id || '', testDate: tomorrow.toISOString().split('T')[0], testTime: '10:00', testDurationMinutes: 60, interviewerName: '', interviewLocation: '', remarks: '', categoryIds: [], difficultyLevels: [], maxQuestion: 10 });
    setEditId(null); setModal('form');
  };

  const openEdit = (s) => {
    setForm({
      candidateId: s.user?.id || candidates[0]?.id || '',
      testDate: s.testDate || '',
      testTime: s.testTime ? s.testTime.substring(0, 5) : '10:00',
      testDurationMinutes: s.testDurationMinutes || 60,
      interviewerName: s.interviewerName || '',
      interviewLocation: s.interviewLocation || '',
      remarks: s.remarks || '',
      categoryIds: Array.isArray(s.categoryIds) ? s.categoryIds.map(Number) : [],
      difficultyLevels: Array.isArray(s.difficultyLevels) ? s.difficultyLevels : [],
      maxQuestion: s.maxQuestion || 10,
    });
    setEditId(s.interviewId); setModal('form');
  };

  // Toggle a category in the multi-select
  const toggleCategory = (catId) => {
    const id = Number(catId);
    setForm(f => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter(c => c !== id)
        : [...f.categoryIds, id],
    }));
  };

  // Toggle a difficulty level in the multi-select
  const toggleDifficulty = (level) => {
    setForm(f => ({
      ...f,
      difficultyLevels: f.difficultyLevels.includes(level)
        ? f.difficultyLevels.filter(l => l !== level)
        : [...f.difficultyLevels, level],
    }));
  };

  const save = async () => {
    if (!form.candidateId) { alert('Please select a candidate.'); return; }
    if (!form.testDate) { alert('Please select a test date.'); return; }
    if (!form.interviewerName.trim()) { alert('Interviewer name is required.'); return; }
    const dur = parseInt(form.testDurationMinutes, 10);
    if (isNaN(dur) || dur < 15 || dur > 480) { alert('Duration must be between 15 and 480 minutes.'); return; }
    
    // Validate that enough questions are available
    const maxQ = parseInt(form.maxQuestion, 10) || 10;
    let availableQuestions = 0;
    
    try {
      if (form.categoryIds.length > 0) {
        // Check questions in selected categories
        const allCatQs = await Promise.all(
          form.categoryIds.map(catId => 
            questionsAPI.getByCategory(catId).catch(() => [])
          )
        );
        const pooledQs = allCatQs.flat();
        
        // Filter by difficulty if selected
        if (form.difficultyLevels.length > 0) {
          availableQuestions = pooledQs.filter(q => form.difficultyLevels.includes(q.difficultyLevel)).length;
        } else {
          availableQuestions = pooledQs.length;
        }
      } else {
        // Check all questions
        const allQs = await questionsAPI.getActive().catch(() => []);
        if (form.difficultyLevels.length > 0) {
          availableQuestions = allQs.filter(q => form.difficultyLevels.includes(q.difficultyLevel)).length;
        } else {
          availableQuestions = allQs.length;
        }
      }
    } catch (err) {
      console.warn('Error checking available questions:', err);
    }
    
    if (availableQuestions < maxQ) {
      alert(`Only ${availableQuestions} questions available but you requested ${maxQ}. Please reduce the question count or select different categories/difficulties.`);
      return;
    }
    
    setSaving(true);
    try {
      const timeVal = form.testTime.length === 5 ? form.testTime + ':00' : form.testTime;
      const payload = {
        candidateId: Number(form.candidateId),
        testDate: form.testDate,
        testTime: timeVal,
        testDurationMinutes: dur,
        interviewerName: form.interviewerName.trim(),
        interviewLocation: form.interviewLocation || '',
        remarks: form.remarks || '',
        categoryIds: form.categoryIds.length > 0 ? form.categoryIds : null,
        difficultyLevels: form.difficultyLevels.length > 0 ? form.difficultyLevels : null,
        maxQuestion: maxQ,
      };

      const created = await interviewScheduleAPI.create(payload);

      // Build a display-friendly object from the response + local candidate data
      const cand = candidates.find(c => c.id === Number(form.candidateId));
      const displaySchedule = {
        interviewId: created.interviewId,
        user: { id: Number(form.candidateId), name: cand?.name || 'N/A', email: cand?.email || '' },
        testDate: form.testDate,
        testTime: timeVal,
        testDurationMinutes: dur,
        interviewerName: form.interviewerName.trim(),
        interviewLocation: form.interviewLocation || '',
        remarks: form.remarks || '',
        categoryIds: form.categoryIds.length > 0 ? form.categoryIds : null,
        difficultyLevels: form.difficultyLevels.length > 0 ? form.difficultyLevels : null,
        maxQuestion: maxQ,
        status: created.status || 'SCHEDULED',
        createdDate: created.createdDate || new Date().toISOString(),
      };

      // Update cache
      const cached = loadFromCache();
      if (editId) {
        const updated = cached.map(s => s.interviewId === editId ? { ...s, ...displaySchedule, interviewId: editId } : s);
        saveToCache(updated);
      } else {
        saveToCache([displaySchedule, ...cached]);
      }

      setModal(null); reload();
    } catch (e) { alert('Error saving schedule: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await interviewScheduleAPI.delete(id);
      const updated = loadFromCache().filter(s => s.interviewId !== id);
      saveToCache(updated);
      reload();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleSendLink = async (s) => {
    setSendingLink(s.interviewId);
    try {
      const res = await interviewScheduleAPI.sendTestLink(s.interviewId);
      showToast('success', `Test link sent to ${res.email || s.user?.email || 'candidate'}`);
    } catch (e) { showToast('error', 'Failed to send: ' + e.message); }
    setSendingLink(null);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await interviewScheduleAPI.updateStatus(id, status);
      // Update cache
      const updated = loadFromCache().map(s => s.interviewId === id ? { ...s, status } : s);
      saveToCache(updated);
      reload();
    } catch (e) { alert('Error: ' + e.message); }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const total     = schedules.length;
  const completed = schedules.filter(s => s.status === 'COMPLETED').length;
  const todayCount = schedules.filter(s => s.testDate === todayStr).length;
  const upcoming  = schedules.filter(s => s.testDate > todayStr && s.status !== 'CANCELLED' && s.status !== 'COMPLETED').length;
  const pending   = schedules.filter(s => s.testDate < todayStr && s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;

  const interviewers = [...new Set(schedules.map(s => s.interviewerName).filter(Boolean))];

  const isToday = d => d === todayStr;
  const isThisWeek = d => { const now = new Date(), date = new Date(d), sw = new Date(now); sw.setDate(now.getDate() - now.getDay()); const ew = new Date(sw); ew.setDate(sw.getDate() + 6); return date >= sw && date <= ew; };
  const isThisMonth = d => { const now = new Date(), date = new Date(d); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); };

  const getLabel = (s) => {
    if (s.status === 'COMPLETED') return { label: 'Completed', cls: 'bg-green-100 text-green-700' };
    if (s.status === 'CANCELLED') return { label: 'Cancelled', cls: 'bg-red-100 text-red-700' };
    if (s.status === 'NO_SHOW')   return { label: 'No Show',   cls: 'bg-slate-100 text-slate-600' };
    if (s.status === 'IN_PROGRESS') return { label: 'In Progress', cls: 'bg-yellow-100 text-yellow-700' };
    if (s.testDate < todayStr)    return { label: 'Overdue',   cls: 'bg-orange-100 text-orange-700' };
    return { label: 'Upcoming', cls: 'bg-blue-100 text-blue-700' };
  };

  const filtered = schedules.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.user?.name?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchIv = interviewerFilter === 'ALL' || s.interviewerName === interviewerFilter;
    const matchQuick = quickFilter === 'ALL'
      || (quickFilter === 'TODAY' && isToday(s.testDate))
      || (quickFilter === 'WEEK' && isThisWeek(s.testDate))
      || (quickFilter === 'MONTH' && isThisMonth(s.testDate));
    return matchSearch && matchStatus && matchIv && matchQuick;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statCard = (icon, value, label, sub, bg) => (
    <div className={`rounded-xl p-4 border flex items-center gap-4 shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg}`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{label}</p>
        <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>
      </div>
    </div>
  );

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCard('📅', total,      'Total',     'All schedules',            'bg-blue-100')}
        {statCard('✅', completed,  'Completed', 'Interviews done',          'bg-green-100')}
        {statCard('🕐', todayCount, 'Today',     'Scheduled today',          'bg-yellow-100')}
        {statCard('🚀', upcoming,   'Upcoming',  'Future schedules',         'bg-indigo-100')}
        {statCard('⏳', pending,    'Pending',   'Past, not completed',      'bg-red-100')}
      </div>

      <div className={`rounded-xl border p-3 sm:p-4 shadow-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col gap-2 sm:gap-3 mb-3">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search by candidate name or email..." darkMode={darkMode} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              className={`px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
              <option value="ALL">All Statuses</option>
              {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={interviewerFilter} onChange={e => { setInterviewerFilter(e.target.value); setPage(0); }}
              className={`px-2 sm:px-3 py-2 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
              <option value="ALL">All Interviewers</option>
              {interviewers.map(iv => <option key={iv} value={iv}>{iv}</option>)}
            </select>
            <button onClick={openCreate} className="col-span-2 sm:col-span-2 md:col-span-1 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 cursor-pointer">+ Schedule</button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {[['ALL', 'All'], ['TODAY', 'Today'], ['WEEK', 'This Week'], ['MONTH', 'This Month']].map(([key, label]) => (
              <button key={key} onClick={() => { setQuickFilter(key); setPage(0); }}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  quickFilter === key ? 'bg-blue-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            {(search || statusFilter !== 'ALL' || interviewerFilter !== 'ALL' || quickFilter !== 'ALL') && (
              <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setInterviewerFilter('ALL'); setQuickFilter('ALL'); setPage(0); }}
                className={`cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>✕ Clear</button>
            )}
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{filtered.length} schedules</span>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? <div className="p-6"><InlineLoader message="Loading schedules..." darkMode={darkMode} size="sm" /></div> : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>{['#', 'Candidate', 'Email', 'Date & Time', 'Duration', 'Max Q', 'Categories', 'Difficulty', 'Interviewer', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginated.map((s, i) => {
                    const badge = getLabel(s);
                    const initials = (s.user?.name || 'NA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                    const avatarColor = avatarColors[(s.interviewId || 0) % avatarColors.length];
                    return (
                      <tr key={s.interviewId} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <td className={`px-4 py-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{page * PAGE_SIZE + i + 1}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {profileImages[s.user?.id] ? (
                              <img 
                                src={profileImages[s.user?.id]} 
                                alt={s.user?.name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  setSelectedImageId(s.user?.id);
                                  setSelectedCandidateName(s.user?.name || 'Candidate');
                                  setShowImageZoom(true);
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                              style={{ display: profileImages[s.user?.id] ? 'none' : 'flex' }}
                            >
                              {initials}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => s.user?.id && navigate(`/candidate/${s.user.id}`)}
                                className={`font-semibold text-sm text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                              >
                                {s.user?.name || 'N/A'}
                              </button>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls} w-fit`}>{badge.label}</span>
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-4 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.user?.email || '—'}</td>
                        <td className="px-4 py-4">
                          <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                            <div>{s.testDate ? new Date(s.testDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                            <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.testTime || '—'}</div>
                          </div>
                        </td>
                        <td className={`px-4 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.testDurationMinutes} min</td>
                        <td className={`px-4 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.maxQuestion ?? '—'}</td>
                        <td className={`px-4 py-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {Array.isArray(s.categoryIds) && s.categoryIds.length > 0 ? s.categoryIds.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-4">
                          {Array.isArray(s.difficultyLevels) && s.difficultyLevels.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {s.difficultyLevels.map(level => (
                                <DiffBadge key={level} level={level} />
                              ))}
                            </div>
                          ) : <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</span>}
                        </td>
                        <td className="px-4 py-4">
                          {s.interviewerName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 text-xs font-bold">
                                {s.interviewerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.interviewerName}</span>
                            </div>
                          ) : <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>—</span>}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-4 relative">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === s.interviewId ? null : s.interviewId); }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            ⋮
                          </button>
                          {openMenuId === s.interviewId && (
                            <div
                              className={`absolute right-0 top-10 z-30 w-48 rounded-xl shadow-xl border py-2 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}
                              onClick={e => e.stopPropagation()}
                            >
                              {/* Send Test Link — hidden when COMPLETED */}
                              {s.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => { handleSendLink(s); setOpenMenuId(null); }}
                                  disabled={sendingLink === s.interviewId}
                                  className={`w-full text-left px-3 py-2 text-xs cursor-pointer flex items-center gap-2 rounded-lg mx-1 ${darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'} disabled:opacity-50`}
                                  style={{ width: 'calc(100% - 8px)' }}
                                >
                                  📧 {sendingLink === s.interviewId ? 'Sending...' : 'Send Test Link'}
                                </button>
                              )}
                              {/* Open Test — opens candidate test portal */}
                              <button
                                onClick={() => { setOpenMenuId(null); window.open('/test', '_blank'); }}
                                className={`w-full text-left px-3 py-2 text-xs cursor-pointer flex items-center gap-2 rounded-lg mx-1 ${darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                style={{ width: 'calc(100% - 8px)' }}
                              >
                                🔗 Open Test
                              </button>
                              <button
                                onClick={() => { openEdit(s); setOpenMenuId(null); }}
                                className={`w-full text-left px-3 py-2 text-xs cursor-pointer flex items-center gap-2 rounded-lg mx-1 ${darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                style={{ width: 'calc(100% - 8px)' }}
                              >
                                ✏️ Reschedule
                              </button>

                              {/* Status — inline dropdown */}
                              <div className={`mx-2 my-1.5 border-t ${darkMode ? 'border-slate-600' : 'border-slate-100'}`} />
                              <div className="px-2 pb-1">
                                <p className={`text-xs font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                                <select
                                  value={s.status || ''}
                                  onChange={e => { handleStatusUpdate(s.interviewId, e.target.value); setOpenMenuId(null); }}
                                  className={`w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                                >
                                  {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(st => (
                                    <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                  ))}
                                </select>
                              </div>

                              <div className={`mx-2 my-1.5 border-t ${darkMode ? 'border-slate-600' : 'border-slate-100'}`} />
                              <button
                                onClick={() => { del(s.interviewId); setOpenMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-xs cursor-pointer text-red-500 hover:bg-red-50 flex items-center gap-2 rounded-lg mx-1"
                                style={{ width: 'calc(100% - 8px)' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && <tr><td colSpan={10} className="px-4 py-6 text-center text-slate-400 text-sm">No schedules found.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((s, i) => {
                const badge = getLabel(s);
                const initials = (s.user?.name || 'NA').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const avatarColor = avatarColors[(s.interviewId || 0) % avatarColors.length];
                return (
                  <div key={s.interviewId} className={`rounded-lg border p-3 sm:p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      {profileImages[s.user?.id] ? (
                        <img src={profileImages[s.user?.id]} alt={s.user?.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => { setSelectedImageId(s.user?.id); setSelectedCandidateName(s.user?.name || 'Candidate'); setShowImageZoom(true); }}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`} style={{ display: profileImages[s.user?.id] ? 'none' : 'flex' }}>{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{page * PAGE_SIZE + i + 1}. {s.user?.name || 'N/A'}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.user?.email || '—'}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-start text-sm">
                        <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Date & Time</span>
                        <div className="text-right">
                          <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{s.testDate ? new Date(s.testDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.testTime || '—'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between items-start text-sm">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Duration</span>
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{s.testDurationMinutes} min</span>
                        </div>
                        <div className="flex justify-between items-start text-sm">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Max Q</span>
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{s.maxQuestion ?? '—'}</span>
                        </div>
                      </div>
                      {Array.isArray(s.categoryIds) && s.categoryIds.length > 0 && (
                        <div className="flex justify-between items-start text-sm">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Categories</span>
                          <span className={`text-right ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.categoryIds.join(', ')}</span>
                        </div>
                      )}
                      {Array.isArray(s.difficultyLevels) && s.difficultyLevels.length > 0 && (
                        <div className="flex justify-between items-start text-sm">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Difficulty</span>
                          <div className="flex flex-wrap gap-1 justify-end">{s.difficultyLevels.map(level => (<DiffBadge key={level} level={level} />))}</div>
                        </div>
                      )}
                      {s.interviewerName && (
                        <div className="flex justify-between items-start text-sm">
                          <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Interviewer</span>
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{s.interviewerName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {s.status !== 'COMPLETED' && <button onClick={() => handleSendLink(s)} disabled={sendingLink === s.interviewId} className="flex-1 min-w-max px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs cursor-pointer disabled:opacity-50">{sendingLink === s.interviewId ? 'Sending...' : 'Send Link'}</button>}
                      <button onClick={() => openEdit(s)} className="flex-1 min-w-max px-3 py-2 border rounded-lg font-medium text-xs cursor-pointer transition-colors" style={{borderColor: darkMode ? 'rgb(100, 116, 139)' : 'rgb(203, 213, 225)', color: darkMode ? 'rgb(148, 163, 184)' : 'rgb(71, 85, 105)'}}>Reschedule</button>
                      <button onClick={() => del(s.interviewId)} className="px-3 py-2 text-red-600 font-medium text-xs cursor-pointer" title="Delete">🗑️</button>
                    </div>
                  </div>
                );
              })}
              {paginated.length === 0 && (<div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}><p className="text-sm">No schedules found.</p></div>)}
            </div>

            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
          </>
        )}
      </div>

      {modal === 'form' && (
        <Modal title={editId ? 'Reschedule Interview' : 'Schedule Interview'} onClose={() => setModal(null)} darkMode={darkMode}>
          <Field label="Candidate *">
            <SearchableSelect
              options={candidates}
              value={form.candidateId}
              onChange={(val) => setForm({ ...form, candidateId: val })}
              placeholder="Select candidate"
              searchPlaceholder="Search candidates..."
              darkMode={darkMode}
              displayKey="name"
              valueKey="id"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Test Date *">
              <input type="date" className={inputCls(darkMode)} value={form.testDate} onChange={e => setForm({ ...form, testDate: e.target.value })} />
            </Field>
            <Field label="Test Time *">
              <input type="time" className={inputCls(darkMode)} value={form.testTime} onChange={e => setForm({ ...form, testTime: e.target.value })} />
            </Field>
            <Field label="Duration (minutes)">
              <input type="number" min={15} max={480} className={inputCls(darkMode)} value={form.testDurationMinutes} onChange={e => setForm({ ...form, testDurationMinutes: e.target.value })} />
            </Field>
            <Field label="Max Questions">
              <input type="number" min={1} className={inputCls(darkMode)} value={form.maxQuestion} onChange={e => setForm({ ...form, maxQuestion: e.target.value })} />
            </Field>
          </div>
          <Field label="Categories (select multiple)">
            <div className={`border rounded-lg p-2 min-h-[44px] ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}>
              {form.categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.categoryIds.map(id => {
                    const cat = categories.find(c => c.categoryId === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {cat ? cat.categoryName : `ID:${id}`}
                        <button type="button" onClick={() => toggleCategory(id)} className="hover:text-blue-900 cursor-pointer font-bold leading-none ml-0.5">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => {
                  const selected = form.categoryIds.includes(c.categoryId);
                  return (
                    <button key={c.categoryId} type="button" onClick={() => toggleCategory(c.categoryId)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : darkMode
                            ? 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}>
                      {selected ? '✓ ' : ''}{c.categoryName}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <span className={`text-xs italic ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>No categories yet — add some in the Categories tab.</span>
                )}
              </div>
            </div>
          </Field>
          <Field label="Difficulty Levels (optional, select multiple)">
            <div className={`border rounded-lg p-2 min-h-[44px] ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'}`}>
              {form.difficultyLevels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.difficultyLevels.map(level => {
                    const colorMap = {
                      EASY: 'bg-green-100 text-green-700',
                      MEDIUM: 'bg-yellow-100 text-yellow-700',
                      HARD: 'bg-red-100 text-red-700'
                    };
                    return (
                      <span key={level} className={`inline-flex items-center gap-1 px-2.5 py-1 ${colorMap[level]} rounded-full text-xs font-medium`}>
                        {level}
                        <button type="button" onClick={() => toggleDifficulty(level)} className="hover:opacity-80 cursor-pointer font-bold leading-none ml-0.5">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {['EASY', 'MEDIUM', 'HARD'].map(level => {
                  const selected = form.difficultyLevels.includes(level);
                  const colorMap = {
                    EASY: selected ? 'bg-green-600 text-white border-green-600' : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
                    MEDIUM: selected ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
                    HARD: selected ? 'bg-red-600 text-white border-red-600' : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                  };
                  return (
                    <button key={level} type="button" onClick={() => toggleDifficulty(level)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border ${colorMap[level]}`}>
                      {selected ? '✓ ' : ''}{level}
                    </button>
                  );
                })}
              </div>
              <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Select difficulty levels to filter questions for this interview
              </p>
            </div>
          </Field>
          <Field label="Interviewer Name *">
            <SearchableSelect
              options={members}
              value={form.interviewerName}
              onChange={(val) => {
                // Find selected member and set their name
                const selectedMember = members.find(m => m.id === val);
                setForm({ ...form, interviewerName: selectedMember ? selectedMember.name : val });
              }}
              placeholder="Select interviewer"
              searchPlaceholder="Search interviewers..."
              darkMode={darkMode}
              displayKey="name"
              valueKey="name" // Use name as value since interviewerName is stored as string
            />
          </Field>
          <Field label="Location">
            <input className={inputCls(darkMode)} value={form.interviewLocation} onChange={e => setForm({ ...form, interviewLocation: e.target.value })} placeholder="e.g. Room 101 / Online" />
          </Field>
          <Field label="Remarks">
            <textarea className={inputCls(darkMode)} rows={2} value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Optional notes..." />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setModal(null)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showImageZoom}
        imageUrl={selectedImageId && profileImages[selectedImageId] ? profileImages[selectedImageId] : ''}
        imageName={selectedCandidateName}
        onClose={() => setShowImageZoom(false)}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const CategoriesTab = ({ darkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ categoryName: '', description: '', totalQuestions: 10 });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const load = async () => {
    setLoading(true);
    try { setCategories(Array.isArray(await testCategoryAPI.getAll()) ? (await testCategoryAPI.getAll()) : []); }
    catch (_) { setCategories([]); }
    setLoading(false);
  };

  // Simpler load using single call
  const reload = async () => {
    setLoading(true);
    try {
      const data = await testCategoryAPI.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (_) { setCategories([]); }
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  const openCreate = () => { setForm({ categoryName: '', description: '', totalQuestions: 10 }); setEditId(null); setModal('form'); };
  const openEdit = (c) => { setForm({ categoryName: c.categoryName, description: c.description || '', totalQuestions: c.totalQuestions }); setEditId(c.categoryId); setModal('form'); };

  const save = async () => {
    if (!form.categoryName.trim()) { alert('Category name is required.'); return; }
    setSaving(true);
    try {
      if (editId) await testCategoryAPI.update(editId, form);
      else await testCategoryAPI.create(form);
      setModal(null); reload();
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await testCategoryAPI.delete(id); reload(); }
    catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = categories.filter(c => !search || c.categoryName?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search categories..." darkMode={darkMode} />
        <span className={`text-sm self-center shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{filtered.length} categories</span>
        <button onClick={openCreate} className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">+ Add Category</button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? <p className="p-6 text-slate-400 text-sm">Loading...</p> : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>{['#', 'Name', 'Description', 'Questions', 'Actions'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginated.map((c, i) => (
                    <tr key={c.categoryId} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{page * PAGE_SIZE + i + 1}</td>
                      <td className={`px-4 py-3 font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{c.categoryName}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.description || '—'}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{c.totalQuestions}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => openEdit(c)} className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm">Edit</button>
                        <button onClick={() => del(c.categoryId)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">No categories found.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((c, i) => (
                <div key={c.categoryId} className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{page * PAGE_SIZE + i + 1}. {c.categoryName}</p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.totalQuestions} questions</p>
                    </div>
                  </div>
                  {c.description && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{c.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs cursor-pointer">Edit</button>
                    <button onClick={() => del(c.categoryId)} className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-xs cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
              {paginated.length === 0 && (
                <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p className="text-sm">No categories found.</p>
                </div>
              )}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
          </>
        )}
      </div>

      {modal === 'form' && (
        <Modal title={editId ? 'Edit Category' : 'Add Category'} onClose={() => setModal(null)} darkMode={darkMode}>
          <Field label="Category Name *">
            <input className={inputCls(darkMode)} value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })} placeholder="e.g. JavaScript" />
          </Field>
          <Field label="Description">
            <textarea className={inputCls(darkMode)} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          </Field>
          <Field label="Total Questions">
            <input type="number" min={1} className={inputCls(darkMode)} value={form.totalQuestions} onChange={e => setForm({ ...form, totalQuestions: Number(e.target.value) })} />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setModal(null)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTIONS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const QuestionsTab = ({ darkMode }) => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ questionText: '', difficultyLevel: 'MEDIUM', marks: 1, categoryId: '', isActive: true });
  const [options, setOptions] = useState([
    { optionLabel: 'A', optionText: '', isCorrect: false },
    { optionLabel: 'B', optionText: '', isCorrect: false },
    { optionLabel: 'C', optionText: '', isCorrect: false },
    { optionLabel: 'D', optionText: '', isCorrect: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const reload = async () => {
    setLoading(true);
    try {
      const [qs, cats] = await Promise.all([questionsAPI.getAll(), testCategoryAPI.getAll()]);
      setQuestions(Array.isArray(qs) ? qs : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (_) { setQuestions([]); setCategories([]); }
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const blankOptions = () => [
    { optionLabel: 'A', optionText: '', isCorrect: false },
    { optionLabel: 'B', optionText: '', isCorrect: false },
    { optionLabel: 'C', optionText: '', isCorrect: false },
    { optionLabel: 'D', optionText: '', isCorrect: false },
  ];

  const openCreate = () => {
    setForm({ questionText: '', difficultyLevel: 'MEDIUM', marks: 1, categoryId: categories[0]?.categoryId || '', isActive: true });
    setOptions(blankOptions());
    setEditId(null); setModal('form');
  };

  const openEdit = async (q) => {
    setForm({ questionText: q.questionText, difficultyLevel: q.difficultyLevel, marks: q.marks, categoryId: q.category?.categoryId || '', isActive: q.isActive });
    setEditId(q.questionId);
    try {
      const opts = await questionOptionsAPI.getByQuestion(q.questionId);
      if (Array.isArray(opts) && opts.length > 0) {
        const sorted = ['A', 'B', 'C', 'D'].map(label => {
          const found = opts.find(o => o.optionLabel === label);
          return found ? { optionId: found.optionId, optionLabel: label, optionText: found.optionText, isCorrect: found.isCorrect }
                       : { optionLabel: label, optionText: '', isCorrect: false };
        });
        setOptions(sorted);
      } else { setOptions(blankOptions()); }
    } catch (_) { setOptions(blankOptions()); }
    setModal('form');
  };

  const save = async () => {
    if (!form.questionText.trim()) { alert('Question text is required.'); return; }
    if (!form.categoryId) { alert('Please select a category.'); return; }
    if (!options.some(o => o.isCorrect)) { alert('Please mark one option as correct.'); return; }
    setSaving(true);
    try {
      const payload = {
        questionText: form.questionText,
        difficultyLevel: form.difficultyLevel,
        marks: Number(form.marks),
        isActive: form.isActive,
        category: { categoryId: Number(form.categoryId) },
      };
      let q;
      if (editId) {
        q = await questionsAPI.update(editId, payload);
        for (const opt of options) {
          if (!opt.optionText.trim()) continue;
          const optPayload = { optionLabel: opt.optionLabel, optionText: opt.optionText, isCorrect: opt.isCorrect, question: { questionId: q.questionId } };
          if (opt.optionId) await questionOptionsAPI.update(opt.optionId, optPayload);
          else await questionOptionsAPI.create(optPayload);
        }
      } else {
        q = await questionsAPI.create(payload);
        for (const opt of options) {
          if (opt.optionText.trim()) await questionOptionsAPI.create({ ...opt, question: { questionId: q.questionId } });
        }
      }
      setModal(null); reload();
    } catch (e) { alert('Error: ' + e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this question and all its options?')) return;
    try { await questionsAPI.delete(id); reload(); }
    catch (e) { alert('Error: ' + e.message); }
  };

  const filtered = (filterCat ? questions.filter(q => q.category?.categoryId === Number(filterCat)) : questions)
    .filter(q => !search || q.questionText?.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search questions..." darkMode={darkMode} />
        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(0); }}
          className={`shrink-0 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
        </select>
        <button onClick={openCreate} className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">+ Add Question</button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? <p className="p-6 text-slate-400 text-sm">Loading...</p> : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>{['#', 'Question', 'Category', 'Difficulty', 'Marks', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginated.map((q, i) => (
                    <tr key={q.questionId} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{page * PAGE_SIZE + i + 1}</td>
                      <td className={`px-4 py-3 max-w-xs ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <p className="truncate">{q.questionText}</p>
                      </td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{q.category?.categoryName || '—'}</td>
                      <td className="px-4 py-3"><DiffBadge level={q.difficultyLevel} /></td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{q.marks}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {q.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => openEdit(q)} className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm">Edit</button>
                        <button onClick={() => del(q.questionId)} className="text-red-500 hover:text-red-700 cursor-pointer text-sm">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-sm">No questions found.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((q, i) => (
                <div key={q.questionId} className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`shrink-0 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{page * PAGE_SIZE + i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{q.questionText}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Category</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{q.category?.categoryName || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Difficulty</span>
                      <DiffBadge level={q.difficultyLevel} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Marks</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{q.marks}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Status</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${q.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {q.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(q)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs cursor-pointer">Edit</button>
                    <button onClick={() => del(q.questionId)} className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-xs cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
              {paginated.length === 0 && (
                <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p className="text-sm">No questions found.</p>
                </div>
              )}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
          </>
        )}
      </div>

      {modal === 'form' && (
        <Modal title={editId ? 'Edit Question' : 'Add Question'} onClose={() => setModal(null)} darkMode={darkMode}>
          <Field label="Category *">
            <select className={inputCls(darkMode)} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </Field>
          <Field label="Question Text *">
            <textarea className={inputCls(darkMode)} rows={3} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} placeholder="Enter question..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Difficulty">
              <select className={inputCls(darkMode)} value={form.difficultyLevel} onChange={e => setForm({ ...form, difficultyLevel: e.target.value })}>
                {['EASY', 'MEDIUM', 'HARD'].map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Marks">
              <input type="number" min={1} className={inputCls(darkMode)} value={form.marks} onChange={e => setForm({ ...form, marks: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputCls(darkMode)} value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
          <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Options — select the correct one ✓</p>
          {options.map((opt, idx) => (
            <div key={opt.optionLabel} className="flex items-center gap-2 mb-2">
              <span className={`w-6 text-sm font-bold shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{opt.optionLabel}</span>
              <input className={`${inputCls(darkMode)} flex-1`} placeholder={`Option ${opt.optionLabel}`} value={opt.optionText}
                onChange={e => setOptions(options.map((o, i) => i === idx ? { ...o, optionText: e.target.value } : o))} />
              <input type="radio" name="correct" checked={opt.isCorrect}
                onChange={() => setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx })))}
                className="w-4 h-4 cursor-pointer accent-blue-600" title="Mark as correct" />
            </div>
          ))}
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setModal(null)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CANDIDATES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const SOURCE_MAP = {
  DIRECT_APPLY: 'DIRECT_APPLY', LINKEDIN_SOURCED: 'LINKEDIN_SOURCED',
  REFERRAL: 'REFERRAL', CAMPUS_HIRE: 'CAMPUS_HIRE', FACEBOOK: 'FACEBOOK',
  AGENCY: 'AGENCY', JOB_PORTAL: 'JOB_PORTAL', INTERNAL_TRANSFER: 'INTERNAL_TRANSFER',
};

const CandidatesTab = ({ darkMode }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editModal, setEditModal] = useState(null); // candidate being edited
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const PAGE_SIZE = 5;

  const reload = async () => {
    setLoading(true);
    try {
      const data = await candidatesAPI.getAllUnpaged();
      const list = Array.isArray(data) ? data : [];
      setCandidates(list.map(c => ({
        id: c.id,
        name: c.name || c.username || '—',
        email: c.email || '—',
        phone: c.phone || '—',
        education: c.department || '—',
        source: c.candidateSource || '—',
        status: c.candidateThread || '—',
        added: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
      })));
    } catch (_) { setCandidates([]); }
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const openEdit = (c) => {
    setEditForm({ name: c.name, email: c.email, phone: c.phone, education: c.education, source: c.source, status: c.status });
    setEditModal(c);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      // Update via candidate profile endpoint — patch what we can
      await candidatesAPI.getById(editModal.id); // verify exists
      // Reflect changes locally since there's no direct update endpoint
      setCandidates(prev => prev.map(c => c.id === editModal.id ? { ...c, ...editForm } : c));
      setEditModal(null);
    } catch (_) {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    // Remove from local list (no delete endpoint for UserProfile)
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const filtered = candidates.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const statusBadge = (status) => {
    const isActive = status === 'ACTIVE';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {isActive ? 'Active' : 'Passive'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search by name or email..." darkMode={darkMode} />
        <span className={`text-sm self-center shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{filtered.length} candidates</span>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? <p className="p-6 text-slate-400 text-sm">Loading...</p> : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'Education', 'Source', 'Status', 'Added', 'Actions'].map(h => (
                      <th key={h} className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c, i) => (
                    <tr key={c.id} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50/80'}`}>
                      <td className={`px-4 py-3.5 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{page * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => navigate(`/candidate/${c.id}`)}
                          className={`font-semibold text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {c.name}
                        </button>
                      </td>
                      <td className={`px-4 py-3.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.email}</td>
                      <td className={`px-4 py-3.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.phone}</td>
                      <td className={`px-4 py-3.5 max-w-[220px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="line-clamp-2">{c.education}</span>
                      </td>
                      <td className={`px-4 py-3.5 text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.source || '—'}</td>
                      <td className="px-4 py-3.5">{statusBadge(c.status)}</td>
                      <td className={`px-4 py-3.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.added}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(c)}
                            className="text-blue-500 hover:text-blue-700 text-xs font-medium cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium cursor-pointer transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-sm">No candidates found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((c, i) => (
                <div key={c.id} className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <button onClick={() => navigate(`/candidate/${c.id}`)} className={`font-bold text-sm text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{page * PAGE_SIZE + i + 1}. {c.name}</button>
                    {statusBadge(c.status)}
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{c.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Phone</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{c.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Education</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{c.education}</span>
                    </div>
                    {c.source && (
                      <div className="flex justify-between">
                        <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Source</span>
                        <span className="text-xs font-medium">{c.source}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Added</span>
                      <span className="text-xs">{c.added}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs cursor-pointer">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium text-xs cursor-pointer">Delete</button>
                  </div>
                </div>
              ))}
              {paginated.length === 0 && (
                <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p className="text-sm">No candidates found.</p>
                </div>
              )}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal title="Edit Candidate" onClose={() => setEditModal(null)} darkMode={darkMode}>
          <Field label="Full Name">
            <input className={inputCls(darkMode)} value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls(darkMode)} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className={inputCls(darkMode)} value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
          </Field>
          <Field label="Education / Qualification">
            <input className={inputCls(darkMode)} value={editForm.education} onChange={e => setEditForm({ ...editForm, education: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setEditModal(null)} className={`px-4 py-2 rounded-lg text-sm cursor-pointer ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ResultsTab = ({ darkMode }) => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [passFilter, setPassFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [scoreModal, setScoreModal] = useState(null);
  const [examModal, setExamModal] = useState(null);
  const [examDetails, setExamDetails] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const PAGE_SIZE = 5;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await testResultsAPI.getAll();
        setResults(Array.isArray(data) ? [...data].reverse() : []);
      } catch (_) { setResults([]); }
      setLoading(false);
    };
    load();
  }, []);

  const openExam = async (r) => {
    setExamModal(r);
    setExamLoading(true);
    setExamDetails([]);
    try {
      const details = await testResultsAPI.getDetails(r.resultId);
      setExamDetails(Array.isArray(details) ? details : []);
    } catch (_) { setExamDetails([]); }
    setExamLoading(false);
  };

  const filtered = results.filter(r => {
    const matchSearch = !search || r.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchPass = passFilter === 'ALL' || r.passStatus === passFilter;
    return matchSearch && matchPass;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fmtDuration = (secs) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }} placeholder="Search by candidate name..." darkMode={darkMode} />
        <div className="flex gap-1 shrink-0">
          {[['ALL', 'All'], ['PASS', 'Pass'], ['FAIL', 'Fail']].map(([key, label]) => (
            <button key={key} onClick={() => { setPassFilter(key); setPage(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                passFilter === key ? 'bg-blue-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{label}</button>
          ))}
        </div>
        <span className={`text-sm self-center shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{filtered.length} results</span>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? <p className="p-6 text-slate-400 text-sm">Loading...</p> : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className={darkMode ? 'bg-slate-700' : 'bg-slate-50'}>
                  <tr>{['#', 'Candidate', 'Score', 'Correct', 'Incorrect', 'Skipped', 'Marks', 'Duration', 'Start Time', 'End Time', 'Submission', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`text-left px-4 py-3 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
                    <tr key={r.resultId} className={`border-t ${darkMode ? 'border-slate-700 hover:bg-slate-700/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{page * PAGE_SIZE + i + 1}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => r.user?.id && navigate(`/candidate/${r.user.id}`)}
                          className={`font-medium text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {r.user?.name || 'N/A'}
                        </button>
                      </td>
                      <td className={`px-4 py-3 font-bold ${r.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>{Number(r.percentageScore).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-green-600 font-medium">{r.correctAnswers}</td>
                      <td className="px-4 py-3 text-red-500 font-medium">{r.incorrectAnswers}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.unattemptedQuestions}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{r.obtainedMarks}/{r.totalMarks}</td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{fmtDuration(r.testDurationSeconds)}</td>
                      <td className="px-4 py-3">
                        <div className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {r.testStartTime ? (
                            <>
                              <div className="font-medium">
                                {new Date(r.testStartTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className={`mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {new Date(r.testStartTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true 
                                })}
                              </div>
                            </>
                          ) : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {r.testEndTime ? (
                            <>
                              <div className="font-medium">
                                {new Date(r.testEndTime).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className={`mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {new Date(r.testEndTime).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true 
                                })}
                              </div>
                            </>
                          ) : '—'}
                        </div>
                      </td>
                      {/* Submission Reason Badge */}
                      <td className="px-4 py-3">
                        {(() => {
                          const reason = r.submissionReason || 'MANUAL_SUBMIT';
                          const badges = {
                            MANUAL_SUBMIT: { icon: '✅', text: 'Manual', cls: 'bg-green-100 text-green-700 ring-green-200' },
                            TIME_EXPIRED: { icon: '⏰', text: 'Time Up', cls: 'bg-orange-100 text-orange-700 ring-orange-200' },
                            TAB_SWITCH: { icon: '⚠️', text: 'Tab Switch', cls: 'bg-red-100 text-red-700 ring-red-200' },
                            BROWSER_CLOSE: { icon: '🚫', text: 'Browser Closed', cls: 'bg-red-100 text-red-700 ring-red-200' },
                          };
                          const badge = badges[reason] || badges.MANUAL_SUBMIT;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ring-1 ${badge.cls}`} title={reason}>
                              <span>{badge.icon}</span>
                              <span>{badge.text}</span>
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={r.passStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setScoreModal(r)} className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm" title="View Scores">
                            📊 Score
                          </button>
                          <button onClick={() => openExam(r)} className="text-purple-500 hover:text-purple-700 cursor-pointer text-sm whitespace-nowrap" title="View Exam">
                            📝 Exam
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                await candidatesAPI.downloadResume(r.user?.id);
                              } catch (error) {
                                console.error('Failed to download resume:', error);
                                alert('Failed to download resume. Please try again.');
                              }
                            }} 
                            className="text-green-500 hover:text-green-700 cursor-pointer text-sm whitespace-nowrap" 
                            title="Download Resume"
                          >
                            📥Resume
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && <tr><td colSpan={12} className="px-4 py-6 text-center text-slate-400 text-sm">No results found.</td></tr>}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {paginated.map((r, i) => (
                <div key={r.resultId} className={`rounded-lg border p-4 ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => r.user?.id && navigate(`/candidate/${r.user.id}`)} className={`font-bold text-sm text-left hover:underline cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{page * PAGE_SIZE + i + 1}. {r.user?.name || 'N/A'}</button>
                    <StatusBadge status={r.passStatus} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-600' : 'bg-white border border-slate-200'}`}>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Score</p>
                      <p className={`text-lg font-bold mt-1 ${r.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>{Number(r.percentageScore).toFixed(1)}%</p>
                    </div>
                    <div className={`rounded-lg p-3 ${darkMode ? 'bg-slate-600' : 'bg-white border border-slate-200'}`}>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Marks</p>
                      <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{r.obtainedMarks}/{r.totalMarks}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Correct</span>
                      <span className="text-green-600 font-medium">{r.correctAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Incorrect</span>
                      <span className="text-red-500 font-medium">{r.incorrectAnswers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Skipped</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{r.unattemptedQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Duration</span>
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{fmtDuration(r.testDurationSeconds)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => setScoreModal(r)} className="flex-1 min-w-max px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-blue-700">📊 Score</button>
                    <button onClick={() => openExam(r)} className="flex-1 min-w-max px-2 py-1.5 bg-purple-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-purple-700">📝 Exam</button>
                    <button onClick={async () => {
                      try {
                        await candidatesAPI.downloadResume(r.user?.id);
                      } catch (error) {
                        console.error('Failed to download resume:', error);
                        alert('Failed to download resume. Please try again.');
                      }
                    }} className="flex-1 min-w-max px-2 py-1.5 bg-green-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-green-700">📥 Resume</button>
                  </div>
                </div>
              ))}
              {paginated.length === 0 && (
                <div className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <p className="text-sm">No results found.</p>
                </div>
              )}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} darkMode={darkMode} />
          </>
        )}
      </div>

      {/* Score Modal */}
      {scoreModal && (
        <Modal title="Score Details" onClose={() => setScoreModal(null)} darkMode={darkMode}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${scoreModal.passStatus === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {Number(scoreModal.percentageScore).toFixed(0)}%
              </div>
              <div>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{scoreModal.user?.name || 'N/A'}</p>
                <StatusBadge status={scoreModal.passStatus} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Total Questions', scoreModal.totalQuestions],
                ['Correct Answers', scoreModal.correctAnswers],
                ['Incorrect Answers', scoreModal.incorrectAnswers],
                ['Unattempted', scoreModal.unattemptedQuestions],
                ['Marks Obtained', `${scoreModal.obtainedMarks} / ${scoreModal.totalMarks}`],
                ['Pass Percentage', `${scoreModal.passPercentage}%`],
                ['Duration', fmtDuration(scoreModal.testDurationSeconds)],
                ['Test Started', scoreModal.testStartTime ? new Date(scoreModal.testStartTime).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                }) : '—'],
                ['Test Ended', scoreModal.testEndTime ? new Date(scoreModal.testEndTime).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                }) : '—'],
                ['Submitted On', scoreModal.createdDate ? new Date(scoreModal.createdDate).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : '—'],
              ].map(([label, value]) => (
                <div key={label} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                  <p className={`font-semibold mt-0.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value ?? '—'}</p>
                </div>
              ))}
            </div>
            {scoreModal.remarks && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remarks</p>
                <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{scoreModal.remarks}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Exam Review Modal */}
      {examModal && (
        <Modal title={`Exam Review — ${examModal.user?.name || 'N/A'}`} onClose={() => { setExamModal(null); setExamDetails([]); }} darkMode={darkMode} wide>
          {/* Header summary */}
          <div className={`flex flex-wrap items-center gap-4 p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
            <div className={`text-2xl font-bold ${examModal.passStatus === 'PASS' ? 'text-green-600' : 'text-red-500'}`}>
              {Number(examModal.percentageScore).toFixed(1)}%
            </div>
            <StatusBadge status={examModal.passStatus} />
            <span className="text-green-600 text-sm font-medium">✓ {examModal.correctAnswers} Correct</span>
            <span className="text-red-500 text-sm font-medium">✗ {examModal.incorrectAnswers} Wrong</span>
            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>— {examModal.unattemptedQuestions} Skipped</span>
            <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{examModal.obtainedMarks}/{examModal.totalMarks} marks</span>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Correct</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Wrong</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Not Attempted</span>
          </div>

          {examLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : examDetails.length === 0 ? (
            <p className={`text-sm text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No question details available for this result.</p>
          ) : (
            <div className="space-y-4">
              {examDetails.map((d, idx) => {
                const candidateOptId = d.candidateAnswer?.optionId;
                const correctOptId = d.correctAnswer?.optionId;
                const allOptions = d.question?.options || [];
                return (
                  <div key={d.resultDetailId} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-start gap-2">
                        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{idx + 1}</span>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{d.question?.questionText || '—'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {d.question?.difficultyLevel && <DiffBadge level={d.question.difficultyLevel} />}
                        <span className={`text-xs ${d.isCorrect ? 'text-green-600 font-semibold' : candidateOptId ? 'text-red-500' : darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                          {d.isCorrect ? `+${d.marksObtained}` : candidateOptId ? '0' : '—'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 ml-9">
                      {/* Show correct answer and candidate answer */}
                      {[d.correctAnswer, d.candidateAnswer].filter(Boolean).reduce((acc, opt) => {
                        if (!acc.find(o => o.optionId === opt.optionId)) acc.push(opt);
                        return acc;
                      }, []).length === 0 && !candidateOptId ? (
                        <p className={`text-xs italic ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Not attempted — correct: {d.correctAnswer?.optionLabel}. {d.correctAnswer?.optionText}</p>
                      ) : (
                        <>
                          {/* Correct answer */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            candidateOptId === correctOptId
                              ? 'bg-green-50 border border-green-200 text-green-800'
                              : 'bg-green-50 border border-green-200 text-green-700'
                          }`}>
                            <span className="font-bold">{d.correctAnswer?.optionLabel}.</span>
                            <span>{d.correctAnswer?.optionText}</span>
                            <span className="ml-auto text-green-600 font-bold">✓</span>
                          </div>
                          {/* Candidate wrong answer */}
                          {candidateOptId && candidateOptId !== correctOptId && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                              <span className="font-bold">{d.candidateAnswer?.optionLabel}.</span>
                              <span>{d.candidateAnswer?.optionText}</span>
                              <span className="ml-auto text-red-500 font-bold">✗</span>
                            </div>
                          )}
                          {/* Not attempted */}
                          {!candidateOptId && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-slate-600 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-400'}`}>
                              <span className="italic">Not attempted</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className={`mt-4 pt-4 border-t text-sm font-medium text-center ${darkMode ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-700'}`}>
            Total: {examModal.obtainedMarks} / {examModal.totalMarks} marks
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const OnlineTest = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Online Test</h2>
        <p className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Manage test categories, questions, schedules and results</p>
      </div>

      {/* Tab bar - Scrollable on mobile */}
      <div className={`mb-4 sm:mb-6 border rounded-xl overflow-x-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        <div className={`flex gap-1 p-1 w-min sm:w-full`}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 sm:shrink ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'Dashboard'  && <DashboardTab  darkMode={darkMode} />}
      {activeTab === 'Categories' && <CategoriesTab darkMode={darkMode} />}
      {activeTab === 'Questions'  && <QuestionsTab  darkMode={darkMode} />}
      {activeTab === 'Candidates' && <CandidatesTab darkMode={darkMode} />}
      {activeTab === 'Schedules'  && <SchedulesTab  darkMode={darkMode} />}
      {activeTab === 'Results'    && <ResultsTab    darkMode={darkMode} />}
    </div>
  );
};

export default OnlineTest;
