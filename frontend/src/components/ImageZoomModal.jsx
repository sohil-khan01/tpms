import { HiXMark, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { useState, useEffect } from 'react';

const ImageZoomModal = ({ isOpen, imageUrl, imageName, onClose, images = [], currentIndex = 0, onNavigate }) => {
  const [scale, setScale] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(currentIndex);
  const hasMultipleImages = images && images.length > 1;

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setScale(1);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setCurrentIdx(currentIndex);
  }, [currentIndex]);

  const handlePrevious = () => {
    const newIdx = currentIdx === 0 ? images.length - 1 : currentIdx - 1;
    setCurrentIdx(newIdx);
    if (onNavigate) onNavigate(newIdx);
  };

  const handleNext = () => {
    const newIdx = currentIdx === images.length - 1 ? 0 : currentIdx + 1;
    setCurrentIdx(newIdx);
    if (onNavigate) onNavigate(newIdx);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 1));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleZoomOut();
    } else {
      handleZoomIn();
    }
  };

  const currentImage = images && images.length > 0 ? images[currentIdx] : imageUrl;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
        >
          <HiXMark className="w-6 h-6 text-white" />
        </button>

        {/* Image Container */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
        >
          <img
            src={currentImage}
            alt={imageName || 'Zoomed image'}
            style={{
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out',
              maxWidth: '90%',
              maxHeight: '85%',
              objectFit: 'contain',
            }}
            className="cursor-move"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="24" fill="%239ca3af" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <HiChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <HiChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 mx-4">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Zoom Out
          </button>
          
          <span className="text-white text-sm font-medium px-3 py-2 bg-white/10 rounded-lg min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Zoom In
          </button>

          <div className="w-px h-6 bg-white/20" />

          <button
            onClick={handleResetZoom}
            className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors text-sm font-medium"
          >
            Reset
          </button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <>
              <div className="w-px h-6 bg-white/20" />
              <span className="text-white text-sm font-medium px-3 py-2">
                {currentIdx + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {/* Image Name */}
        {imageName && (
          <div className="absolute top-16 left-0 right-0 text-center">
            <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm rounded-lg py-2 px-4 inline-block">
              {imageName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageZoomModal;
