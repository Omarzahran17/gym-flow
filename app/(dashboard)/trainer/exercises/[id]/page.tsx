"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Upload, Video, X, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { VideoUploader } from "@/components/video/VideoUploader"
import { VideoPlayer } from "@/components/video/VideoPlayer"

const CATEGORIES = ["Strength", "Cardio", "Flexibility", "Balance", "Plyometric"]
const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Legs",
  "Full Body",
]

export default function EditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVideoUploader, setShowVideoUploader] = useState(false)
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    muscleGroup: "",
    description: "",
    defaultVideoUrl: "",
  })

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setExerciseId(id)
      loadExercise(id)
    }
    loadParams()
  }, [params])

  const loadExercise = async (id: string) => {
    try {
      const response = await fetch(`/api/trainer/exercises/${id}`)
      if (!response.ok) {
        throw new Error("Failed to load exercise")
      }
      const data = await response.json()
      setFormData({
        name: data.exercise.name || "",
        category: data.exercise.category || "",
        muscleGroup: data.exercise.muscleGroup || "",
        description: data.exercise.description || "",
        defaultVideoUrl: data.exercise.defaultVideoUrl || "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exercise")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exerciseId) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/trainer/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update exercise")
      }

      router.push("/trainer/exercises")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update exercise")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!exerciseId) return
    if (!confirm("Are you sure you want to delete this exercise? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/trainer/exercises/${exerciseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete exercise")
      }

      router.push("/trainer/exercises")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete exercise")
    }
  }

  const handleVideoUploadComplete = (url: string) => {
    setFormData({ ...formData, defaultVideoUrl: url })
    setShowVideoUploader(false)
  }

  const handleVideoUploadError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const removeVideo = () => {
    setFormData({ ...formData, defaultVideoUrl: "" })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-500">Loading exercise...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/trainer/exercises">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Exercise</h1>
            <p className="text-gray-600">Update exercise details</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exercise Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Barbell Squat"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="muscleGroup">Muscle Group *</Label>
                <select
                  id="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select muscle group</option>
                  {MUSCLE_GROUPS.map((muscle) => (
                    <option key={muscle} value={muscle}>
                      {muscle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe how to perform the exercise..."
                className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Demo Video</Label>
              
              {formData.defaultVideoUrl ? (
                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <VideoPlayer
                      url={formData.defaultVideoUrl}
                      title="Exercise Preview"
                      onComplete={() => {}}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVideoUploader(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace Video
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeVideo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : showVideoUploader ? (
                <div className="space-y-3">
                  <VideoUploader
                    onUploadComplete={handleVideoUploadComplete}
                    onError={handleVideoUploadError}
                    maxSizeMB={100}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowVideoUploader(false)}
                  >
                    Cancel Upload
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Video className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    Add a demonstration video for this exercise
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVideoUploader(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Maximum file size: 100MB. Supported formats: MP4, WebM, QuickTime
              </p>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-4">
              <Link href="/trainer/exercises">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
