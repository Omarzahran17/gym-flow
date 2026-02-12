"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileVideo, AlertCircle } from "lucide-react"

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void
  onError: (error: string) => void
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export function VideoUploader({
  onUploadComplete,
  onError,
  maxSizeMB = 100,
  acceptedTypes = ["video/mp4", "video/webm", "video/quicktime"],
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      const error = (() => {
        if (!acceptedTypes.includes(file.type)) {
          return "Invalid file type. Please upload MP4, WebM, or QuickTime video."
        }
        const sizeMB = file.size / (1024 * 1024)
        if (sizeMB > maxSizeMB) {
          return `File too large. Maximum size is ${maxSizeMB}MB.`
        }
        return null
      })()
      if (error) {
        onError(error)
        return
      }

      setSelectedFile(file)
      setUploading(true)
      setProgress(0)

      try {
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 5, 90))
        }, 500)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("path", `videos/${Date.now()}-${file.name}`)
        formData.append("type", "video")

        const response = await fetch("/api/blob/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to upload video")
        }

        const data = await response.json()
        const url = data.url

        clearInterval(progressInterval)
        setProgress(100)

        setTimeout(() => {
          onUploadComplete(url)
          setSelectedFile(null)
          setUploading(false)
          setProgress(0)
        }, 500)
      } catch (err) {
        console.error("Upload failed:", err)
        onError(err instanceof Error ? err.message : "Failed to upload video. Please try again.")
        setUploading(false)
        setProgress(0)
        setSelectedFile(null)
      }
    },
    [onUploadComplete, onError, acceptedTypes, maxSizeMB]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              Drag & drop your video here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse
            </p>
            <p className="text-xs text-gray-400">
              MP4, WebM, QuickTime up to {maxSizeMB}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <FileVideo className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 text-center">
                {progress < 100 ? "Uploading..." : "Processing..."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
