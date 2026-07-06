/* eslint-disable react-hooks/exhaustive-deps */
 
/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from 'react';
import { testCandidatesAPI, interviewScheduleAPI, testAPI, questionsAPI, questionOptionsAPI, candidatesAPI } from '../utils/api';
import ProfileImageCaptureModal from './ProfileImageCaptureModal';

// ─── Timer component ──────────────────────────────────────────────────────────
const Timer = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef(null);
  const onExpireRef = useRef(onExpire);

  // Update the ref whenever onExpire changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); onExpireRef.current(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const isLow = remaining < 300; // last 5 min

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${isLow ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
      ⏱ {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
};

// ─── STEP 1: Login screen ─────────────────────────────────────────────────────
const LoginStep = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageNotUpdatedMsg, setImageNotUpdatedMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(''); setImageNotUpdatedMsg('');
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Step 1: Check testCandidates table by email
      let candidate = await testCandidatesAPI.getAll()
        .then(list => (Array.isArray(list) ? list : []).find(
          c => c.email?.toLowerCase() === normalizedEmail
        ))
        .catch(() => null);

      // Step 2: If not in testCandidates, check interview schedules directly by email
      if (!candidate) {
        const allSchedules = await interviewScheduleAPI.getAll().catch(() => []);
        const matchedSchedule = (Array.isArray(allSchedules) ? allSchedules : [])
          .find(s => (s.user?.email?.toLowerCase() === normalizedEmail || s.candidate?.email?.toLowerCase() === normalizedEmail)
                  && (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'));

        if (matchedSchedule) {
          // Get the actual candidate data (could be under s.user or s.candidate)
          const candidateData = matchedSchedule.user || matchedSchedule.candidate || {};
          
          // Auto-create in testCandidates so login works
          try {
            const created = await testCandidatesAPI.create({
              candidateName: candidateData.name || candidateData.candidateName || 'Candidate',
              email: candidateData.email,
              phoneNumber: candidateData.phone || candidateData.phoneNumber || '',
              gender: candidateData.gender || 'MALE',
              qualification: candidateData.qualification || candidateData.department || '',
              experienceYears: candidateData.experienceYears || 0,
            });
            candidate = created;
          } catch (_) {
            // Might already exist (race condition) — try fetching again
            candidate = await testCandidatesAPI.getAll()
              .then(list => (Array.isArray(list) ? list : []).find(
                c => c.email?.toLowerCase() === normalizedEmail
              ))
              .catch(() => null);
          }
        }
      }

      if (!candidate) {
        setError('This email is not registered for any test. Please check your email or contact HR.');
        setLoading(false);
        return;
      }

      // Step 3: Find active schedule for this candidate
      const schedules = await interviewScheduleAPI.getByCandidate(candidate.id).catch(() => []);
      let active = (Array.isArray(schedules) ? schedules : [])
        .find(s => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS');

      // Fallback: search all schedules by email if candidateId lookup missed
      if (!active) {
        const allSchedules = await interviewScheduleAPI.getAll().catch(() => []);
        active = (Array.isArray(allSchedules) ? allSchedules : [])
          .find(s => (s.user?.email?.toLowerCase() === normalizedEmail || s.candidate?.email?.toLowerCase() === normalizedEmail)
                  && (s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS'));
      }

      // Last fallback: latest schedule regardless of status (admin may have forgotten to set SCHEDULED)
      if (!active) {
        const allSchedules = await interviewScheduleAPI.getAll().catch(() => []);
        const allForEmail = (Array.isArray(allSchedules) ? allSchedules : [])
          .filter(s => (s.user?.email?.toLowerCase() === normalizedEmail || s.candidate?.email?.toLowerCase() === normalizedEmail)
                    && s.status !== 'CANCELLED' && s.status !== 'NO_SHOW');
        if (allForEmail.length > 0) {
          // Most recent schedule use karo
          active = allForEmail.sort((a, b) =>
            new Date(b.createdDate || 0) - new Date(a.createdDate || 0)
          )[0];
        }
      }

      if (!active) {
        setError('No test scheduled for this email. Please contact HR.');
        setLoading(false);
        return;
      }

      // Check if profile image exists
      try {
        const imageUrl = await candidatesAPI.getProfileImage(candidate.candidateId || candidate.id);
        if (!imageUrl) {
          setImageNotUpdatedMsg('⚠️ Profile Image Not Updated');
        }
      } catch (err) {
        setImageNotUpdatedMsg('⚠️ Profile Image Not Updated');
      }

      onLogin(candidate, active);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">📝</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Online Assessment</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your registered email to begin</p>
        </div>

        {imageNotUpdatedMsg && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-orange-800">{imageNotUpdatedMsg}</p>
              <p className="text-xs text-orange-700 mt-1">You'll need to capture your photo before starting the test</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              required
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Start Test →'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Make sure you have a stable internet connection before starting.
        </p>
      </div>
    </div>
  );
};

// ─── STEP 2: Instructions screen ─────────────────────────────────────────────
const InstructionsStep = ({ candidate, schedule, questionCount, onStart, hasProfileImage }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {candidate.name || candidate.candidateName}!</h1>
        <p className="text-slate-500 mt-1 text-sm">{candidate.email || candidate.emailId}</p>
      </div>

      {!hasProfileImage && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-orange-800 mb-2 text-lg flex items-center gap-2">
            <span>📸</span> Profile Photo Required
          </h2>
          <p className="text-sm text-orange-700">
            Before starting the test, you need to capture a profile photo. This helps verify your identity during the assessment.
          </p>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-blue-800 mb-3 text-lg">📋 Test Instructions</h2>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2"><span>✅</span> This test contains <strong>{schedule?.maxQuestion} multiple choice questions</strong></li>
          <li className="flex items-start gap-2"><span>✅</span> Total duration: <strong>{schedule?.testDurationMinutes || 30} minutes</strong></li>
          <li className="flex items-start gap-2"><span>✅</span> Each question has <strong>4 options</strong> — select the best answer</li>
          <li className="flex items-start gap-2"><span>✅</span> You can <strong>navigate between questions</strong> using the question palette</li>
          <li className="flex items-start gap-2"><span>✅</span> You can <strong>review and change</strong> your answers before submitting</li>
          <li className="flex items-start gap-2"><span>⚠️</span> The test will <strong>auto-submit</strong> when time runs out</li>
          <li className="flex items-start gap-2"><span>⚠️</span> Do <strong>not refresh</strong> the page during the test</li>
          <li className="flex items-start gap-2"><span>🚫</span> Do <strong>not switch tabs</strong> — 1st switch shows warning, 2nd auto-submits</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        {[['📝', String(schedule?.maxQuestion), 'Questions'], ['⏱', `${schedule?.testDurationMinutes || 30}`, 'Minutes'], ['🎯', '60%', 'Pass Mark']].map(([icon, val, label]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-slate-800">{val}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        disabled={!hasProfileImage}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-colors cursor-pointer ${
          hasProfileImage
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        {hasProfileImage ? 'Start Test Now →' : '📸 Please capture your profile photo first'}
      </button>
    </div>
  </div>
);

// ─── STEP 3: Test screen ─────────────────────────────────────────────────────
const TestStep = ({ candidate, schedule, questions, onSubmit }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [showConfirm, setShowConfirm] = useState(false);

  // Tab-switch / window-blur detection
  const [tabViolations, setTabViolations] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const tabViolationsRef = useRef(0);
  const submittedRef = useRef(false);
  const submissionReasonRef = useRef('MANUAL_SUBMIT'); // Track why test was submitted

  const current = questions && questions.length > 0 ? questions[currentIdx] : null;
  const answered = Object.keys(answers).length;
  const unanswered = questions && questions.length > 0 ? questions.length - answered : 0;

  if (!current || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-3">No Questions Found</h2>
          <p className="text-slate-600 text-sm mb-6">Unable to load test questions. Please contact HR.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // answers = { questionId: optionIndex (1-based, A=1, B=2, C=3, D=4) }
  const handleAnswer = (optionIndex) => {
    setAnswers({ ...answers, [current.questionId]: optionIndex });
  };

  const handleSubmit = useCallback((currentAnswers = null) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // Calculate actual elapsed time from when test started to submission
    const actualElapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    // Use passed answers or fall back to state answers
    const answersToUse = currentAnswers !== null ? currentAnswers : answers;
    
    // Validate answers exist and have content
    const answeredCount = Object.keys(answersToUse).length;
    console.log('📝 Test Submission:', {
      totalQuestions: questions.length,
      answeredCount,
      answersObject: answersToUse,
      reason: submissionReasonRef.current,
      actualElapsedTime: `${Math.floor(actualElapsedSeconds / 60)}m ${actualElapsedSeconds % 60}s (${actualElapsedSeconds}s total)`
    });
    
    const submission = {
      interviewId: schedule?.interviewId || 99,
      candidateId: candidate.candidateId,
      testDurationSeconds: actualElapsedSeconds,
      submissionReason: submissionReasonRef.current,
      answers: questions.map(q => ({
        questionId: q.questionId,
        selectedOptionId: answersToUse[q.questionId] || null,
        interviewId: schedule?.interviewId || 99,
      })),
    };
    console.log('📤 Submitting test:', submission);
    onSubmit(submission);
  }, [answers, candidate, questions, schedule, startTime, onSubmit]);

  const answersRef = useRef(answers);
  
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const autoSubmit = useCallback(() => {
    if (!showConfirm && !submittedRef.current) {
      submissionReasonRef.current = 'TIME_EXPIRED';
      // Use the ref to get the latest answers at the exact moment of expiry
      handleSubmit(answersRef.current);
    }
  }, [showConfirm, handleSubmit]);

  // ── Tab / window visibility guard ──────────────────────────────────────────
  // Only use visibilitychange — blur fires simultaneously and causes double-count
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden || submittedRef.current) return;

      tabViolationsRef.current += 1;
      const count = tabViolationsRef.current;
      setTabViolations(count);

      if (count <= 2) {
        // 1st or 2nd violation → show warning
        setShowTabWarning(true);
      } else {
        // 3rd violation → auto-submit
        setShowTabWarning(false);
        submissionReasonRef.current = 'TAB_SWITCH';
        // Use answersRef to get latest answers at the moment of violation
        handleSubmit(answersRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleSubmit]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Tab-switch WARNING modal — 1st & 2nd violation */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border-4 border-orange-400">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-orange-600 mb-2">
              Tab Switch Detected! ({tabViolations}/2 Warnings)
            </h3>
            <p className="text-slate-700 text-sm mb-2">
              You switched away from the test window.
            </p>
            {tabViolations < 2 ? (
              <p className="text-orange-600 font-semibold text-sm mb-5">
                ⚠️ You have <strong>1 warning remaining</strong>. If you switch tabs one more time, your test will be <strong>automatically submitted</strong>.
              </p>
            ) : (
              <p className="text-red-600 font-semibold text-sm mb-5">
                🚨 <strong>Final Warning!</strong> The next tab switch will <strong>immediately auto-submit</strong> your test with answers attempted so far.
              </p>
            )}
            <button
              onClick={() => setShowTabWarning(false)}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 cursor-pointer"
            >
              I Understand — Return to Test
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">Online Assessment</h2>
          <p className="text-xs text-slate-500 truncate max-w-[160px] sm:max-w-xs">{candidate.name || candidate.candidateName}</p>
        </div>
        <div className="flex items-center gap-2">
          {tabViolations > 0 && (
            <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${
              tabViolations >= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              ⚠️ Warning {tabViolations}/2
            </span>
          )}
          <Timer seconds={(schedule?.testDurationMinutes || 30) * 60} onExpire={autoSubmit} />
        </div>
      </div>

      {/* Main content — full width, no sidebar */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Question {currentIdx + 1} of {questions.length}</span>
              <span>{answered} answered · {unanswered} remaining</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                current.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-700' :
                current.difficultyLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {current.difficultyLevel} · {current.marks} {current.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-5 leading-relaxed">
              {current.questionText}
            </h3>

            <div className="space-y-3">
              {(current.options || []).map((opt, idx) => {
                const optionIndex = idx + 1;
                const isSelected = answers[current.questionId] === optionIndex;
                return (
                  <label
                    key={opt.optionId}
                    className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${current.questionId}`}
                      checked={isSelected}
                      onChange={() => handleAnswer(optionIndex)}
                      className="mt-0.5 w-4 h-4 text-blue-600 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 text-sm sm:text-base">
                      <span className="font-semibold text-slate-700 mr-1">{opt.optionLabel}.</span>
                      <span className="text-slate-700">{opt.optionText}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Question palette */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Question Palette</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-200 inline-block"></span> Done ({answered})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-200 inline-block"></span> Left ({unanswered})
                </span>
              </div>
            </div>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-8 w-full rounded-lg font-semibold text-xs cursor-pointer transition-all ${
                    i === currentIdx
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : answers[q.questionId]
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              ← Prev
            </button>

            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 cursor-pointer text-sm"
              >
                Submit ✓
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
                className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 cursor-pointer text-sm"
              >
                Next →
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-3">Submit Test?</h3>
            <p className="text-slate-600 mb-2">
              You have answered <strong>{answered}</strong> out of <strong>{questions.length}</strong> questions.
            </p>
            {unanswered > 0 && (
              <p className="text-orange-600 text-sm mb-4">⚠️ {unanswered} questions are unanswered.</p>
            )}
            <p className="text-slate-500 text-sm mb-6">Once submitted, you cannot change your answers.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submissionReasonRef.current = 'MANUAL_SUBMIT'; // Ensure manual submit reason
                  handleSubmit(answers); // Pass current answers
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STEP 4: Result screen ────────────────────────────────────────────────────
const ResultStep = ({ result, candidate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-10 text-center">

        {/* Green checkmark icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Thank You heading */}
        <h1 className="text-4xl font-bold text-green-600 mb-3">Thank You!</h1>

        {/* Candidate name */}
        <p className="text-xl font-semibold text-slate-700 mb-4">
          Dear {candidate.name || candidate.candidateName || 'Candidate'},
        </p>

        {/* Main message */}
        <p className="text-slate-600 text-base leading-relaxed mb-6">
          Your test has been successfully submitted. We truly appreciate the time and effort you put into completing this assessment.
        </p>

        {/* Divider */}
        <div className="w-16 h-1 bg-green-400 rounded-full mx-auto mb-6"></div>

        {/* Best wishes message */}
        <p className="text-slate-500 text-sm leading-relaxed mb-2">
          Our team will review your responses and get back to you shortly with the next steps.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          We wish you all the very best in your journey ahead. 🌟
        </p>

        {/* Best wishes badge */}
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-5 py-2.5 rounded-full text-sm font-medium">
          🍀 Best Wishes from TalentPool AI Team
        </div>

        <p className="text-xs text-slate-400 mt-8">
          You may now close this window.
        </p>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const CandidateTestPortal = () => {
  const [step, setStep] = useState('login'); // login | profileImage | instructions | test | result
  const [candidate, setCandidate] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [showProfileImageCapture, setShowProfileImageCapture] = useState(false);

  const handleLogin = async (cand, sched) => {
    setLoading(true);
    try {
      // Check if candidate has profile image
      let hasImage = false;
      try {
        const imageUrl = await candidatesAPI.getProfileImage(cand.candidateId || cand.id);
        hasImage = !!imageUrl;
      } catch (err) {
        hasImage = false;
      }
      
      // Set candidate and schedule first
      setCandidate(cand);
      setSchedule(sched);
      setHasProfileImage(hasImage);
      
      // Load questions
      await loadTestQuestions(sched);
      
      // Show modal if no profile image
      if (!hasImage) {
        setShowProfileImageCapture(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  // Auto-open camera modal when instructions page loads without profile image
  useEffect(() => {
    if (step === 'instructions' && !hasProfileImage && !showProfileImageCapture) {
      setShowProfileImageCapture(true);
    }
  }, [step, hasProfileImage]);

  const handleProfileImageCapture = async (imageFile) => {
    try {
      setLoading(true);
      // Upload the image
      await candidatesAPI.uploadProfileImage(candidate.candidateId || candidate.id, imageFile);
      setHasProfileImage(true);
      setShowProfileImageCapture(false);
      // Load questions and proceed to instructions
      await loadTestQuestions(schedule);
      setLoading(false);
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      alert('Failed to upload profile image. Please try again.');
      setLoading(false);
    }
  };

  const loadTestQuestions = async (sched = schedule) => {
    setLoading(true);
    try {
      let qs = [];

      // Use categoryIds, difficultyLevels, and maxQuestion from the schedule
      const categoryIds = Array.isArray(sched?.categoryIds) && sched.categoryIds.length > 0
        ? sched.categoryIds
        : null;
      const difficultyLevels = Array.isArray(sched?.difficultyLevels) && sched.difficultyLevels.length > 0
        ? sched.difficultyLevels
        : null;
      const maxQ = sched?.maxQuestion || 10;

      if (categoryIds && categoryIds.length > 0) {
        // Fetch ALL questions from specific categories first
        const allCatQuestions = await Promise.all(
          categoryIds.map(catId =>
            questionsAPI.getByCategory(catId).catch(() => [])
          )
        );

        // Flatten all questions from all categories
        let pooledQuestions = [];
        for (const catQs of allCatQuestions) {
          const list = Array.isArray(catQs) ? catQs : [];
          
          // Apply difficulty filter if specified
          const filtered = difficultyLevels 
            ? list.filter(q => difficultyLevels.includes(q.difficultyLevel))
            : list;
          
          pooledQuestions.push(...filtered);
        }

        // Remove duplicates (in case question appears in multiple categories)
        const uniqueQuestions = Array.from(new Map(pooledQuestions.map(q => [q.questionId, q])).values());

        // Shuffle and select exactly maxQ questions
        const shuffled = uniqueQuestions.sort(() => Math.random() - 0.5);
        qs = shuffled.slice(0, maxQ);

        // If not enough questions found, throw error
        if (qs.length < maxQ) {
          console.warn(`Only found ${qs.length} questions in selected categories (requested ${maxQ})`);
          setLoadError(`Not enough questions available. Found ${qs.length} questions but ${maxQ} were requested. Please adjust your test settings.`);
          setLoading(false);
          return;
        }
      } else {
        // No specific categories - fetch all active questions and distribute by difficulty
        let allQuestions = await questionsAPI.getActive().catch(() => []);
        allQuestions = Array.isArray(allQuestions) ? allQuestions : [];

        if (allQuestions.length > 0 && difficultyLevels && difficultyLevels.length > 0) {
          // Distribute evenly across all difficulty levels
          const perDifficulty = Math.ceil(maxQ / difficultyLevels.length);
          
          for (const difficulty of difficultyLevels) {
            const filtered = allQuestions.filter(q => q.difficultyLevel === difficulty);
            const shuffled = [...filtered].sort(() => Math.random() - 0.5);
            qs.push(...shuffled.slice(0, perDifficulty));
          }
          
          // Trim to exactly maxQuestion
          qs = qs.slice(0, maxQ);
        } else if (allQuestions.length > 0) {
          // No difficulty specified - just take first maxQ
          qs = allQuestions.slice(0, maxQ);
        }
        
        // Fallback for interview-specific questions if no results
        if (!Array.isArray(qs) || qs.length === 0) {
          if (sched?.interviewId && sched.interviewId !== 99) {
            qs = await testAPI.getQuestionsForInterview(sched.interviewId).catch(() => []);
            qs = qs?.questions || qs || [];
            
            // Apply difficulty filter if specified
            if (difficultyLevels && Array.isArray(qs)) {
              qs = qs.filter(q => difficultyLevels.includes(q.difficultyLevel));
            }
            qs = qs.slice(0, maxQ);
          }
        }
      }

      if (!Array.isArray(qs) || qs.length === 0) {
        setLoadError('No questions found for this test. Please contact HR.');
        setLoading(false);
        return;
      }

      // Ensure options are loaded for each question and sorted correctly
      const hasOptions = qs[0]?.options && Array.isArray(qs[0].options) && qs[0].options.length > 0;
      if (!hasOptions) {
        const qsWithOptions = await Promise.all(
          qs.map(async (q) => {
            try {
              const opts = await questionOptionsAPI.getByQuestion(q.questionId);
              // Sort options by optionLabel (A, B, C, D) to ensure correct order
              const sortedOpts = Array.isArray(opts) 
                ? opts.sort((a, b) => {
                    const labelOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
                    return (labelOrder[a.optionLabel] || 0) - (labelOrder[b.optionLabel] || 0);
                  })
                : [];
              return { ...q, options: sortedOpts };
            } catch (_) {
              return { ...q, options: [] };
            }
          })
        );
        const validQs = qsWithOptions.filter(q => q.options.length > 0);
        if (validQs.length === 0) {
          setLoadError('No questions with options found. Please contact HR.');
          setLoading(false);
          return;
        }
        setQuestions(validQs);
      } else {
        // Even if options exist, make sure they're sorted correctly
        const sortedQs = qs.map(q => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options.sort((a, b) => {
                const labelOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
                return (labelOrder[a.optionLabel] || 0) - (labelOrder[b.optionLabel] || 0);
              })
            : []
        }));
        setQuestions(sortedQs);
      }
    } catch (_) {
      setLoadError('Failed to load test questions. Please refresh and try again.');
      setLoading(false);
      return;
    }
    
    setLoading(false);
    if (sched?.interviewId && sched.interviewId !== 99) {
      interviewScheduleAPI.updateStatus(sched.interviewId, 'IN_PROGRESS').catch(() => {});
    }
    setStep('instructions');
  };

  const handleSubmit = async (submission) => {
    setLoading(true);
    // Status → COMPLETED (test submit ho gaya)
    if (submission.interviewId && submission.interviewId !== 99) {
      interviewScheduleAPI.updateStatus(submission.interviewId, 'COMPLETED').catch(() => {});
    }
    try {
      const res = await testAPI.submitTest(submission);
      setResult(res);
      setStep('result');
    } catch (err) {
      // Backend call failed — calculate result locally but still show result screen
      const currentQuestions = questions.length > 0 ? questions : [];
      let correct = 0, totalMarks = 0, obtainedMarks = 0;

      submission.answers.forEach(a => {
        const q = currentQuestions.find(q => q.questionId === a.questionId);
        if (!q) return;
        const qMarks = q.marks || 1;
        totalMarks += qMarks;
        if (a.selectedOptionId) {
          const selectedOpt = (q.options || [])[a.selectedOptionId - 1];
          if (selectedOpt?.isCorrect) {
            correct++;
            obtainedMarks += qMarks;
          }
        }
      });

      const total = submission.answers.length;
      const unattempted = submission.answers.filter(a => !a.selectedOptionId).length;
      const incorrect = total - correct - unattempted;
      const pct = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

      setResult({
        totalQuestions: total,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unattemptedQuestions: unattempted,
        totalMarks,
        obtainedMarks,
        percentageScore: pct,
        passStatus: pct >= 40 ? 'PASS' : 'FAIL',
        passPercentage: 40,
        testDurationSeconds: submission.testDurationSeconds,
      });
      setStep('result');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Please wait...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-3">Unable to Load Test</h2>
          <p className="text-slate-600 text-sm mb-6">{loadError}</p>
          <button
            onClick={() => { setLoadError(''); setStep('login'); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'login') return <LoginStep onLogin={handleLogin} />;
  if (step === 'instructions') return (
    <div>
      <InstructionsStep 
        candidate={candidate} 
        schedule={schedule} 
        questionCount={questions.length} 
        onStart={() => setStep('test')}
        hasProfileImage={hasProfileImage}
      />
      <ProfileImageCaptureModal
        isOpen={showProfileImageCapture}
        onCapture={handleProfileImageCapture}
        candidateName={candidate?.name || candidate?.candidateName || 'Candidate'}
      />
    </div>
  );
  if (step === 'test') return <TestStep candidate={candidate} schedule={schedule} questions={questions} onSubmit={handleSubmit} />;
  if (step === 'result') return <ResultStep result={result} candidate={candidate} />;
  return null;
};

export default CandidateTestPortal;
