"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

interface Trainer {
  id: number
  userId: string
  bio?: string
  specialization?: string
  certifications?: string
  maxClients: number
  hourlyRate?: number
  firstName?: string
  lastName?: string
}

export default function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [trainer, setTrainer] = useState<Trainer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [trainerId, setTrainerId] = useState<string>("")

  useEffect(() => {
    const loadParams = async () => {
      const { id } = await params
      setTrainerId(id)

      try {
        const res = await fetch(`/api/admin/trainers/${id}`)
        const data = await res.json()
        if (data.trainer) {
          setTrainer(data.trainer)
        }
      } catch (err) {
        console.error("Failed to fetch trainer:", err)
      } finally {
        setLoading(false)
      }
    }

    loadParams()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainer || !trainerId) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/trainers/${trainerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update trainer")
      }

      router.push("/admin/trainers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!trainerId || !confirm("Are you sure you want to delete this trainer?")) return

    try {
      const response = await fetch(`/api/admin/trainers/${trainerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete trainer")
      }

      router.push("/admin/trainers")
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

  if (!trainer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Trainer not found</p>
        <Link href="/admin/trainers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trainers
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/trainers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {trainer.firstName && trainer.lastName
              ? `${trainer.firstName} ${trainer.lastName}`
              : "Edit Trainer"}
          </h1>
          <p className="text-gray-600">Update trainer information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Trainer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={trainer.specialization || ""}
                  onChange={(e) =>
                    setTrainer({ ...trainer, specialization: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  value={trainer.bio || ""}
                  onChange={(e) =>
                    setTrainer({ ...trainer, bio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications</Label>
                <Input
                  id="certifications"
                  value={trainer.certifications || ""}
                  onChange={(e) =>
                    setTrainer({ ...trainer, certifications: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxClients">Max Clients</Label>
                  <Input
                    id="maxClients"
                    type="number"
                    value={trainer.maxClients}
                    onChange={(e) =>
                      setTrainer({
                        ...trainer,
                        maxClients: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={trainer.hourlyRate || ""}
                    onChange={(e) =>
                      setTrainer({
                        ...trainer,
                        hourlyRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/admin/trainers")}
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
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium">Current Clients</p>
                <p className="text-sm text-muted-foreground">0 / {trainer.maxClients}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (!trainerId || !confirm("Are you sure you want to convert this trainer to a member? All trainer-specific data will be removed.")) return

                  try {
                    const response = await fetch(`/api/admin/trainers/${trainerId}/convert`, {
                      method: "POST",
                    })

                    if (!response.ok) {
                      throw new Error("Failed to convert trainer")
                    }

                    router.push("/admin/members")
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to convert")
                  }
                }}
              >
                Convert to Member
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                Delete Trainer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
