import { useState, useEffect } from 'react';
import { candidatesAPI, messagingAPI, handleAPIError } from '../utils/api';
import { 
  HiEnvelope, 
  HiBriefcase, 
  HiPencilSquare, 
  HiHandThumbUp, 
  HiSparkles,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';
import { InlineLoader } from './PageLoader';

const MessagingCenter = ({ darkMode }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [messageTemplates, setMessageTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const templates = await messagingAPI.getTemplates();
        setMessageTemplates(templates || []);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
        // Keep empty array if fetch fails
        setMessageTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await candidatesAPI.getAllUnpaged();
        // Extract skills from nested skills object
        const mapped = data.map((c) => {
          let skillsList = [];
          if (c.skills) {
            const s = c.skills;
            skillsList = [
              ...(Array.isArray(s.front_end) ? s.front_end : []),
              ...(Array.isArray(s.back_end) ? s.back_end : []),
              ...(Array.isArray(s.databases) ? s.databases : []),
              ...(Array.isArray(s.devops) ? s.devops : []),
              ...(Array.isArray(s.other) ? s.other : []),
            ].filter(Boolean);
          }
          return {
            id: c.id,
            name: c.name || c.username || 'Unknown',
            email: c.email || 'N/A',
            skills: skillsList,
          };
        });
        setCandidates(mapped);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const toggleCandidate = (id) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedCandidates(filteredCandidates.map((c) => c.id));
  const deselectAll = () => setSelectedCandidates([]);

  const isBulk = selectedCandidates.length > 1;

  const handleSend = async () => {
    if (selectedCandidates.length === 0) {
      setError('Please select at least one candidate');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (!subject.trim()) {
      setError('Please enter a subject');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSending(true);
    setError('');
    setSuccessMessage('');

    try {
      // Always use send-bulk API — works for both single and multiple candidates
      const response = await messagingAPI.sendBulkEmail({
        candidateIds: selectedCandidates,
        subject: subject.trim(),
        body: message.trim(),
      });

      if (response.success) {
        const count = response.successCount || selectedCandidates.length;
        setSuccessMessage(
          isBulk
            ? `Bulk email sent successfully to ${count} candidate(s)!`
            : `Email sent successfully to ${count} candidate!`
        );
        setMessage('');
        setSubject('');
        setSelectedCandidates([]);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(response.error || 'Failed to send emails');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Failed to send email:', err);
      setError(handleAPIError(err));
      setTimeout(() => setError(''), 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Messaging Center
      </h2>
      <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Send direct messages or broadcast to multiple candidates
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Selection */}
        <div className={`lg:col-span-1 rounded-xl border shadow-sm p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Select Recipients ({selectedCandidates.length})
            </h3>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-2 pl-8 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-500'
                }`}
            />
            <HiMagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Candidate List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <InlineLoader message="Loading candidates..." darkMode={darkMode} />
            ) : error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <p className={`text-sm text-center py-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No candidates found
              </p>
            ) : (
              filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => toggleCandidate(candidate.id)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedCandidates.includes(candidate.id)
                      ? 'border-blue-500 bg-blue-50'
                      : darkMode
                        ? 'border-slate-600 hover:border-slate-500 bg-slate-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => { }}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {candidate.name}
                      </p>
                      <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {candidate.email}
                      </p>
                      {candidate.skills.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {candidate.skills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                              +{candidate.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Composer */}
        <div className={`lg:col-span-2 rounded-xl border shadow-sm p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {/* <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <HiChatBubbleLeftRight className="text-lg" />
              Direct Message
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'broadcast'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <HiSpeakerWave className="text-lg" />
              Broadcast
            </button>
          </div> */}

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Message Templates
            </label>
            {loadingTemplates ? (
              <InlineLoader message="Loading templates..." darkMode={darkMode} size="sm" />
            ) : messageTemplates.length === 0 ? (
              <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                No templates available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {messageTemplates.map((template) => {
                  // Map icon names to actual icon components
                  const IconComponent = template.iconName === 'HiEnvelope' ? HiEnvelope :
                                       template.iconName === 'HiBriefcase' ? HiBriefcase :
                                       template.iconName === 'HiPencilSquare' ? HiPencilSquare :
                                       template.iconName === 'HiHandThumbUp' ? HiHandThumbUp :
                                       template.iconName === 'HiSparkles' ? HiSparkles :
                                       HiEnvelope;
                  
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setSubject(template.subject);
                        setMessage(template.body);
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${darkMode
                          ? 'border-slate-600 hover:border-slate-500 bg-slate-700'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="text-3xl flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {template.name}
                          </h4>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {template.subject}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <HiCheckCircle className="text-lg" />
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <HiXCircle className="text-lg" />
                {error}
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800'
                }`}
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Message Body *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className={`w-full h-64 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-slate-300 text-slate-800'
                }`}
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {message.length} characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sending || selectedCandidates.length === 0 || !message.trim() || !subject.trim()}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                sending || selectedCandidates.length === 0 || !message.trim() || !subject.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : isBulk
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {sending ? (
                <div className="flex items-center justify-center gap-2">
                  <InlineLoader message="Sending..." darkMode={darkMode} size="sm" />
                </div>
              ) : selectedCandidates.length === 0 ? (
                'Select candidates to send'
              ) : isBulk ? (
                `Send Bulk Email to ${selectedCandidates.length} Candidates`
              ) : (
                `Send Email to ${selectedCandidates[0] ? candidates.find(c => c.id === selectedCandidates[0])?.name || '1 Candidate' : '1 Candidate'}`
              )}
            </button>
          </div>

          {isBulk && selectedCandidates.length > 0 && (
            <div className={`mt-3 p-3 rounded-lg border text-sm flex items-center gap-2 ${
              darkMode ? 'bg-purple-900/20 border-purple-800 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-800'
            }`}>
              <HiEnvelope className="w-4 h-4 flex-shrink-0" />
              Bulk mode: email will be personalized and sent to each of the {selectedCandidates.length} selected candidates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
