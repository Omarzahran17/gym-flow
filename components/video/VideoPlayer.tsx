"use client"

import { useState, useRef } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react"

interface VideoPlayerProps {
  url: string
  title?: string
  onComplete?: () => void
  thumbnail?: string
}

export function VideoPlayer({
  url,
  title,
  onComplete,
  thumbnail,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handlePlayPause = () => {
    setPlaying(!playing)
  }

  const handleMute = () => {
    setMuted(!muted)
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played)
    }
    if (state.played >= 0.95 && onComplete) {
      onComplete()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
    playerRef.current?.seekTo(parseFloat(e.target.value))
  }

  const handleSeekMouseDown = () => {
    setSeeking(true)
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false)
    playerRef.current?.seekTo(parseFloat((e.target as HTMLInputElement).value))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        muted={muted}
        onProgress={handleProgress}
        onDuration={setDuration}
        width="100%"
        height="100%"
        style={{ aspectRatio: "16/9" }}
        light={thumbnail || true}
        playIcon={
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
            <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
          </div>
        }
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {title && (
          <p className="text-white font-medium mb-2 truncate">{title}</p>
        )}
        
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={played}
            onMouseDown={handleSeekMouseDown}
            onChange={handleSeek}
            onMouseUp={handleSeekMouseUp}
            className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <span className="text-white text-sm">
            {formatTime(played * duration)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handlePlayPause}
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleMute}
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
