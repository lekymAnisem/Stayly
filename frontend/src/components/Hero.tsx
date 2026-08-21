import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Sparkles } from 'lucide-react'
import SmartImage from './SmartImage'
import { img } from '../data/images'

// Travel-themed hero footage hosted on Cloudinary.
const VIDEO_SRC =
  'https://res.cloudinary.com/dk5cvkoy7/video/upload/v1787240502/Converting_image_to_video_backgr__202608202341_l1ccrg.mp4'
const POSTER = img('1470770841072-f978cf4d019e', 2000)

export default function Hero() {
  const [muted, setMuted] = useState(true)
  const [showVideo, setShowVideo] = useState(true)
  const [isHologramActive, setIsHologramActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  // Respect users who prefer reduced motion: skip the moving background and
  // fall back to the static poster image.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setShowVideo(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Hologram effect activation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHologramActive(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (!v.muted && v.paused) v.play().catch(() => {})
  }

  return (
    <section className="relative mx-auto max-w-[1440px] px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
      {/* Cyber grid background */}
      <div 
        className="absolute inset-0 opacity-20 bg-cyber-grid bg-grid-md pointer-events-none"
        style={{ backgroundPosition: '0 0, 0 0' }}
      />
      
      {/* Data stream particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-0.5 h-4 bg-gradient-to-b from-brand-400 to-transparent animate-data-stream opacity-60" style={{ animationDelay: '0s' }} />
        <div className="absolute -top-20 right-1/3 w-0.5 h-6 bg-gradient-to-b from-neon-400 to-transparent animate-data-stream opacity-40" style={{ animationDelay: '2s' }} />
        <div className="absolute -top-20 left-2/3 w-0.5 h-3 bg-gradient-to-b from-electric-400 to-transparent animate-data-stream opacity-50" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-glow sm:h-[480px] lg:h-[540px] border border-brand-500/20 backdrop-blur-sm">
        {/* Background: video with a static image fallback as the poster. */}
        {showVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={POSTER}
            aria-hidden="true"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <SmartImage
            alt="A serene lakefront with mountains in the distance"
            src={POSTER}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Futuristic overlay gradients */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-brand-900/30"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-600/20 via-transparent to-cyber-600/20"
          aria-hidden="true"
        />
        
        {/* Hologram effect overlay */}
        <div 
          className={`absolute inset-0 bg-hologram transition-opacity duration-1000 ${
            isHologramActive ? 'opacity-30 animate-hologram-shift' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Cyber accent lines */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-400 to-transparent opacity-60" />

        <div className="relative flex h-full flex-col justify-end p-6 sm:p-10 lg:p-14">
          {/* Floating accent elements */}
          <div className="absolute top-8 right-8 animate-float">
            <div className="w-2 h-2 rounded-full bg-neon-400 shadow-glow-neon animate-cyber-blink" />
          </div>
          <div className="absolute top-16 right-20 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-electric-400 shadow-glow-electric" />
          </div>

          <div className="animate-fade-up">
            {/* Status indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-400/20 border border-neon-400/30 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-neon-400 animate-pulse" />
                <span className="text-xs font-medium text-neon-200 tracking-wide">CONNECTED</span>
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-neon-400 to-transparent opacity-60" />
            </div>

            <h1 className="max-w-xl text-3xl font-black leading-tight text-white drop-shadow-lg sm:text-4xl lg:text-6xl tracking-tight">
              <span className="bg-gradient-to-r from-white via-brand-200 to-cyber-200 bg-clip-text text-transparent">
                Experience
              </span>
              <br />
              <span className="text-white">the Future of</span>
              <br />
              <span className="bg-gradient-to-r from-neon-400 via-brand-400 to-electric-400 bg-clip-text text-transparent animate-glow-pulse">
                Travel
              </span>
            </h1>
            <p className="mt-4 text-base text-brand-100/90 sm:text-lg max-w-md leading-relaxed">
              Discover extraordinary destinations through our quantum-enhanced search system.
            </p>
          </div>

          {/* Enhanced mute toggle */}
          {showVideo && (
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute neural feed' : 'Mute neural feed'}
              className="absolute right-5 top-5 group inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-400/30 bg-slate-900/50 text-brand-300 backdrop-blur-md transition-all hover:bg-slate-800/80 hover:border-brand-400/50 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500/10 to-cyber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {muted ? (
                <VolumeX className="relative h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              ) : (
                <Volume2 className="relative h-4 w-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
