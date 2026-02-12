"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Play, ChevronRight, Trophy } from "lucide-react"
import { VideoPlayer } from "@/components/video/VideoPlayer"

interface PlanExercise {
  id: number
  sets: number
  reps: string
  weight: number | null
  restSeconds: number
  notes: string
  completed?: boolean
  exercise: {
    id: number
    name: string
    description: string
    defaultVideoUrl?: string
    category: string
    muscleGroup: string
  }
}

interface WorkoutPlan {
  id: number
  name: string
  description: string
  isActive: boolean
  startDate: string | null
  endDate: string | null
  exercises: PlanExercise[]
  trainer?: { id: number }
}

export default function MemberWorkoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch("/api/member/workout-plan")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) {
          setPlan(data.plan)
          const saved = localStorage.getItem(`workout-${data.plan.id}`)
          if (saved) {
            setCompletedExercises(new Set(JSON.parse(saved)))
          }
        }
      })
      .catch((err) => console.error("Failed to fetch workout plan:", err))
      .finally(() => setLoading(false))
  }, [])

  const toggleExerciseComplete = (exerciseId: number) => {
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId)
    } else {
      newCompleted.add(exerciseId)
    }
    setCompletedExercises(newCompleted)
    if (plan) {
      localStorage.setItem(`workout-${plan.id}`, JSON.stringify([...newCompleted]))
    }
  }

  const completionPercentage = plan
    ? Math.round((completedExercises.size / plan.exercises.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Workout</h1>
          <p className="text-muted-foreground mt-1">Your personalized workout plan</p>
        </div>
        <Card className="border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Workout Plan</h3>
            <p className="text-muted-foreground mb-6">
              Contact your trainer to get started with a personalized workout plan.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedVideo) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVideo(null)} className="text-foreground/80 hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workout
        </Button>
        <VideoPlayer url={selectedVideo} title="Exercise Demo" onComplete={() => {}} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{plan.name}</h1>
          <p className="text-muted-foreground mt-1">{plan.description}</p>
        </div>
        <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-green-500" : ""}>
          {plan.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-foreground">Workout Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedExercises.size} of {plan.exercises.length} completed
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-center mt-2 font-semibold text-foreground">{completionPercentage}% Complete</p>
        </CardContent>
      </Card>

      {/* Completion Banner */}
      {completionPercentage === 100 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Workout Complete! 🎉</h3>
            <p className="text-green-700">Great job! You've completed all exercises.</p>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Today's Exercises</h2>
        <div className="space-y-4">
          {plan.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.has(exercise.id)
            return (
              <Card
                key={exercise.id}
                className={`border-border shadow-sm transition-all ${
                  isCompleted ? "opacity-60 bg-muted/50" : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-foreground/80"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{exercise.exercise.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exercise.exercise.category} • {exercise.exercise.muscleGroup}
                          </p>
                        </div>
                        <Button
                          variant={isCompleted ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleExerciseComplete(exercise.id)}
                          className={isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Done
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </Button>
                      </div>

                      {exercise.exercise.description && (
                        <p className="text-sm text-foreground/80 mt-3">{exercise.exercise.description}</p>
                      )}

                      <div className="flex items-center gap-6 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{exercise.sets}</p>
                          <p className="text-xs text-muted-foreground">Sets</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{exercise.reps}</p>
                          <p className="text-xs text-muted-foreground">Reps</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{exercise.weight || "-"}</p>
                          <p className="text-xs text-muted-foreground">kg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-foreground">{exercise.restSeconds}s</p>
                          <p className="text-xs text-muted-foreground">Rest</p>
                        </div>
                      </div>

                      {exercise.notes && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Trainer Note:</span> {exercise.notes}
                          </p>
                        </div>
                      )}

                      {exercise.exercise.defaultVideoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVideo(exercise.exercise.defaultVideoUrl!)}
                          className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Demo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
