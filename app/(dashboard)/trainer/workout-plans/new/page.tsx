"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, X, GripVertical, Save, Search } from "lucide-react"

interface Exercise {
  id: number
  name: string
  category: string
  muscleGroup: string
  description: string
  defaultVideoUrl?: string
}

interface Member {
  id: number
  userId: string
  phone?: string
}

interface PlanExercise {
  exerciseId: number
  sets: number
  reps: string
  weight?: number
  restSeconds: number
  notes: string
  exercise: Exercise
}

export default function NewWorkoutPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExercises, setSelectedExercises] = useState<PlanExercise[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [] as number[],
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    // Load exercises and members
    Promise.all([
      fetch("/api/trainer/exercises").then((r) => r.json()),
      fetch("/api/trainer/members").then((r) => r.json()),
    ])
      .then(([exercisesData, membersData]) => {
        if (exercisesData.exercises) {
          setExercises(exercisesData.exercises)
        }
        if (membersData.members) {
          setMembers(membersData.members)
        }
      })
      .catch((err) => console.error("Failed to load data:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.find((e) => e.exerciseId === exercise.id)) return

    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        sets: 3,
        reps: "10",
        restSeconds: 60,
        notes: "",
        exercise,
      },
    ])
  }

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof PlanExercise, value: any) => {
    const updated = [...selectedExercises]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedExercises(updated)
  }

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === selectedExercises.length - 1) return

    const updated = [...selectedExercises]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setSelectedExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedExercises.length === 0) {
      alert("Please add at least one exercise")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/trainer/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          memberIds: formData.memberIds,
          exercises: selectedExercises.map(({ exercise, ...rest }) => rest),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create workout plan")
      }

      router.push("/trainer/workout-plans")
    } catch (err) {
      console.error("Failed to create plan:", err)
      alert("Failed to create workout plan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/trainer/workout-plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Workout Plan</h1>
          <p className="text-gray-600">Build a custom workout plan for a member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Plan Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Beginner Strength Program"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Assign to Members</Label>
                <div className="border rounded-lg px-3 py-2 max-h-48 overflow-y-auto space-y-2">
                  {members.length === 0 ? (
                    <p className="text-gray-500 text-sm">No members available</p>
                  ) : (
                    members.map((member) => (
                      <label key={member.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.memberIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, memberIds: [...formData.memberIds, member.id] })
                            } else {
                              setFormData({ ...formData, memberIds: formData.memberIds.filter(id => id !== member.id) })
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">
                          Member #{member.id} {member.phone ? `(${member.phone})` : ""}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {formData.memberIds.length > 0 && (
                  <p className="text-sm text-gray-500">{formData.memberIds.length} member(s) selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the workout plan goals and approach..."
                  className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>
                Exercises ({selectedExercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExercises.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No exercises added yet. Select exercises from the library.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedExercises.map((planEx, index) => (
                    <div
                      key={planEx.exerciseId}
                      className="border rounded-lg p-3 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">
                            {index + 1}. {planEx.exercise.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveExercise(index, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveExercise(index, "down")}
                            disabled={index === selectedExercises.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExercise(index)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Sets</Label>
                          <Input
                            type="number"
                            value={planEx.sets}
                            onChange={(e) =>
                              updateExercise(index, "sets", parseInt(e.target.value))
                            }
                            min={1}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Reps</Label>
                          <Input
                            value={planEx.reps}
                            onChange={(e) =>
                              updateExercise(index, "reps", e.target.value)
                            }
                            placeholder="10"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Weight (kg)</Label>
                          <Input
                            type="number"
                            value={planEx.weight || ""}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                "weight",
                                e.target.value ? parseFloat(e.target.value) : null
                              )
                            }
                            placeholder="-"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rest (sec)</Label>
                          <Input
                            type="number"
                            value={planEx.restSeconds}
                            onChange={(e) =>
                              updateExercise(
                                index,
                                "restSeconds",
                                parseInt(e.target.value)
                              )
                            }
                            min={0}
                            className="h-8"
                          />
                        </div>
                      </div>

                      <Input
                        value={planEx.notes}
                        onChange={(e) =>
                          updateExercise(index, "notes", e.target.value)
                        }
                        placeholder="Notes (e.g., Focus on form)"
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Workout Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Exercise Library */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Exercise Library</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredExercises.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No exercises found
                  </p>
                ) : (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{exercise.name}</p>
                        <p className="text-sm text-gray-500">
                          {exercise.category} • {exercise.muscleGroup}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => addExercise(exercise)}
                        disabled={selectedExercises.some(
                          (e) => e.exerciseId === exercise.id
                        )}
                      >
                        <Plus
                          className={`h-4 w-4 ${
                            selectedExercises.some(
                              (e) => e.exerciseId === exercise.id
                            )
                              ? "text-gray-400"
                              : "text-green-600"
                          }`}
                        />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
