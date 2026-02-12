"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Calendar, Trash2, Plus, Clock, MapPin, X } from "lucide-react"
import Link from "next/link"

interface ClassData {
  id: number
  name: string
  description?: string
  trainerId?: number
  maxCapacity: number
  durationMinutes: number
  color?: string
  trainer?: {
    id: number
    userId: string
    specialization?: string
  }
  schedules?: ClassSchedule[]
}

interface ClassSchedule {
  id: number
  dayOfWeek: number
  startTime: string
  room: string
}

interface Trainer {
  id: number
  userId: string
  name?: string | null
  email?: string | null
  specialization?: string
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [classId, setClassId] = useState<string>("")
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ dayOfWeek: "1", startTime: "09:00", room: "Main Studio" })
  const [addingSchedule, setAddingSchedule] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params
      setClassId(id)

      try {
        const [classRes, trainersRes, schedulesRes] = await Promise.all([
          fetch(`/api/admin/classes/${id}`),
          fetch("/api/admin/trainers"),
          fetch(`/api/admin/class-schedules?classId=${id}`),
        ])

        const classResult = await classRes.json()
        const trainersResult = await trainersRes.json()
        const schedulesResult = await schedulesRes.json()

        if (classResult.class) {
          setClassData({ ...classResult.class, schedules: schedulesResult.schedules || [] })
        }
        if (trainersResult.trainers) {
          setTrainers(trainersResult.trainers)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load class data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classData || !classId) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update class")
      }

      router.push("/admin/classes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!classId || !confirm("Are you sure you want to delete this class?")) return

    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete class")
      }

      router.push("/admin/classes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classId) return

    setAddingSchedule(true)
    try {
      const response = await fetch("/api/admin/class-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: parseInt(classId),
          dayOfWeek: parseInt(scheduleForm.dayOfWeek),
          startTime: scheduleForm.startTime,
          room: scheduleForm.room,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add schedule")
      }

      const newSchedule = await response.json()
      setClassData({
        ...classData!,
        schedules: [...(classData?.schedules || []), newSchedule.schedule],
      })
      setShowScheduleForm(false)
      setScheduleForm({ dayOfWeek: "1", startTime: "09:00", room: "Main Studio" })
    } catch (err) {
      alert("Failed to add schedule")
    } finally {
      setAddingSchedule(false)
    }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return

    try {
      const response = await fetch(`/api/admin/class-schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete schedule")
      }

      setClassData({
        ...classData!,
        schedules: classData!.schedules?.filter(s => s.id !== scheduleId),
      })
    } catch (err) {
      alert("Failed to delete schedule")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Class not found</p>
        <Link href="/admin/classes">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Edit Class</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Update class information and schedules</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Class Name</Label>
                <Input
                  id="name"
                  value={classData.name || ""}
                  onChange={(e) =>
                    setClassData({ ...classData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  value={classData.description || ""}
                  onChange={(e) =>
                    setClassData({ ...classData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainerId">Trainer</Label>
                    <select
                      id="trainerId"
                      className="w-full p-2 border rounded-md"
                      value={classData.trainerId || ""}
                      onChange={(e) =>
                        setClassData({
                          ...classData,
                          trainerId: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                    >
                      <option value="">No trainer assigned</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name || trainer.email || trainer.userId}
                          {trainer.specialization ? ` - ${trainer.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={classData.color || "#3B82F6"}
                    onChange={(e) =>
                      setClassData({ ...classData, color: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Max Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    value={classData.maxCapacity}
                    onChange={(e) =>
                      setClassData({
                        ...classData,
                        maxCapacity: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={classData.durationMinutes}
                    onChange={(e) =>
                      setClassData({
                        ...classData,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/admin/classes")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Class Schedules</CardTitle>
              <Button
                size="sm"
                onClick={() => setShowScheduleForm(!showScheduleForm)}
                className="bg-zinc-900 hover:bg-zinc-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showScheduleForm && (
                <form onSubmit={handleAddSchedule} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Day</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={scheduleForm.dayOfWeek}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                    >
                      {DAYS.map((day) => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Room</Label>
                    <Input
                      value={scheduleForm.room}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowScheduleForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="flex-1 bg-zinc-900 hover:bg-zinc-800" disabled={addingSchedule}>
                      {addingSchedule ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              )}

              {classData.schedules && classData.schedules.length > 0 ? (
                <div className="space-y-2">
                  {classData.schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-zinc-900 dark:text-white">
                            {DAYS.find(d => d.value === schedule.dayOfWeek)?.label}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {schedule.startTime.slice(0, 5)} • {schedule.room}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                  No schedules yet. Add a schedule to make this class available to members.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-sm">Max Capacity</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{classData.maxCapacity} members</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-sm">Duration</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{classData.durationMinutes} minutes</p>
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Class
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
