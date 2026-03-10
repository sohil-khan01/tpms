import { useState } from 'react';

const MessagingCenter = () => {
  const [activeTab, setActiveTab] = useState('direct');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const candidates = [
    { id: 1, name: 'John Doe', email: 'john.doe@email.com', skills: ['React', 'Node.js'], matchScore: 92 },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', skills: ['Java', 'Spring'], matchScore: 88 },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@email.com', skills: ['Angular', 'TypeScript'], matchScore: 85 },
  ];

  const messageTemplates = [
    {
      id: 1,
      name: 'Interview Invitation',
      subject: 'Interview Opportunity at [Company Name]',
      body: 'Dear [Candidate Name],\n\nWe are impressed with your profile and would like to invite you for an interview...',
    },
    {
      id: 2,
      name: 'Job Opening Alert',
      subject: 'New Job Opening - [Position]',
      body: 'Hi [Candidate Name],\n\nWe have an exciting opportunity that matches your skills...',
    },
    {
      id: 3,
      name: 'Profile Update Request',
      subject: 'Update Your Profile',
      body: 'Hello [Candidate Name],\n\nWe noticed your profile could use an update...',
    },
  ];

  const toggleCandidate = (id) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCandidates(candidates.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedCandidates([]);
  };

  const handleSend = async () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);

    // TODO: Replace with your actual API endpoint
    try {
      // const response = await fetch('YOUR_API_ENDPOINT/send-message', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     candidateIds: selectedCandidates,
      //     message: message,
      //     type: activeTab,
      //   }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Message sent to ${selectedCandidates.length} candidate(s)!`);
      setMessage('');
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Messaging Center</h2>
      <p className="text-slate-600 mb-8">Send direct messages or broadcast to multiple candidates</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Selection */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Select Recipients ({selectedCandidates.length})
            </h3>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => toggleCandidate(candidate.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCandidates.includes(candidate.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">{candidate.name}</p>
                    <p className="text-xs text-slate-600">{candidate.email}</p>
                    <div className="flex gap-1 mt-1">
                      {candidate.skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Composer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('direct')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📧 Direct Message
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'broadcast'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              📢 Broadcast
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message Templates
            </label>
            <select
              onChange={(e) => {
                const template = messageTemplates.find(t => t.id === parseInt(e.target.value));
                if (template) setMessage(template.body);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template...</option>
              {messageTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {message.length} characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={sending || selectedCandidates.length === 0 || !message.trim()}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                sending || selectedCandidates.length === 0 || !message.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : activeTab === 'broadcast'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {sending ? 'Sending...' : `Send to ${selectedCandidates.length} Candidate(s)`}
            </button>
          </div>

          {activeTab === 'broadcast' && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>📢 Broadcast Mode:</strong> This message will be sent to all selected candidates simultaneously.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
