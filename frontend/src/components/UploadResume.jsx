import { useState } from 'react';
import { candidatesAPI, handleAPIError } from '../utils/api';

const UploadResume = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      
      // File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setUploadResult({
          success: false,
          message: 'File size exceeds 10MB limit. Please choose a smaller file.',
        });
        return;
      }
      
      // File type validation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadResult({
          success: false,
          message: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.',
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null); // Clear any previous messages
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // File size validation (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        setUploadResult({
          success: false,
          message: 'File size exceeds 10MB limit. Please choose a smaller file.',
        });
        return;
      }
      
      // File type validation
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setUploadResult({
          success: false,
          message: 'Invalid file type. Please upload PDF, DOC, or DOCX files only.',
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null); // Clear any previous messages
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file); // Backend expects 'file' field name
      
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const result = await candidatesAPI.uploadResume(formData);
      
      console.log('Upload successful:', result);
      
      setUploadResult({
        success: true,
        message: result.message || 'Resume uploaded and processed successfully!',
        data: result,
      });
      
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadResult({
        success: false,
        message: handleAPIError(error),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Upload Resume
      </h2>
      <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Upload candidate resumes to extract and analyze data using AI
      </p>

      <div className="max-w-3xl">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : darkMode 
              ? 'border-slate-600 bg-slate-800' 
              : 'border-slate-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
            Drag and drop your resume here
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>or</p>
          <label className="inline-block">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <span className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
              Browse Files
            </span>
          </label>
          <p className={`text-sm mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {file && (
          <div className={`mt-6 rounded-lg border p-6 ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📎
                </div>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                    {file.name}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700 text-xl"
              >
                ✕
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                uploading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        )}

        {uploadResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            uploadResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {uploadResult.success ? '✅' : '❌'}
              </span>
              <p className="font-medium">{uploadResult.message}</p>
            </div>
            {uploadResult.success && uploadResult.data && (
              <div className="mt-3 text-sm space-y-1">
                {uploadResult.data.candidateId && (
                  <p><strong>Candidate ID:</strong> {uploadResult.data.candidateId}</p>
                )}
                {uploadResult.data.extractedData && (
                  <>
                    {uploadResult.data.extractedData.name && (
                      <p><strong>Name:</strong> {uploadResult.data.extractedData.name}</p>
                    )}
                    {uploadResult.data.extractedData.email && (
                      <p><strong>Email:</strong> {uploadResult.data.extractedData.email}</p>
                    )}
                    {uploadResult.data.extractedData.phone && (
                      <p><strong>Phone:</strong> {uploadResult.data.extractedData.phone}</p>
                    )}
                    {uploadResult.data.extractedData.skills && uploadResult.data.extractedData.skills.length > 0 && (
                      <p><strong>Skills:</strong> {uploadResult.data.extractedData.skills.join(', ')}</p>
                    )}
                  </>
                )}
                {uploadResult.data.skills && Array.isArray(uploadResult.data.skills) && (
                  <p><strong>Extracted Skills:</strong> {uploadResult.data.skills.join(', ')}</p>
                )}
                {uploadResult.data.processingTime && (
                  <p><strong>Processing Time:</strong> {uploadResult.data.processingTime}ms</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className={`mt-8 rounded-lg p-6 ${
          darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${
            darkMode ? 'text-blue-400' : 'text-blue-900'
          }`}>
            💡 AI Processing
          </h4>
          <p className={`text-sm ${
            darkMode ? 'text-slate-300' : 'text-blue-800'
          }`}>
            Our AI will automatically extract candidate information including name, contact details, 
            skills, experience, education, and more from the uploaded resume.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;