import { useState } from 'react';
import { candidatesAPI, handleAPIError } from '../utils/api';
import { HiDocumentText, HiCheckCircle, HiXCircle, HiLightBulb, HiPaperClip, HiChevronDown, HiPhoto, HiUser, HiUserPlus, HiXMark } from 'react-icons/hi2';

const SOURCE_OPTIONS = [
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'DIRECT_APPLY', label: 'Direct Apply' },
  { value: 'LINKEDIN_SOURCED', label: 'LinkedIn Sourced' },
  { value: 'JOB_PORTAL', label: 'Job Portal' },
  { value: 'CAMPUS_HIRE', label: 'Campus Hire' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'INTERNAL_TRANSFER', label: 'Internal Transfer' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', desc: 'Actively in a hiring pipeline' },
  { value: 'PASSIVE', label: 'Passive', desc: 'Not actively looking' },
];

const UploadResume = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Manual form state
  const [manualForm, setManualForm] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    // Educational Details  
    collegeName: '',
    degree: '',
    branch: '',
    yearOfPassing: '',
    // Metadata
    source: '',
    status: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const degrees = ['B.Tech', 'BCA', 'MCA', 'M.Tech', 'BSc CS', 'MSc CS', 'BE', 'Other'];
  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Other'];
  const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadResult({ success: false, message: 'File size exceeds 10MB limit.' });
      return;
    }
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'text/plain',
      'application/rtf'
    ];
    if (!allowed.includes(selectedFile.type)) {
      setUploadResult({ success: false, message: 'Invalid file type. Accepted: PDF, DOC, DOCX, JPG, PNG, GIF, BMP, WebP, TXT, RTF.' });
      return;
    }
    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleProfilePhotoChange = (e) => {
    const photo = e.target.files?.[0];
    if (!photo) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(photo.type)) {
      setUploadResult({ success: false, message: 'Profile photo must be JPG, PNG, or WebP.' });
      return;
    }
    if (photo.size > 5 * 1024 * 1024) {
      setUploadResult({ success: false, message: 'Profile photo must be under 5MB.' });
      return;
    }
    setProfilePhoto(photo);
    setProfilePhotoPreview(URL.createObjectURL(photo));
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({ success: false, message: 'Please select a file to upload.' });
      return;
    }
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (source) formData.append('source', source);
      if (status) formData.append('status', status);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);

      const result = await candidatesAPI.uploadResume(formData);

      setUploadResult({
        success: true,
        message: 'Resume uploaded and processed successfully!',
        candidate: {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          location: result.location,
        },
      });
      setFile(null);
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(i => { i.value = ''; });
    } catch (error) {
      setUploadResult({ success: false, message: handleAPIError(error) });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleManualFormChange = (e) => {
    const { name, value } = e.target;
    setManualForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateManualForm = () => {
    const newErrors = {};

    if (!manualForm.name.trim()) newErrors.name = 'Name is required';
    if (!manualForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!manualForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(manualForm.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateManualForm()) {
      return;
    }
    
    setUploading(true);
    setUploadResult(null);
    
    try {
      const result = await candidatesAPI.addCandidateManually(manualForm);
      
      setUploadResult({
        success: true,
        message: 'Candidate added successfully!',
        candidate: {
          id: result.id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          collegeName: result.collegeName,
        },
      });
      
      // Reset form
      setManualForm({
        name: '',
        email: '',
        phone: '',
        collegeName: '',
        degree: '',
        branch: '',
        yearOfPassing: '',
        source: '',
        status: ''
      });
      setFormErrors({});
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowManualForm(false);
      }, 2000);
      
    } catch (error) {
      setUploadResult({ success: false, message: handleAPIError(error) });
    } finally {
      setUploading(false);
    }
  };

  const selectClass = `w-full appearance-none px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer ${
    darkMode
      ? 'bg-slate-700 border-slate-600 text-white'
      : 'bg-white border-slate-300 text-slate-800'
  }`;

  return (
    <div className={`p-4 sm:p-8 min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Upload Resume
      </h2>
      <p className={`mb-4 text-sm sm:text-base ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        Upload candidate resumes to extract and analyze data using AI
      </p>

      {/* Add Candidate Manually Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowManualForm(true)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <HiUserPlus className="w-5 h-5" />
          Add Candidate Manually
        </button>
      </div>

      {/* Two-column layout: left = upload, right = metadata */}
      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">

        {/* LEFT — Upload Area */}
        <div className="flex-1 min-w-0">
          <div
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors ${
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
            <HiDocumentText className={`text-5xl sm:text-6xl mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-700'}`}>
              Drag and drop your resume here
            </h3>
            <p className={`mb-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>or</p>
            <label className="inline-block">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.txt,.rtf"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <span className={`px-6 py-3 rounded-lg cursor-pointer transition-colors inline-block text-sm font-medium ${
                uploading ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                Browse Files
              </span>
            </label>
            <p className={`text-xs mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Supported: PDF, DOC, DOCX, JPG, PNG, GIF, BMP, WebP, TXT, RTF (Max 10MB)
            </p>
          </div>

          {/* Selected File */}
          {file && (
            <div className={`mt-4 rounded-lg border p-4 sm:p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiPaperClip className="text-xl text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setUploadResult(null); }}
                  disabled={uploading}
                  className={`ml-3 text-lg cursor-pointer flex-shrink-0 ${uploading ? 'text-slate-400 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                >
                  ✕
                </button>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
                  uploading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Resume...
                  </div>
                ) : (
                  'Upload & Process Resume'
                )}
              </button>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mt-4 p-4 sm:p-6 rounded-lg border ${
              uploadResult.success
                ? darkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                : darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {uploadResult.success
                  ? <HiCheckCircle className="text-2xl flex-shrink-0 mt-0.5" />
                  : <HiXCircle className="text-2xl flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">{uploadResult.message}</p>
                  {uploadResult.success && uploadResult.candidate && (
                    <div className={`mt-3 p-3 rounded-lg text-sm space-y-1.5 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Extracted Info:</h4>
                      {[['ID', uploadResult.candidate.id], ['Name', uploadResult.candidate.name], ['Email', uploadResult.candidate.email], ['Phone', uploadResult.candidate.phone], ['Location', uploadResult.candidate.location]].map(([label, val]) =>
                        val ? (
                          <div key={label} className="flex gap-2">
                            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{label}:</span>
                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>{val}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className={`mt-6 rounded-lg p-4 sm:p-6 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h4 className={`font-semibold mb-2 flex items-center gap-2 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>
              <HiLightBulb className="w-4 h-4" />
              AI-Powered Resume Processing
            </h4>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-blue-800'}`}>
              Our AI automatically extracts candidate information including name, contact details,
              skills, experience, education, and more from the uploaded resume.
            </p>
          </div>
        </div>

        {/* RIGHT — Candidate Metadata */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div className={`rounded-xl border shadow-sm p-5 sm:p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-base font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Candidate Details
            </h3>
            <p className={`text-xs mb-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Optional metadata to tag this candidate
            </p>

            {/* Source Dropdown */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Candidate Source
              </label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select source...</option>
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <HiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              {source && (
                <p className={`mt-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Selected: {SOURCE_OPTIONS.find(o => o.value === source)?.label}
                </p>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Candidate Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select status...</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <HiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              {status && (
                <p className={`mt-1.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {STATUS_OPTIONS.find(o => o.value === status)?.desc}
                </p>
              )}
            </div>

            {/* Profile Photo Upload */}
            <div className="mb-5">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Profile Photo <span className={`text-xs font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar preview */}
                <div className={`w-16 h-16 rounded-full flex-shrink-0 overflow-hidden border-2 flex items-center justify-center ${
                  darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-100'
                }`}>
                  {profilePhotoPreview
                    ? <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <HiUser className={`w-8 h-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleProfilePhotoChange}
                      disabled={uploading}
                    />
                    <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-colors ${
                      darkMode
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <HiPhoto className="w-3.5 h-3.5" />
                      {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </span>
                  </label>
                  {profilePhoto ? (
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{profilePhoto.name}</p>
                      <button
                        onClick={() => { setProfilePhoto(null); setProfilePhotoPreview(null); }}
                        className="text-red-400 hover:text-red-600 text-xs cursor-pointer flex-shrink-0"
                      >✕</button>
                    </div>
                  ) : (
                    <p className={`mt-1.5 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>JPG, PNG, WebP · max 5MB</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary of selected values */}
            {(source || status) && (
              <div className={`rounded-lg p-3 text-xs space-y-1.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                <p className={`font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tagged as:</p>
                {source && (
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      {SOURCE_OPTIONS.find(o => o.value === source)?.label}
                    </span>
                  </div>
                )}
                {status && (
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${
                      status === 'ACTIVE'
                        ? darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                        : darkMode ? 'bg-yellow-900/40 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {STATUS_OPTIONS.find(o => o.value === status)?.label}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Candidate Entry Modal */}
      {showManualForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
            }`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Add Candidate Manually
              </h3>
              <button
                onClick={() => setShowManualForm(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleManualSubmit} className="p-6">
              
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <HiUser className="w-5 h-5 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name (Required) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        name="name"
                        value={manualForm.name}
                        onChange={handleManualFormChange}
                        required
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name 
                            ? 'border-red-500' 
                            : darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                        }`}
                      />
                    </div>
                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Email (Required) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="email"
                        name="email"
                        value={manualForm.email}
                        onChange={handleManualFormChange}
                        required
                        placeholder="john.doe@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.email 
                            ? 'border-red-500' 
                            : darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                        }`}
                      />
                    </div>
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Phone (Required) */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <HiPhoto className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="tel"
                        name="phone"
                        value={manualForm.phone}
                        onChange={handleManualFormChange}
                        required
                        placeholder="9876543210"
                        maxLength="10"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.phone 
                            ? 'border-red-500' 
                            : darkMode
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                        }`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Educational Information Section */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <HiLightBulb className="w-5 h-5 text-blue-600" />
                  Educational Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* College Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      College/University Name
                    </label>
                    <input
                      type="text"
                      name="collegeName"
                      value={manualForm.collegeName}
                      onChange={handleManualFormChange}
                      placeholder="ABC University"
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  {/* Degree */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Degree
                    </label>
                    <select
                      name="degree"
                      value={manualForm.degree}
                      onChange={handleManualFormChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="">Select Degree</option>
                      {degrees.map(deg => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Branch/Specialization
                    </label>
                    <select
                      name="branch"
                      value={manualForm.branch}
                      onChange={handleManualFormChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="">Select Branch</option>
                      {branches.map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year of Passing */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Year of Passing
                    </label>
                    <select
                      name="yearOfPassing"
                      value={manualForm.yearOfPassing}
                      onChange={handleManualFormChange}
                      className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="">Select Year</option>
                      {years.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Source & Status */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <HiDocumentText className="w-5 h-5 text-blue-600" />
                  Candidate Classification
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Source
                    </label>
                    <div className="relative">
                      <select
                        name="source"
                        value={manualForm.source}
                        onChange={handleManualFormChange}
                        className={`w-full appearance-none px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="">Select source...</option>
                        {SOURCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <HiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Status
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={manualForm.status}
                        onChange={handleManualFormChange}
                        className={`w-full appearance-none px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="">Select status...</option>
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <HiChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Result in Modal */}
              {uploadResult && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  uploadResult.success
                    ? darkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                    : darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {uploadResult.success
                      ? <HiCheckCircle className="text-xl flex-shrink-0 mt-0.5" />
                      : <HiXCircle className="text-xl flex-shrink-0 mt-0.5" />
                    }
                    <p className="text-sm font-medium">{uploadResult.message}</p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <p className={`text-xs flex-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  disabled={uploading}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    uploading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : darkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    uploading
                      ? 'bg-blue-400 text-blue-100 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Add Candidate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
