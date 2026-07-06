import { useState, useRef, useEffect } from 'react';
import { HiCamera, HiCheckCircle, HiXMark, HiExclamationTriangle } from 'react-icons/hi2';

const ProfileImageCaptureModal = ({ isOpen, onCapture, candidateName }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); 
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Get available cameras on mount
  useEffect(() => {
    if (!isOpen) return;

    const getAvailableCameras = async () => {
      try {
        setLoading(true);
        setCameraError('');

        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        console.log('Available cameras:', videoDevices);
        
        if (videoDevices.length > 0) {
          if (isMobile) {
            // On mobile, use facingMode instead of deviceId for better compatibility
            setSelectedCamera('facingMode');
            setFacingMode('user'); // Start with front camera
          } else {
            // On desktop, use specific device
            const preferredCamera = videoDevices.find(cam => 
              cam.label.toLowerCase().includes('front') || 
              cam.label.toLowerCase().includes('user')
            ) || videoDevices[0];
            setSelectedCamera(preferredCamera.deviceId);
          }
        } else {
          setCameraError('No camera found on this device. Please check camera permissions.');
        }
      } catch (error) {
        console.error('Camera enumeration error:', error);
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera permission denied. Please allow camera access and refresh the page.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No camera found on this device.');
        } else {
          setCameraError('Unable to access cameras: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    getAvailableCameras();
  }, [isOpen, isMobile]);

  const startCamera = async (cameraOption = selectedCamera, facing = facingMode) => {
    try {
      setCameraError('');
      setLoading(true);
      
      // Stop previous stream if exists
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      let constraints;

      if (isMobile && cameraOption === 'facingMode') {
        // Mobile: Use facingMode for better compatibility
        constraints = {
          video: {
            facingMode: facing, // 'user' for front, 'environment' for back
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        };
      } else {
        // Desktop: Use specific deviceId
        constraints = {
          video: {
            deviceId: cameraOption ? { exact: cameraOption } : undefined,
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 }
          },
          audio: false
        };
      }

      console.log('Starting camera with constraints:', constraints);

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(console.error);
        };
      }
    } catch (error) {
      console.error('Camera start error:', error);
      let errorMessage = 'Failed to start camera: ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found or camera is being used by another app.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use or hardware error.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the requested settings.';
      } else {
        errorMessage += error.message;
      }
      
      setCameraError(errorMessage);
      setCameraActive(false);
    } finally {
      setLoading(false);
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
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.95);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      try {
        setLoading(true);
        // Convert base64 to blob
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        onCapture(file);
      } catch (error) {
        setCameraError('Failed to process image: ' + error.message);
        setLoading(false);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(selectedCamera, facingMode);
  };

  const switchCamera = () => {
    if (isMobile) {
      const newFacing = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacing);
      stopCamera();
      setTimeout(() => startCamera('facingMode', newFacing), 100);
    }
  };

  const handleCameraChange = async (deviceId) => {
    setSelectedCamera(deviceId);
    stopCamera();
    setTimeout(() => startCamera(deviceId), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <HiCamera className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Capture Profile Photo</h2>
              <p className="text-sm text-blue-100">Required before test starts</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <HiExclamationTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Profile photo is mandatory</p>
              <p>You must capture a clear photo of your face to proceed with the test. This helps verify your identity during the assessment.</p>
            </div>
          </div>

          {/* Camera Selection */}
          {isMobile ? (
            // Mobile: Show switch camera button
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">Camera View</label>
              <button
                onClick={switchCamera}
                disabled={loading || capturedImage !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                🔄 Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
              </button>
            </div>
          ) : (
            // Desktop: Show camera selection dropdown
            cameras.length > 1 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Camera</label>
                <div className="flex gap-2 flex-wrap">
                  {cameras.map((camera) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => handleCameraChange(camera.deviceId)}
                      disabled={loading || capturedImage !== null}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCamera === camera.deviceId
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {camera.label.includes('front') ? '📱 Front Camera' : camera.label.includes('back') ? '📷 Back Camera' : `📹 ${camera.label}`}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Error Message */}
          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <HiXMark className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Camera Error</p>
                <p>{cameraError}</p>
              </div>
            </div>
          )}

          {/* Camera View or Captured Image */}
          <div className="bg-slate-900 rounded-xl overflow-hidden relative aspect-video flex items-center justify-center">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                {!cameraActive && !capturedImage && (
                  <div className="text-center">
                    <HiCamera className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Camera not active</p>
                  </div>
                )}
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold">📸 Tips for a good photo:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Ensure your face is clearly visible and well-lit</li>
              <li>Position yourself at least 30cm away from the camera</li>
              <li>Look directly at the camera lens</li>
              <li>Avoid sunglasses and excessive shadows</li>
              <li>Neutral facial expression works best</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <>
                <button
                  onClick={() => startCamera(selectedCamera, facingMode)}
                  disabled={loading || cameraActive}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    cameraActive || loading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-600 text-white hover:bg-slate-700 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <HiCamera className="w-5 h-5" />
                      Start Camera
                    </>
                  )}
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={loading || !cameraActive}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    cameraActive && !loading
                      ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <HiCamera className="w-5 h-5" />
                  📸 Capture
                </button>
                <button
                  onClick={stopCamera}
                  disabled={loading || !cameraActive}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    cameraActive && !loading
                      ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Stop
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-semibold bg-slate-600 text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  🔄 Retake
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    loading
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5" />
                      ✅ Confirm & Continue
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Candidate Info */}
          <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
            Candidate: <span className="font-semibold text-slate-700">{candidateName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageCaptureModal;
