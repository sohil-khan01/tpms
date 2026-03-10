import { useState } from 'react';

const ResumeCustomizer = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [customizing, setCustomizing] = useState(false);

  const candidates = [
    { id: 1, name: 'John Doe', email: 'john.doe@email.com' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike.j@email.com' },
  ];

  const templates = [
    {
      id: 'modern',
      name: 'Modern Professional',
      preview: '🎨',
      description: 'Clean and contemporary design',
      color: 'blue',
    },
    {
      id: 'corporate',
      name: 'Corporate Classic',
      preview: '💼',
      description: 'Traditional business format',
      color: 'slate',
    },
    {
      id: 'creative',
      name: 'Creative Bold',
      preview: '✨',
      description: 'Eye-catching and unique',
      color: 'purple',
    },
    {
      id: 'minimal',
      name: 'Minimal Elegant',
      preview: '📄',
      description: 'Simple and sophisticated',
      color: 'green',
    },
  ];

  const handleCustomize = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate');
      return;
    }

    setCustomizing(true);

    // TODO: Replace with your actual API endpoint
    try {
      // const response = await fetch('YOUR_API_ENDPOINT/customize-resume', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     candidateId: selectedCandidate,
      //     template: selectedTemplate,
      //   }),
      // });
      // const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Resume customized successfully! Download link sent to your email.');
    } catch (error) {
      console.error('Customization failed:', error);
      alert('Failed to customize resume. Please try again.');
    } finally {
      setCustomizing(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Resume Customizer</h2>
          <p className="text-slate-600">Customize candidate resumes with your company templates</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium">
          ⭐ Premium Feature
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Selection */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Candidate</h3>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCandidate === candidate.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{candidate.name}</p>
                    <p className="text-sm text-slate-600">{candidate.email}</p>
                  </div>
                  {selectedCandidate === candidate.id && (
                    <div className="ml-auto text-blue-600 text-xl">✓</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Choose Template</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-4xl mb-2 text-center">{template.preview}</div>
                <h4 className="font-semibold text-slate-800 text-center mb-1">
                  {template.name}
                </h4>
                <p className="text-xs text-slate-600 text-center">{template.description}</p>
                {selectedTemplate === template.id && (
                  <div className="mt-2 text-center text-blue-600 text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-slate-800 mb-2">Customization Options</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm text-slate-700">Include company logo</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm text-slate-700">Apply brand colors</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-slate-700">Add cover letter</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-slate-700">Include references</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleCustomize}
            disabled={customizing || !selectedCandidate}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              customizing || !selectedCandidate
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {customizing ? 'Customizing Resume...' : 'Generate Custom Resume'}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Preview</h3>
        <div className="bg-slate-100 rounded-lg p-8 min-h-96 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="text-6xl mb-4">📄</div>
            <p>Select a candidate and template to see preview</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCustomizer;
