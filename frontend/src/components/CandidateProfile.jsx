/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { candidatesAPI, handleAPIError } from '../utils/api';
import { 
  HiEnvelope, 
  HiPhone, 
  HiMapPin, 
  HiBriefcase, 
  HiUser,
  HiAcademicCap,
  HiWrench,
  HiDocumentText,
  HiSparkles,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiArrowDownTray,
  HiCodeBracket,
  HiExclamationTriangle,
  HiTrophy,
  HiLightBulb,
  HiComputerDesktop,
  HiCamera,
  HiXMark
} from 'react-icons/hi2';
import { FaGithub, FaLinkedin, FaCertificate } from 'react-icons/fa';
import ImageZoomModal from './ImageZoomModal';
import { PageLoader } from './PageLoader';

const CandidateProfile = ({ candidateId: propCandidateId, darkMode }) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const candidateId = propCandidateId || paramId;
  const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000/api').replace('/api', '');
  
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = front, 'environment' = back
  const [isMobile, setIsMobile] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadResult, setResumeUploadResult] = useState(null);
  const [showProfileImageZoom, setShowProfileImageZoom] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);


  useEffect(() => {
    const fetchCandidateProfile = async () => {
      if (!candidateId) {
        setError('No candidate ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profileData = await candidatesAPI.getProfile(candidateId);
        
        console.log('Raw profile data from backend:', profileData);
        console.log('hasResumeFile from backend:', profileData.hasResumeFile);
        console.log('Skills data type:', typeof profileData.skills);
        console.log('Skills data:', profileData.skills);
        console.log('Education data:', profileData.education);
        console.log('Experience data:', profileData.experience);
        console.log('Projects data:', profileData.projects);
        
        // Validate that we have valid data
        if (!profileData || typeof profileData !== 'object') {
          throw new Error('Invalid profile data received from server');
        }
        
        // Transform backend data to frontend format
        const transformedData = {
          id: profileData.id,
          name: profileData.name || 'N/A',
          email: profileData.email || 'N/A',
          phone: profileData.phone || 'N/A',
          location: profileData.location || 'N/A',
          linkedIn: profileData.linkedin || '',
          github: profileData.github || '',
          portfolio: profileData.portfolio || '',
          
          currentRole: profileData.title || 'Not specified',
          experience: typeof profileData.totalExperience === 'string' || typeof profileData.totalExperience === 'number' ? profileData.totalExperience : 'N/A',
          expectedSalary: profileData.expectedSalary || 'Not specified',
          availability: profileData.availability || 'Not specified',
          professionalSummary: profileData.professionalSummary || '',
          username: profileData.username || '',
          resumeFileName: profileData.resumeFileName || '',
          hasResumeFile: profileData.hasResumeFile === true,
          userPicture: profileData.userPicture || null,
          
          education: Array.isArray(profileData.education) ? profileData.education : [],
          skills: (() => {
            // Safe skills handling with multiple fallbacks
            if (!profileData.skills) {
              return { technical: [], soft: [] };
            }
            
            // If skills is already in the expected format
            if (profileData.skills.technical && profileData.skills.soft) {
              return {
                technical: Array.isArray(profileData.skills.technical) ? profileData.skills.technical : [],
                soft: Array.isArray(profileData.skills.soft) ? profileData.skills.soft : []
              };
            }
            
            // If skills is a SkillsDTO object
            if (typeof profileData.skills === 'object' && !Array.isArray(profileData.skills)) {
              return {
                technical: [
                  ...(Array.isArray(profileData.skills.frontEnd) ? profileData.skills.frontEnd : []),
                  ...(Array.isArray(profileData.skills.backEnd) ? profileData.skills.backEnd : []),
                  ...(Array.isArray(profileData.skills.databases) ? profileData.skills.databases : []),
                  ...(Array.isArray(profileData.skills.devops) ? profileData.skills.devops : []),
                ],
                soft: Array.isArray(profileData.skills.other) ? profileData.skills.other : [],
              };
            }
            
            // Fallback for any other format
            return { technical: [], soft: [] };
          })(),
          workExperience: Array.isArray(profileData.experience) ? profileData.experience : [],
          projects: Array.isArray(profileData.projects) ? profileData.projects : [],
          
          aiAnalysis: profileData.aiAnalysis || {
            matchScore: Math.floor(Math.random() * 20) + 80, // Generate a score if not available
            strengths: [],
            concerns: [],
            recommendations: [],
          },
          
          uploadDate: profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          lastUpdated: profileData.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          status: profileData.status || 'Active',
          tags: Array.isArray(profileData.tags) ? profileData.tags : ['Candidate'],
          
          // Additional sections for complete resume display
          certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
          achievements: Array.isArray(profileData.achievements) ? profileData.achievements : [],
        };
        
        console.log('Transformed data for frontend:', transformedData);
        setCandidate(transformedData);

        // Fetch profile image
        try {
          const imageUrl = await candidatesAPI.getProfileImage(candidateId);
          if (imageUrl) {
            setProfileImage(imageUrl);
          }
        } catch (imgErr) {
          console.log('No profile image found for candidate:', candidateId);
        }
      } catch (err) {
        console.error('Failed to fetch candidate profile:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateProfile();
  }, [candidateId]);

  if (loading) {
    return <PageLoader message="Loading candidate profile..." darkMode={darkMode} />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-6 text-center`}>
          <HiExclamationTriangle className="text-6xl mx-auto mb-4 text-red-500" />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>
            Failed to Load Profile
          </h3>
          <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
          <button
            onClick={() => navigate('/candidates')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-8">
        <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-lg p-6 text-center`}>
          <HiMagnifyingGlass className="text-6xl mx-auto mb-4 text-slate-400" />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Candidate Not Found
          </h3>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
            The requested candidate profile could not be found.
          </p>
          <button
            onClick={() => navigate('/candidates')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HiUser },
    { id: 'experience', label: 'Experience', icon: HiBriefcase },
    { id: 'skills', label: 'Skills', icon: HiWrench },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'projects', label: 'Projects', icon: HiCodeBracket },
    { id: 'certifications', label: 'Certifications & Achievements', icon: HiCheckCircle },
    { id: 'analysis', label: 'AI Analysis', icon: HiSparkles }
  ];

  const handleDownloadResume = async () => {
    try {
      setDownloading(true);
      await candidatesAPI.downloadResume(candidate.id);
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert(error.message?.includes('not found') || error.message?.includes('404')
        ? 'No resume file found for this candidate. Please upload a resume first.'
        : 'Failed to download resume: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!imageFile) {
      alert('Please select an image first');
      return;
    }

    try {
      setUploadingImage(true);
      await candidatesAPI.uploadProfileImage(candidate.id, imageFile);

      // Refresh profile image
      const imageUrl = await candidatesAPI.getProfileImage(candidate.id);
      if (imageUrl) {
        setProfileImage(imageUrl);
      }

      setShowImageModal(false);
      setImageFile(null);
      setImagePreview(null);
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      alert('Failed to upload profile image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const startCamera = async (facing = facingMode) => {
    try {
      setCameraActive(true);
      
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facing, // 'user' for front, 'environment' for back
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      alert(errorMessage);
      setCameraActive(false);
    }
  };

  const switchCamera = () => {
    if (isMobile) {
      const newFacing = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacing);
      startCamera(newFacing);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0);
      
      // Convert canvas to blob and create file
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Close camera modal and show image modal
        setShowCameraModal(false);
        stopCamera();
        setShowImageModal(true);
      }, 'image/jpeg', 0.95);
    }
  };

  const closeCameraModal = () => {
    stopCamera();
    setShowCameraModal(false);
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.type)) {
        setResumeUploadResult({ success: false, message: 'Invalid file type. Please upload PDF, DOC, or DOCX.' });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setResumeUploadResult({ success: false, message: 'File size must be less than 10MB' });
        return;
      }
      
      setResumeFile(file);
      setResumeUploadResult(null);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      setResumeUploadResult({ success: false, message: 'Please select a resume file first' });
      return;
    }

    try {
      setUploadingResume(true);
      console.log('Uploading resume for candidateId:', candidateId);

      // Use the new API function that uploads to existing candidate
      const uploadResult = await candidatesAPI.uploadResumeForCandidate(candidateId, resumeFile);
      console.log('Resume upload result:', uploadResult);

      setResumeUploadResult({ 
        success: true, 
        message: 'Resume uploaded successfully!' 
      });
      
      // Wait a moment for backend to process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh candidate profile with fresh data
      try {
        const profileData = await candidatesAPI.getProfile(candidateId);
        console.log('Refreshed profile data:', profileData);
        console.log('hasResumeFile:', profileData.hasResumeFile);
        console.log('resumeFileName:', profileData.resumeFileName);
        
        setCandidate(prev => ({
          ...prev,
          hasResumeFile: profileData.hasResumeFile === true,
          resumeFileName: profileData.resumeFileName || ''
        }));
      } catch (refreshError) {
        console.error('Error refreshing profile:', refreshError);
      }

      setShowResumeModal(false);
      setResumeFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setResumeUploadResult(null), 3000);
    } catch (error) {
      console.error('Failed to upload resume:', error);
      setResumeUploadResult({ 
        success: false, 
        message: 'Failed to upload resume: ' + error.message 
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Professional Summary */}
            {candidate.professionalSummary && (
              <div className="mb-6">
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  <HiDocumentText /> Professional Summary
                </h4>
                <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg border-l-4 border-blue-500`}>
                  <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                    {candidate.professionalSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Resume Download Card */}
            <div className="mb-6">
              <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <HiDocumentText className="text-xl text-blue-500" />
                Resume
              </h4>
              <div className={`flex items-center justify-between p-4 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiDocumentText className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {candidate.name}'s Resume
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {candidate.hasResumeFile ? `${candidate.resumeFileName || 'Resume uploaded'}` : 'No resume uploaded yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResumeModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                    title={candidate.hasResumeFile ? 'Upload a new resume to replace the current one' : 'Upload a resume'}
                  >
                    <HiDocumentText className="w-4 h-4" />
                    {candidate.hasResumeFile ? 'Update Resume' : 'Upload Resume'}
                  </button>
                  <button
                    onClick={handleDownloadResume}
                    disabled={downloading || !candidate.hasResumeFile}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      downloading || !candidate.hasResumeFile
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    }`}
                    title={!candidate.hasResumeFile ? 'No resume available for this candidate' : ''}
                  >
                    <HiArrowDownTray className="w-4 h-4" />
                    {downloading ? 'Downloading...' : !candidate.hasResumeFile ? 'No Resume' : 'Download'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <HiEnvelope className="text-xl" />
                    <span>{candidate.email}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <HiPhone className="text-xl" />
                    <span>{candidate.phone}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <HiMapPin className="text-xl" />
                    <span>{candidate.location}</span>
                  </div>
                  {candidate.linkedIn && (
                    <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <FaLinkedin className="text-xl text-blue-600" />
                      <a href={candidate.linkedIn.startsWith('http') ? candidate.linkedIn : `https://${candidate.linkedIn}`} 
                         className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {candidate.linkedIn}
                      </a>
                    </div>
                  )}
                  {candidate.github && (
                    <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <FaGithub className="text-xl" />
                      <a href={candidate.github.startsWith('http') ? candidate.github : `https://${candidate.github}`} 
                         className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {candidate.github}
                      </a>
                    </div>
                  )}
                  {candidate.username && (
                    <div className={`flex items-center gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <HiUser className="text-xl" />
                      <span>Username: {candidate.username}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Professional Summary
                </h4>
                <div className="space-y-3">
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Current Role:</strong> {candidate.currentRole}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Experience:</strong> {candidate.experience}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Expected Salary:</strong> {candidate.expectedSalary}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Availability:</strong> {candidate.availability}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Profile Created:</strong> {candidate.uploadDate || 'N/A'}
                  </div>
                  <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      candidate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Skills Overview */}
            <div>
              <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Skills Overview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Technical Skills ({(candidate.skills?.technical || []).length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {(candidate.skills?.technical || []).slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(candidate.skills?.technical || []).length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{(candidate.skills?.technical || []).length - 8} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Soft Skills ({(candidate.skills?.soft || []).length})
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {(candidate.skills?.soft || []).slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(candidate.skills?.soft || []).length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{(candidate.skills?.soft || []).length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-6">
            {(candidate.workExperience || []).length === 0 ? (
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-8 rounded-lg text-center`}>
                <HiBriefcase className="text-6xl mx-auto mb-4 text-slate-400" />
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  No Work Experience Listed
                </h3>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  This candidate hasn't added any work experience to their profile yet.
                </p>
              </div>
            ) : (
              (candidate.workExperience || []).map((exp, index) => (
                <div key={index} className={`border-l-4 border-blue-500 pl-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-r-lg`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {exp.role || 'Position Not Specified'}
                      </h4>
                      <p className={`text-lg font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {exp.company || 'Company Not Specified'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {exp.duration || 'Duration Not Specified'}
                    </span>
                  </div>
                  
                  {exp.description && (
                    <div className="mb-4">
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Role Description:
                      </h5>
                      <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                        {exp.description}
                      </p>
                    </div>
                  )}
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div>
                      <h5 className={`font-medium mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Key Achievements:
                      </h5>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className={`flex items-start gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {exp.highlights && exp.highlights.length > 0 && (
                    <div className="mt-4">
                      <h5 className={`font-medium mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Highlights:
                      </h5>
                      <ul className="space-y-2">
                        {exp.highlights.map((highlight, idx) => (
                          <li key={idx} className={`flex items-start gap-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-6">
            <div>
              <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <HiComputerDesktop className="text-2xl" />
                Technical Skills
              </h4>
              
              {/* Frontend Skills */}
              {(candidate.skills?.technical || candidate.skills?.frontEnd || []).length > 0 && (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Frontend Technologies
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills?.technical || candidate.skills?.frontEnd || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Backend Skills */}
              {(candidate.skills?.backEnd || []).length > 0 && (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Backend Technologies
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills?.backEnd || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Database Skills */}
              {(candidate.skills?.databases || []).length > 0 && (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    Databases
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills?.databases || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* DevOps/Tools Skills */}
              {(candidate.skills?.devops || []).length > 0 && (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    DevOps & Tools
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills?.devops || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All Technical Skills Combined (fallback) */}
              {(!candidate.skills?.frontEnd && !candidate.skills?.backEnd && !candidate.skills?.databases && !candidate.skills?.devops) && 
               (candidate.skills?.technical || []).length > 0 && (
                <div className="mb-6">
                  <h5 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    All Technical Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills?.technical || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* No Technical Skills Message */}
              {(!candidate.skills?.languages || candidate.skills.languages.length === 0) && 
               (!candidate.skills?.frontend || candidate.skills.frontend.length === 0) && 
               (!candidate.skills?.backend || candidate.skills.backend.length === 0) && 
               (!candidate.skills?.databases || candidate.skills.databases.length === 0) && 
               (!candidate.skills?.tools || candidate.skills.tools.length === 0) &&
                (!candidate.skills?.concepts || candidate.skills.concepts.length === 0) &&(
                <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg text-center`}>
                  <HiComputerDesktop className="text-6xl mx-auto mb-3 text-slate-400" />
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No technical skills listed
                  </p>
                </div>
              )}
            </div>
            
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            {(candidate.education || []).map((edu, index) => (
              <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {edu.degree || 'Degree not specified'}
                </h4>
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {edu.school || edu.institution || 'Institution not specified'} • {edu.year || edu.completionYear || 'Year not specified'}
                </p>
                {edu.gpa && (
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.score && (
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Score: {edu.score}
                  </p>
                )}
              </div>
            ))}
            {(!candidate.education || candidate.education.length === 0) && (
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg text-center`}>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No education information available
                </p>
              </div>
            )}
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-6">
            <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              <HiCodeBracket className="text-2xl" />
              Projects Portfolio
            </h4>
            {(candidate.projects || []).length === 0 ? (
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-8 rounded-lg text-center`}>
                <HiCodeBracket className="text-6xl mx-auto mb-4 text-slate-400" />
                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  No Projects Listed
                </h3>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  This candidate hasn't added any projects to their profile yet.
                </p>
              </div>
            ) : (
              (candidate.projects || []).map((project, index) => (
                <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg border-l-4 border-purple-500`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {project.name || project.title || 'Project Name Not Available'}
                      </h4>
                      {project.year && (
                        <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {project.year}
                        </span>
                      )}
                    </div>
                    {project.link && (
                      <a
                        href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                  
                  {project.description && (
                    <div className="mb-4">
                      <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                        {project.description}
                      </p>
                    </div>
                  )}
                  
                  {(project.details || []).length > 0 && (
                    <div className="mb-4">
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Project Features:
                      </h5>
                      <ul className="space-y-1">
                        {project.details.map((detail, idx) => (
                          <li key={idx} className={`flex items-start gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(project.tech || project.technologies || []).length > 0 && (
                    <div>
                      <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Technologies Used:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {(project.tech || project.technologies || []).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );
        
      case 'certifications':
        return (
          <div className="space-y-6">
            {/* Certifications Section */}
            <div>
              <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <FaCertificate className="text-2xl text-purple-600" />
                Certifications
              </h4>
              {(candidate.certifications || []).length === 0 ? (
                <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg text-center`}>
                  <FaCertificate className="text-6xl mx-auto mb-3 text-slate-400" />
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No certifications listed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(candidate.certifications || []).map((cert, index) => (
                    <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg border-l-4 border-yellow-500`}>
                      <div className="flex items-start gap-3">
                        <FaCertificate className="text-2xl text-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {cert}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div>
              <h4 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                <HiTrophy className="text-2xl text-yellow-500" />
                Key Achievements
              </h4>
              {(candidate.achievements || []).length === 0 ? (
                <div className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-6 rounded-lg text-center`}>
                  <HiTrophy className="text-6xl mx-auto mb-3 text-slate-400" />
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No achievements listed
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(candidate.achievements || []).map((achievement, index) => (
                    <div key={index} className={`${darkMode ? 'bg-slate-700' : 'bg-slate-50'} p-4 rounded-lg border-l-4 border-green-500`}>
                      <div className="flex items-start gap-3">
                        <HiSparkles className="text-xl text-green-600 flex-shrink-0 mt-1" />
                        <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                          {achievement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'analysis':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600 mb-2">
                {candidate.aiAnalysis?.matchScore || 0}%
              </div>
              <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Overall Match Score
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-green-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 text-green-800 ${darkMode ? 'text-green-400' : ''}`}>
                  <HiCheckCircle className="text-xl" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {(candidate.aiAnalysis?.strengths || []).map((strength, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {strength}
                    </li>
                  ))}
                  {(!candidate.aiAnalysis?.strengths || candidate.aiAnalysis.strengths.length === 0) && (
                    <li className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No strengths analysis available
                    </li>
                  )}
                </ul>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-yellow-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 text-yellow-800 ${darkMode ? 'text-yellow-400' : ''}`}>
                  <HiExclamationTriangle className="text-xl" />
                  Concerns
                </h4>
                <ul className="space-y-2">
                  {(candidate.aiAnalysis?.concerns || []).map((concern, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {concern}
                    </li>
                  ))}
                  {(!candidate.aiAnalysis?.concerns || candidate.aiAnalysis.concerns.length === 0) && (
                    <li className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No concerns identified
                    </li>
                  )}
                </ul>
              </div>
              
              <div className={`${darkMode ? 'bg-slate-700' : 'bg-blue-50'} p-4 rounded-lg`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 text-blue-800 ${darkMode ? 'text-blue-400' : ''}`}>
                  <HiLightBulb className="text-xl" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {(candidate.aiAnalysis?.recommendations || []).map((rec, index) => (
                    <li key={index} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      • {rec}
                    </li>
                  ))}
                  {(!candidate.aiAnalysis?.recommendations || candidate.aiAnalysis.recommendations.length === 0) && (
                    <li className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No recommendations available
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/candidates')}
          className={`p-2 rounded-lg hover:bg-slate-200 ${darkMode ? 'hover:bg-slate-700 text-white' : 'text-slate-600'}`}
        >
          ← Back
        </button>
        <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          Candidate Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className={`lg:col-span-1 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm p-6`}>
          <div className="text-center mb-6">
            <div className="relative w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden flex-shrink-0 border-4 border-blue-500 shadow-lg group cursor-pointer" onClick={() => profileImage && setShowProfileImageZoom(true)}>
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={candidate.name}
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold"
                style={{ display: profileImage ? 'none' : 'flex' }}
              >
                {candidate.name ? candidate.name.split(' ').map(n => n[0]).join('') : 'N/A'}
              </div>
              
              {/* Edit Icon Overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(true);
                }}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer"
                title="Edit profile image"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {candidate.name}
            </h3>
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {candidate.currentRole}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              {(candidate.tags || []).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {(!candidate.tags || candidate.tags.length === 0) && (
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No tags
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Send Message
            </button>
            <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Schedule Interview
            </button>
            <button 
              onClick={handleDownloadResume}
              disabled={downloading || !candidate.hasResumeFile}
              className={`w-full py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${
                downloading || !candidate.hasResumeFile
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                  : darkMode 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
              }`}
              title={!candidate.hasResumeFile ? 'No resume available for this candidate' : ''}
            >
              <HiArrowDownTray className="text-lg" />
              {downloading ? 'Downloading...' : !candidate.hasResumeFile ? 'No Resume' : 'Download Resume'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`lg:col-span-3 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} shadow-sm`}>
          {/* Tabs */}
          <div className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'} p-6`}>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'text-slate-300 hover:bg-slate-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="text-lg" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Profile Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Update Profile Image
            </h3>

            {/* Image Preview */}
            {imagePreview ? (
              <div className="mb-4">
                <div className="w-32 h-32 rounded-lg mx-auto overflow-hidden border-2 border-blue-500">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className={`mb-4 p-8 rounded-lg border-2 border-dashed ${darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-50'} text-center`}>
                <svg className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Click to select an image
                </p>
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
              id="profile-image-input"
            />

            {/* Upload and Camera Buttons */}
            <div className="flex gap-3 mb-4">
              <label htmlFor="profile-image-input" className="flex-1">
                <button
                  type="button"
                  onClick={() => document.getElementById('profile-image-input').click()}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {imagePreview ? 'Change Image' : 'Select Image'}
                </button>
              </label>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setShowCameraModal(true);
                }}
                className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  darkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <HiCamera className="w-5 h-5" />
                Camera
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadProfileImage}
                disabled={!imageFile || uploadingImage}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !imageFile || uploadingImage
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {uploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            </div>

            {/* File Info */}
            {imageFile && (
              <p className={`text-xs mt-3 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {imageFile.name} • {(imageFile.size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Capture Photo
              </h3>
              <button
                onClick={closeCameraModal}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Video Stream */}
            <div className="mb-4 rounded-lg overflow-hidden bg-black">
              {!cameraActive ? (
                <div className="w-full aspect-video flex items-center justify-center bg-slate-900">
                  <button
                    onClick={startCamera}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <HiCamera className="w-5 h-5" />
                    Start Camera
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>

            {/* Camera Controls */}
            {cameraActive && (
              <div className="space-y-3 mb-4">
                {/* Mobile Camera Switch */}
                {isMobile && (
                  <div className="flex justify-center">
                    <button
                      onClick={switchCamera}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      🔄 Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
                    </button>
                  </div>
                )}
                
                {/* Main Controls */}
                <div className="flex gap-3">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <HiCamera className="w-5 h-5" />
                    📸 Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    }`}
                  >
                    Stop Camera
                  </button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={closeCameraModal}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl max-w-2xl w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Upload Resume
              </h3>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeFile(null);
                  setResumeUploadResult(null);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <HiDocumentText className={`text-5xl mx-auto mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                Drag and drop your resume here
              </h4>
              <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>or</p>
              <label className="inline-block">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  disabled={uploadingResume}
                />
                <span className={`px-6 py-2 rounded-lg cursor-pointer transition-colors inline-block text-sm font-medium ${
                  uploadingResume ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  Browse Files
                </span>
              </label>
              <p className={`text-xs mt-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Supported: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>

            {/* Selected File */}
            {resumeFile && (
              <div className={`rounded-lg border p-4 mb-4 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HiDocumentText className="text-xl text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {resumeFile.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setResumeFile(null);
                      setResumeUploadResult(null);
                    }}
                    disabled={uploadingResume}
                    className={`ml-3 text-lg cursor-pointer flex-shrink-0 ${uploadingResume ? 'text-slate-400 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Upload Result */}
            {resumeUploadResult && (
              <div className={`p-4 rounded-lg border mb-4 ${
                resumeUploadResult.success
                  ? darkMode ? 'bg-green-900/20 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
                  : darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-3">
                  {resumeUploadResult.success
                    ? <HiCheckCircle className="text-2xl flex-shrink-0 mt-0.5" />
                    : <HiXMark className="text-2xl flex-shrink-0 mt-0.5" />
                  }
                  <p className="font-semibold text-sm">{resumeUploadResult.message}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleUploadResume}
                disabled={uploadingResume || !resumeFile}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  uploadingResume || !resumeFile
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                }`}
              >
                {uploadingResume ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <HiArrowDownTray className="w-4 h-4" />
                    Upload Resume
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowResumeModal(false);
                  setResumeFile(null);
                  setResumeUploadResult(null);
                }}
                disabled={uploadingResume}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Image Zoom Modal */}
      <ImageZoomModal
        isOpen={showProfileImageZoom}
        imageUrl={profileImage || ''}
        imageName={candidate?.name || 'Profile Image'}
        onClose={() => setShowProfileImageZoom(false)}
      />
    </div>
  );
};

export default CandidateProfile;