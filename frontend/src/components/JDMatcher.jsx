import { useState } from 'react';

const JDMatcher = () => {
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [matching, setMatching] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleMatch = async () => {
    if (!jdFile && !jdText) {
      alert('Please upload a JD file or paste the job description');
      return;
    }

    setMatching(true);

    // TODO: Replace with your actual API endpoint
    const formData = new FormData();
    if (jdFile) formData.append('jd', jdFile);
    if (jdText) formData.append('jdText', jdText);

    try {
      // const response = await fetch('YOUR_API_ENDPOINT/match-jd', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // Mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMatchedCandidates([
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 234 567 8900',
          skills: ['React', 'Node.js', 'Python', 'AWS'],
          experience: '5 years',
          education: 'BS Computer Science',
          matchScore: 95,
          matchReasons: ['Strong React experience', 'AWS certified', 'Full-stack background'],
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1 234 567 8901',
          skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker'],
          experience: '7 years',
          education: 'MS Software Engineering',
          matchScore: 92,
          matchReasons: ['Senior level experience', 'Cloud expertise', 'Leadership skills'],
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.j@email.com',
          phone: '+1 234 567 8902',
          skills: ['Angular', 'TypeScript', 'MongoDB', 'Express'],
          experience: '4 years',
          education: 'BS Information Technology',
          matchScore: 88,
          matchReasons: ['Modern tech stack', 'Database expertise', 'Quick learner'],
        },
      ]);
      setShowResults(true);
    } catch (error) {
      console.error('Matching failed:', error);
      alert('Failed to match candidates. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const handleReset = () => {
    setJdFile(null);
    setJdText('');
    setMatchedCandidates([]);
    setShowResults(false);
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">JD Matcher</h2>
      <p className="text-slate-600 mb-8">Upload job description to find the best matching candidates</p>

      {!showResults ? (
        <div className="max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Job Description</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload JD File (PDF, DOC, DOCX)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-sm text-slate-600">
                    {jdFile ? jdFile.name : 'Click to upload JD file'}
                  </p>
                </label>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-slate-300"></div>
                <span className="text-sm text-slate-500">OR</span>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>
              
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paste Job Description
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleMatch}
              disabled={matching || (!jdFile && !jdText)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                matching || (!jdFile && !jdText)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {matching ? 'Analyzing & Matching...' : 'Find Matching Candidates'}
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-semibold text-purple-900 mb-2">🤖 AI-Powered Matching</h4>
            <p className="text-purple-800 text-sm">
              Our AI analyzes the job description and matches it against your talent pool based on 
              skills, experience, education, and other relevant factors to find the best candidates.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Top {matchedCandidates.length} Matching Candidates
              </h3>
              <p className="text-slate-600 text-sm">Ranked by AI match score</p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              New Search
            </button>
          </div>

          <div className="space-y-4">
            {matchedCandidates.map((candidate, index) => (
              <div key={candidate.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                      #{index + 1}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{candidate.matchScore}%</div>
                      <div className="text-xs text-slate-500">Match</div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">{candidate.name}</h4>
                        <p className="text-slate-600">{candidate.education}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Send Message
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          View Profile
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>📧</span>
                        <span className="truncate">{candidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>📞</span>
                        <span>{candidate.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>💼</span>
                        <span>{candidate.experience}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900 mb-2">✓ Why this candidate matches:</p>
                      <ul className="space-y-1">
                        {candidate.matchReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-green-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JDMatcher;
