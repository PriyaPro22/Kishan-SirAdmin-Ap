import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Media {
  type: 'image' | 'video' | 'youtube';
  title?: string;
  url: string;
  visibility?: boolean;
  videoTitle?: string;
  imageTitle?: string;
}

interface MediaSliderProps {
  videos?: Array<{ videoTitle: string; url: string; visibility?: boolean }>;
  images?: Array<{ imageTitle: string; url: string; visibility?: boolean }>;
  mixedMedia?: Array<{ type: 'image' | 'video' | 'youtube'; url: string; title?: string; visibility?: boolean }>;
  darkMode?: boolean;
  autoPlayDuration?: number;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  videos = [],
  images = [],
  mixedMedia = [],
  darkMode = false,
  autoPlayDuration = 3000, // Default to 3 seconds for images as requested
}) => {
  // Combine and filter media
  const mediaList: Media[] = React.useMemo(() => {
    // If mixedMedia is provided, use it (it should already be sorted/mixed)
    if (mixedMedia && mixedMedia.length > 0) {
      return mixedMedia.map(m => ({
        type: m.type as 'image' | 'video' | 'youtube',
        title: m.title,
        url: m.url,
        visibility: m.visibility !== false
      }));
    }

    // Fallback to separate props (backward compatibility)
    return [
      ...images
        .filter((img) => img.visibility !== false)
        .map((img) => ({
          type: 'image' as const,
          title: img.imageTitle,
          url: img.url,
          visibility: img.visibility,
        })),
      ...videos
        .filter((vid) => vid.visibility !== false)
        .map((vid) => {
          const isYoutube = vid.url.includes('youtube.com') || vid.url.includes('youtu.be');
          return {
            type: (isYoutube ? 'youtube' : 'video') as 'video' | 'youtube',
            title: vid.videoTitle,
            url: vid.url,
            visibility: vid.visibility,
            videoTitle: vid.videoTitle,
          };
        }),
    ];
  }, [images, videos, mixedMedia]);

  // Extra filter for safety (ensures we don't crash on bad data)
  const safeMediaList = React.useMemo(() => {
    return mediaList.filter(m => m && typeof m === 'object' && m.url);
  }, [mediaList]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [showSoundBtn, setShowSoundBtn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundBtnTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (safeMediaList.length === 0) {
    return (
      <div
        className={`w-full h-48 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-200'
          }`}
      >
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          No media available
        </p>
      </div>
    );
  }

  const currentMedia = safeMediaList[currentIndex];

  const getYoutubeId = (url: string): string => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      if (url.includes('youtu.be/')) return urlObj.pathname.substring(1);
      if (url.includes('youtube.com/watch')) return urlObj.searchParams.get('v') || '';
      if (url.includes('/embed/')) return urlObj.pathname.split('/embed/')[1]?.split('?')[0] || '';
    } catch (e) {
      // Fallback for non-standard URLs
      if (url.includes('youtu.be/')) return url.split('youtu.be/')[1]?.split('?')[0] || '';
      if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0] || '';
    }
    return '';
  };

  // YouTube Embed URL Generator
  const getVideoSourceUrl = (youtubeUrl: string): string => {
    const videoId = getYoutubeId(youtubeUrl);
    if (videoId) {
      const origin = typeof window !== 'undefined' ? (window.location.protocol + '//' + window.location.host) : '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&mute=1&enablejsapi=1&playsinline=1&origin=${origin}`;
    }
    return youtubeUrl;
  };

  const lastTransitionRef = useRef(0);

  const handleNext = React.useCallback(() => {
    const now = Date.now();
    if (now - lastTransitionRef.current < 500) return; // Debounce slides
    lastTransitionRef.current = now;

    setCurrentIndex((prev) => {
      const next = (prev + 1) % safeMediaList.length;
      console.log('⏭️ SLIDING NEXT. From:', prev, 'To:', next);
      return next;
    });

    setProgress(0);
    setIsYoutubeReady(false);

    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch (e) { }
      ytPlayerRef.current = null;
    }
  }, [safeMediaList.length]);

  const handlePrev = () => {
    const now = Date.now();
    if (now - lastTransitionRef.current < 500) return;
    lastTransitionRef.current = now;

    setCurrentIndex((prev) => (prev - 1 + safeMediaList.length) % safeMediaList.length);
    setProgress(0);
    setIsYoutubeReady(false);
    if (ytPlayerRef.current) {
      try { ytPlayerRef.current.destroy(); } catch (e) { }
      ytPlayerRef.current = null;
    }
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -50) handleNext();
    else if (info.offset.x > 50) handlePrev();
  };

  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  const ytPlayerRef = useRef<any>(null);

  // Auto-play / Auto-slide Logic
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (currentMedia.type === 'image') {
      const duration = autoPlayDuration || 5000;
      const intervalTime = 50;
      const step = 100 / (duration / intervalTime);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + step;
        });
      }, intervalTime);

    } else if (currentMedia.type === 'video') {
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(e => console.log("Autoplay error", e));
      }
    } else if (currentMedia.type === 'youtube' && isYoutubeReady && ytPlayerRef.current) {
      // YOUTUBE PROGRESS SYNC
      progressIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const currentTime = ytPlayerRef.current.getCurrentTime();
          const duration = ytPlayerRef.current.getDuration();
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 200);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, currentMedia.url, currentMedia.type, handleNext, isMuted, isYoutubeReady]);

  // Simplified YouTube initialization
  useEffect(() => {
    if (currentMedia.type !== 'youtube') return;    // Simplified YouTube initialization
    // Hybrid YouTube initialization
    const videoId = getYoutubeId(currentMedia.url);
    if (!videoId) {
      handleNext();
      return;
    }

    // Load library once
    if (!(window as any).YT) {
      if (!document.getElementById('youtube-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }

    let checkReady: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;

    const attachAPI = () => {
      const iframe = document.getElementById(`youtube-iframe-${currentIndex}`) as HTMLIFrameElement;
      if (!iframe) return false;

      ytPlayerRef.current = new (window as any).YT.Player(iframe, {
        events: {
          onReady: (e: any) => {
            setIsYoutubeReady(true);
            if (isMuted) e.target.mute(); else e.target.unMute();
          },
          onStateChange: (e: any) => {
            // 0 = ENDED
            if (e.data === 0) {
              handleNext();
            }
          }
        }
      });
      return true;
    };

    checkReady = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        if (attachAPI()) clearInterval(checkReady);
      }
    }, 500);

    // Fallback: If video is still on screen after 60 seconds and API hasn't worked, slide anyway
    fallbackTimer = setTimeout(() => {
      if (safeMediaList[currentIndex].type === 'youtube') handleNext();
    }, 60000);

    return () => {
      clearInterval(checkReady);
      clearTimeout(fallbackTimer);
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) { }
        ytPlayerRef.current = null;
      }
    };
  }, [currentIndex, currentMedia.url, currentMedia.type, handleNext]);

  // Separate effect to handle Mute/Unmute without destroying the player
  useEffect(() => {
    if (ytPlayerRef.current && ytPlayerRef.current.mute) {
      if (isMuted) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    }
  }, [isMuted]);

  // Video Event Handlers
  const handleVideoEnd = () => {
    setProgress(100);
    handleNext();
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (videoRef.current) {
      videoRef.current.muted = newMuteState;
      videoRef.current.volume = 1;
      if (!newMuteState) {
        videoRef.current.play().catch(e => console.log("Play failed on unmute", e));
      }
    }
  };

  const handleInteraction = () => {
    setShowSoundBtn(true);
    if (soundBtnTimerRef.current) clearTimeout(soundBtnTimerRef.current);
    soundBtnTimerRef.current = setTimeout(() => {
      setShowSoundBtn(false);
    }, 3000);
  };

  return (
    <div
      className="w-full relative bg-gray-100 dark:bg-black overflow-hidden group"
      style={{ aspectRatio: '16 / 9' }}
      onClick={handleInteraction}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute(); handleInteraction(); }}
        className={`absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all duration-500 border border-white/20 shadow-lg ${showSoundBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
      </button>
      {/* Navigation Arrows */}
      <div className={`absolute inset-0 flex items-center justify-between px-4 z-40 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="p-2 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all border border-white/10"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dots Indicator (Banner Style) */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-40">
        {safeMediaList.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentIndex(index); setProgress(0); }}
            className={`transition-all duration-300 rounded-full h-1.5 ${index === currentIndex ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentMedia.type}-${currentIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="w-full h-full bg-black relative m-0 p-0 cursor-grab active:cursor-grabbing"
        >
          {currentMedia.type === 'image' && (
            <img
              src={currentMedia.url}
              alt="Media"
              className="w-full h-full object-cover block"
            />
          )}

          {currentMedia.type === 'video' && (
            <video
              ref={videoRef}
              src={currentMedia.url}
              autoPlay
              muted={isMuted}
              onEnded={handleVideoEnd}
              onTimeUpdate={handleVideoTimeUpdate}
              playsInline
              className="w-full h-full object-cover block"
            />
          )}

          {currentMedia.type === 'youtube' && (
            <div className={`w-full h-full overflow-hidden m-0 p-0 block relative bg-black`}>
              <iframe
                id={`youtube-iframe-${currentIndex}`}
                src={getVideoSourceUrl(currentMedia.url)}
                className="absolute top-[-8%] left-[-5%] w-[110%] h-[116%] border-0 block"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <div className="absolute inset-0 z-10 pointer-events-none"></div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MediaSlider;
