import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jdAPI, handleAPIError } from '../utils/api';
import { HiDocumentText, HiSparkles } from 'react-icons/hi2';

const JDMatcher = ({ darkMode }) => {
  const navigate = useNavigate();
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedJD, setOptimizedJD] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file (PDF, DOC, DOCX, or TXT)');
        return;
      }
      setJdFile(file);
      setError(null);
    }
  };

  const handleOptimize = async () => {
    if (!jdFile && !jdText) {
      setError('Please upload a JD file or paste the job description');
      return;
    }

    setOptimizing(true);
    setError(null);

    try {
      const optimizedResult = await jdAPI.optimize({
        message: jdText,
        file: jdFile,
      });
      
      setOptimizedJD(optimizedResult);
      alert('JD optimized successfully! You can now view matches in Uploaded JDs page.');
      
      // Reset form
      setJdFile(null);
      setJdText('');
    } catch (err) {
      console.error('Optimization failed:', err);
      setError(handleAPIError(err));
    } finally {
      setOptimizing(false);
    }
  };

  const handleReset = () => {
    setJdFile(null);
    setJdText('');
    setOptimizedJD(null);
    setError(null);
  };

  return (
    <div className={`p-4 sm:p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            JD Matcher
          </h2>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Upload job description to optimize and find matching candidates
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/uploaded-jds')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
              darkMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sm:inline">Uploaded JDs</span>
          </button>
          
          <button
            onClick={() => navigate('/jd-management')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
              darkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="sm:inline">JD Management</span>
          </button>
        </div>
      </div>

      {error && (
        <div className={`mb-4 sm:mb-6 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      <div className="max-w-4xl">
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg sm:rounded-xl border shadow-sm p-4 sm:p-6 mb-4 sm:mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Upload Job Description
          </h3>
          
          <div className="mb-4 sm:mb-6">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Upload JD File (PDF, DOC, DOCX, TXT)
            </label>
            <div className="flex items-center gap-4">
              <label className={`flex-1 border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors ${
                darkMode 
                  ? 'border-slate-600 hover:border-blue-500' 
                  : 'border-slate-300 hover:border-blue-500'
              }`}>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />
                <HiDocumentText className={`text-4xl sm:text-5xl mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {jdFile ? jdFile.name : 'Click to upload JD file'}
                </p>
              </label>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex-1 h-px ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>OR</span>
              <div className={`flex-1 h-px ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
            </div>
            
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Paste Job Description
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              className={`w-full h-48 sm:h-64 px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOptimize}
              disabled={optimizing || (!jdFile && !jdText)}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors cursor-pointer text-sm sm:text-base ${
                optimizing || (!jdFile && !jdText)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {optimizing ? 'Optimizing JD...' : 'Optimize & Save JD'}
            </button>
            
            {(jdFile || jdText || optimizedJD) && (
              <button
                onClick={handleReset}
                className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer text-sm sm:text-base ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {optimizedJD && (
          <div className={`${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6`}>
            <h4 className={`font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base ${darkMode ? 'text-green-400' : 'text-green-900'}`}>
              <HiSparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              JD Optimized Successfully!
            </h4>
            <p className={`text-xs sm:text-sm mb-4 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
              Your job description has been optimized and saved. You can now view matching candidates in the Uploaded JDs page.
            </p>
            <button
              onClick={() => navigate('/uploaded-jds')}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm"
            >
              View Uploaded JDs
            </button>
          </div>
        )}

        <div className={`${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border rounded-lg p-4 sm:p-6`}>
          <h4 className={`font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base ${darkMode ? 'text-purple-400' : 'text-purple-900'}`}>
            <HiSparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            AI-Powered JD Optimization
          </h4>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
            Our AI optimizes your job description for better candidate matching. After optimization, 
            visit the "Uploaded JDs" page to view all your JDs and see matching candidates for each one.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JDMatcher;
