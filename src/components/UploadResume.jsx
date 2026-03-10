import { useState } from 'react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    // TODO: Replace with your actual API endpoint
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      // const response = await fetch('YOUR_API_ENDPOINT/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Resume uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Resume</h2>
      <p className="text-slate-600 mb-8">Upload candidate resumes to extract and analyze data using AI</p>

      <div className="max-w-3xl">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-slate-300 bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            Drag and drop your resume here
          </h3>
          <p className="text-slate-500 mb-4">or</p>
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
          <p className="text-sm text-slate-400 mt-4">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
        </div>

        {file && (
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                  📎
                </div>
                <div>
                  <p className="font-medium text-slate-800">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
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

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 AI Processing</h4>
          <p className="text-blue-800 text-sm">
            Our AI will automatically extract candidate information including name, contact details, 
            skills, experience, education, and more from the uploaded resume.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
