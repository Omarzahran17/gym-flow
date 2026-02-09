"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Dumbbell, Edit, Trash2, Video } from "lucide-react"
import { VideoPlayer } from "@/components/video/VideoPlayer"

interface Exercise {
  id: number
  name: string
  category: string
  muscleGroup: string
  description: string
  defaultVideoUrl?: string
}

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

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [muscleFilter, setMuscleFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/trainer/exercises")
      .then((res) => res.json())
      .then((data) => {
        if (data.exercises) {
          setExercises(data.exercises)
        }
      })
      .catch((err) => console.error("Failed to fetch exercises:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(search.toLowerCase()) ||
      exercise.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || exercise.category === categoryFilter
    const matchesMuscle = !muscleFilter || exercise.muscleGroup === muscleFilter
    return matchesSearch && matchesCategory && matchesMuscle
  })

  const handleDeleteExercise = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return

    try {
      await fetch(`/api/trainer/exercises/${id}`, {
        method: "DELETE",
      })
      setExercises(exercises.filter((e) => e.id !== id))
    } catch (err) {
      console.error("Failed to delete exercise:", err)
    }
  }

  if (selectedVideo) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedVideo(null)}>
          ← Back to exercises
        </Button>
        <VideoPlayer
          url={selectedVideo}
          title="Exercise Video"
          onComplete={() => {}}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Exercise Library</h1>
          <p className="text-zinc-500 mt-1">Manage your exercise database</p>
        </div>
        <Link href="/trainer/exercises/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 min-w-[150px] focus:border-zinc-900 focus:ring-zinc-900"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={muscleFilter}
          onChange={(e) => setMuscleFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 min-w-[150px] focus:border-zinc-900 focus:ring-zinc-900"
        >
          <option value="">All Muscle Groups</option>
          {MUSCLE_GROUPS.map((muscle) => (
            <option key={muscle} value={muscle}>
              {muscle}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-zinc-200"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-xl">
          <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 mb-4">No exercises found</p>
          <Link href="/trainer/exercises/new">
            <Button variant="outline" className="border-zinc-200 hover:bg-zinc-50">
              <Plus className="h-4 w-4 mr-2" />
              Add your first exercise
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="border-zinc-200 shadow-sm overflow-hidden">
              {exercise.defaultVideoUrl && (
                <div
                  className="aspect-video bg-zinc-100 relative cursor-pointer group"
                  onClick={() => setSelectedVideo(exercise.defaultVideoUrl!)}
                >
                  <video
                    src={exercise.defaultVideoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-zinc-900">{exercise.name}</CardTitle>
                    <p className="text-sm text-zinc-500 mt-0.5">{exercise.category}</p>
                  </div>
                  <Link href={`/trainer/exercises/${exercise.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 mb-2">
                  <span className="font-medium text-zinc-900">{exercise.muscleGroup}</span>
                </p>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                  {exercise.description}
                </p>
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-zinc-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50"
                    onClick={() => handleDeleteExercise(exercise.id)}
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
