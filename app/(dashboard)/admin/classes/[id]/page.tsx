"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Calendar, Trash2 } from "lucide-react"
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
}

interface Trainer {
  id: number
  userId: string
  specialization?: string
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [classId, setClassId] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params
      setClassId(id)

      try {
        const [classRes, trainersRes] = await Promise.all([
          fetch(`/api/admin/classes/${id}`),
          fetch("/api/admin/trainers"),
        ])

        const classResult = await classRes.json()
        const trainersResult = await trainersRes.json()

        if (classResult.class) {
          setClassData(classResult.class)
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
          <h1 className="text-3xl font-bold">Edit Class</h1>
          <p className="text-gray-600">Update class information</p>
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
                        {trainer.userId} - {trainer.specialization || "No specialization"}
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
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Current Bookings</p>
                <p className="text-sm text-gray-600">0 / {classData.maxCapacity}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-gray-600">{classData.durationMinutes} minutes</p>
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
  )
}
