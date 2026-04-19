import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const TicketImageGallery = ({ attachments }) => {
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  // Base URL for the API
  const API_BASE_URL = 'http://localhost:8081';

  const openFullscreen = (index) => {
    setCurrentIndex(index);
    setFullscreenImage(attachments[index]);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % attachments.length;
    setCurrentIndex(nextIdx);
    setFullscreenImage(attachments[nextIdx]);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + attachments.length) % attachments.length;
    setCurrentIndex(prevIdx);
    setFullscreenImage(attachments[prevIdx]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Evidence ({attachments.length})</span>
      </div>
      
      <div className={`grid gap-4 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
        {attachments.map((att, index) => (
          <div 
            key={att.id} 
            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 cursor-pointer hover:border-black transition-all shadow-sm"
            onClick={() => openFullscreen(index)}
          >
            <img 
              src={`${API_BASE_URL}${att.fileUrl}`} 
              alt={att.originalFileName}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300"
          onClick={closeFullscreen}
        >
          <button 
            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 z-10"
            onClick={closeFullscreen}
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {attachments.length > 1 && (
              <>
                <button 
                  className="absolute left-0 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 -translate-x-full hidden lg:block mr-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  className="absolute right-0 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/20 translate-x-full hidden lg:block ml-8"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="w-full h-full relative rounded-[3rem] overflow-hidden border-2 border-white/10 bg-black/50 shadow-2xl flex flex-col">
              <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={`${API_BASE_URL}${fullscreenImage.fileUrl}`} 
                  alt={fullscreenImage.originalFileName}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
              </div>
              
              <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/10 flex justify-between items-center text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Evidence Frame {currentIndex + 1} / {attachments.length}</p>
                  <h4 className="text-xl font-black uppercase tracking-tighter">{fullscreenImage.originalFileName}</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {attachments.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/20'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Controls */}
            <div className="flex gap-4 mt-8 lg:hidden">
              <button 
                className="p-5 bg-white/10 text-white rounded-2xl border border-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                className="p-5 bg-white/10 text-white rounded-2xl border border-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketImageGallery;
