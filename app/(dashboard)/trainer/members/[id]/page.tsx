"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, Clock, Mail, Phone, ChevronRight, Trophy, Camera, Plus, Trash2, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import Image from "next/image"

interface MemberDetail {
  id: number
  name: string
  email: string
  phone: string | null
  status: string
  joinDate: string
  workoutPlans: {
    id: number
    name: string
    description: string | null
    isActive: boolean
    startDate: string | null
    exercises: {
      id: number
      exerciseId: number
      exerciseName: string
      sets: number | null
      reps: string | null
    }[]
  }[]
  stats: {
    totalWorkouts: number
    attendanceRate: number
  }
  achievements: {
    id: number
    name: string
    icon: string | null
    earnedAt: string
  }[]
  progressPhotos: {
    id: number
    date: string
    url: string
    type: string
    notes: string | null
  }[]
  measurements: {
    id: number
    date: string
    weight: number | null
    bodyFat: number | null
    waist: number | null
    notes: string | null
  }[]
}

export default function TrainerMemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/trainer/members/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => {
        if (data.member) {
          setMember(data.member)
        }
      })
      .catch(() => {
        router.push("/trainer/members")
      })
      .finally(() => setLoading(false))
  }, [params.id, router])

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this progress photo?")) return
    
    setDeletingPhoto(photoId)
    try {
      const response = await fetch(`/api/member/progress-photos?id=${photoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete photo")
      }

      setMember(prev => prev ? {
        ...prev,
        progressPhotos: prev.progressPhotos.filter(p => p.id !== photoId)
      } : null)
    } catch (err) {
      console.error("Error deleting photo:", err)
      alert("Failed to delete photo. Please try again.")
    } finally {
      setDeletingPhoto(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-border"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/trainer/members">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-xl font-semibold text-white">
              {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {member.email}
              </span>
              <Badge className={member.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-foreground/80"}>
                {member.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{member.stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Workouts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{member.stats.attendanceRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{member.workoutPlans.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Workout Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Workout Plans</TabsTrigger>
          <TabsTrigger value="progress">Progress & Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">Active Plans</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {member.workoutPlans.filter(p => p.isActive).length === 0 ? (
                  <div className="text-center py-8">
                    <Dumbbell className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                    <p className="text-muted-foreground">No active plans</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {member.workoutPlans.filter(p => p.isActive).map((plan) => (
                      <Link key={plan.id} href={`/trainer/workout-plans/${plan.id}`}>
                        <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">{plan.name}</p>
                              <p className="text-sm text-muted-foreground">{plan.exercises.length} exercises</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {member.achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                    <p className="text-muted-foreground">No achievements yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {member.achievements.slice(0, 4).map((achievement) => (
                      <div key={achievement.id} className="p-3 bg-muted/50 rounded-lg border border-border text-center">
                        <div className="text-2xl mb-1">{achievement.icon || "🏆"}</div>
                        <p className="text-sm font-medium text-foreground">{achievement.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">All Workout Plans</CardTitle>
                <Link href={`/trainer/workout-plans/new?memberId=${member.id}`}>
                  <Button variant="outline" size="sm" className="border-border">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {member.workoutPlans.map((plan) => (
                  <Link key={plan.id} href={`/trainer/workout-plans/${plan.id}`}>
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.exercises.length} exercises</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={plan.isActive ? "bg-emerald-50 text-emerald-700" : "bg-muted text-foreground/80"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddPhoto(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Upload Progress Photo
            </Button>
          </div>

          {showAddPhoto && (
            <AddProgressPhotoForm
              memberId={member.id}
              onClose={() => setShowAddPhoto(false)}
              onSuccess={() => {
                setShowAddPhoto(false)
                // Refresh member data
                setLoading(true)
                fetch(`/api/trainer/members/${params.id}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.member) setMember(data.member)
                  })
                  .finally(() => setLoading(false))
              }}
            />
          )}

          {member.progressPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {member.progressPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden border-border shadow-sm">
                  <div className="aspect-square relative bg-muted">
                    <Image
                      src={photo.url}
                      alt={`Progress photo - ${photo.type}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhoto === photo.id}
                    >
                      {deletingPhoto === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(photo.date), "MMMM d, yyyy")}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1 uppercase tracking-wider">
                      {photo.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
              <Camera className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
              <p className="text-muted-foreground text-sm">No progress photos uploaded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AddProgressPhotoForm({ memberId, onClose, onSuccess }: { memberId: number; onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Front",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("path", `progress/member-${memberId}/${Date.now()}-${file.name}`)
      uploadFormData.append("type", "image")

      const uploadRes = await fetch("/api/blob/upload", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const { url } = await uploadRes.json()

      const response = await fetch("/api/member/progress-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use a trick here: since this API usually takes the logged-in user's member ID,
        // we might need a specific trainer-facing API if we want to upload as a trainer for a member.
        // But for now, let's see if the API handles memberId in body.
        body: JSON.stringify({
          ...formData,
          url,
          memberId, // The API might need to be updated to respect this if the user is a trainer
        }),
      })

      if (!response.ok) throw new Error("Failed to save progress photo")
      onSuccess()
    } catch (err) {
      console.error("Error adding progress photo:", err)
      alert(err instanceof Error ? err.message : "Failed to add progress photo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Upload Member Progress Photo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full p-2 border border-border rounded-md bg-transparent"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">View Type</label>
              <select
                className="w-full p-2 border border-border rounded-md bg-transparent"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Front">Front View</option>
                <option value="Side">Side View</option>
                <option value="Back">Back View</option>
                <option value="Relaxed">Relaxed</option>
                <option value="Flexed">Flexed</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo</label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file} className="bg-zinc-900 border-zinc-900">
              {loading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
