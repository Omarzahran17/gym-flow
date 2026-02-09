"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUploader } from "./VideoUploader"
import { VideoPlayer } from "./VideoPlayer"
import { Trash2, Edit, Plus, FolderOpen } from "lucide-react"

interface Video {
  id: string
  url: string
  name: string
  uploadedAt: string
  size?: number
}

interface VideoManagerProps {
  videos: Video[]
  onUploadComplete: (url: string) => void
  onDeleteVideo: (url: string) => void
  title?: string
}

export function VideoManager({
  videos,
  onUploadComplete,
  onDeleteVideo,
  title = "Videos",
}: VideoManagerProps) {
  const [showUploader, setShowUploader] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (url: string) => {
    onUploadComplete(url)
    setShowUploader(false)
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ""
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (selectedVideo) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
          ← Back to videos
        </Button>
        <VideoPlayer
          url={selectedVideo.url}
          title={selectedVideo.name}
          onComplete={() => console.log("Video completed")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button onClick={() => setShowUploader(!showUploader)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {showUploader && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Video</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              onError={handleError}
            />
          </CardContent>
        </Card>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No videos uploaded yet</p>
          <Button variant="outline" onClick={() => setShowUploader(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload your first video
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div
                className="aspect-video bg-gray-100 relative cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-medium truncate">{video.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(video.uploadedAt)}
                  {video.size && ` • ${formatSize(video.size)}`}
                </p>
                <div className="flex items-center justify-end mt-3 space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteVideo(video.url)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Play({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
