import { useState, useEffect } from 'react';
import { jdAPI, handleAPIError } from '../utils/api';

const JDManagement = ({ darkMode }) => {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedJD, setSelectedJD] = useState(null);
  const [newJD, setNewJD] = useState({ message: '', file: null });
  const [editContent, setEditContent] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchJDs();
  }, []);

  const fetchJDs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jdAPI.getAll();
      setJds(data);
    } catch (err) {
      console.error('Failed to fetch JDs:', err);
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newJD.message && !newJD.file) {
      alert('Please provide JD text or upload a file');
      return;
    }

    try {
      setProcessing(true);
      const result = await jdAPI.optimize({
        message: newJD.message,
        file: newJD.file,
      });
      
      setJds([result, ...jds]);
      setShowCreateModal(false);
      setNewJD({ message: '', file: null });
      alert('JD created and optimized successfully!');
    } catch (err) {
      console.error('Failed to create JD:', err);
      alert(handleAPIError(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    try {
      setProcessing(true);
      await jdAPI.update(selectedJD.id, editContent);
      
      setJds(jds.map(jd => 
        jd.id === selectedJD.id 
          ? { ...jd, optimizedJd: editContent } 
          : jd
      ));
      
      setShowEditModal(false);
      setSelectedJD(null);
      setEditContent('');
      alert('JD updated successfully!');
    } catch (err) {
      console.error('Failed to update JD:', err);
      alert(handleAPIError(err));
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this JD?')) {
      return;
    }

    try {
      await jdAPI.delete(id);
      setJds(jds.filter(jd => jd.id !== id));
      alert('JD deleted successfully!');
    } catch (err) {
      console.error('Failed to delete JD:', err);
      alert(handleAPIError(err));
    }
  };

  const openViewModal = (jd) => {
    setSelectedJD(jd);
    setShowViewModal(true);
  };

  const openEditModal = (jd) => {
    setSelectedJD(jd);
    setEditContent(jd.optimizedJd || jd.originalContent || '');
    setShowEditModal(true);
  };

  const filteredJDs = jds.filter(jd => {
    const searchLower = searchTerm.toLowerCase();
    return (
      jd.originalContent?.toLowerCase().includes(searchLower) ||
      jd.optimizedJd?.toLowerCase().includes(searchLower) ||
      jd.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Loading JDs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Job Descriptions
          </h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage and optimize your job descriptions ({jds.length} total)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create New JD
        </button>
      </div>

      {error && (
        <div className={`mb-6 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <p className={darkMode ? 'text-red-400' : 'text-red-700'}>{error}</p>
        </div>
      )}

      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm mb-6`}>
        <div className="p-6">
          <input
            type="text"
            placeholder="Search JDs by content or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
            }`}
          />
        </div>
      </div>

      {filteredJDs.length === 0 ? (
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-12 text-center`}>
          <div className="text-6xl mb-4">📄</div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {searchTerm ? 'No JDs Found' : 'No Job Descriptions Yet'}
          </h3>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first JD to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJDs.map((jd) => (
            <div
              key={jd.id}
              className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      JD #{jd.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      jd.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {jd.status}
                    </span>
                  </div>
                  
                  <div className={`mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <p className="line-clamp-2">
                      {jd.optimizedJd || jd.originalContent || 'No content available'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                      Created: {new Date(jd.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openViewModal(jd)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-slate-700 text-white hover:bg-slate-600' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(jd)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(jd.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Create New Job Description
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Upload JD File (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setNewJD({ ...newJD, file: e.target.files[0] })}
                  className={`w-full px-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white' 
                      : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex-1 h-px ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>OR</span>
                <div className={`flex-1 h-px ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Paste Job Description
                </label>
                <textarea
                  value={newJD.message}
                  onChange={(e) => setNewJD({ ...newJD, message: e.target.value })}
                  placeholder="Paste the job description here..."
                  rows="12"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                      : 'border-slate-300 text-slate-900 placeholder-slate-500'
                  }`}
                />
              </div>
            </div>

            <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewJD({ message: '', file: null });
                }}
                disabled={processing}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={processing || (!newJD.message && !newJD.file)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  processing || (!newJD.message && !newJD.file)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {processing ? 'Processing...' : 'Create & Optimize'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedJD && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Job Description #{selectedJD.id}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedJD.status === 'SUCCESS' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedJD.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedJD.originalContent && (
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Original Content:
                  </h4>
                  <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                    darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {selectedJD.originalContent}
                  </div>
                </div>
              )}

              {selectedJD.optimizedJd && (
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Optimized Content:
                  </h4>
                  <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                    darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-700'
                  }`}>
                    {selectedJD.optimizedJd}
                  </div>
                </div>
              )}
            </div>

            <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedJD(null);
                }}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedJD);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedJD && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Edit Job Description #{selectedJD.id}
              </h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows="20"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'} flex justify-end gap-3`}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedJD(null);
                  setEditContent('');
                }}
                disabled={processing}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={processing}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  processing
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JDManagement;
