"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, Clock, Mail, Phone, ChevronRight, Trophy } from "lucide-react"

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
}

export default function TrainerMemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-zinc-200"></div>
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
            <h1 className="text-2xl font-bold text-zinc-900">{member.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-zinc-500 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {member.email}
              </span>
              <Badge className={member.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-600"}>
                {member.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">{member.stats.totalWorkouts}</p>
              <p className="text-sm text-zinc-500 mt-1">Total Workouts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">{member.stats.attendanceRate}%</p>
              <p className="text-sm text-zinc-500 mt-1">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">{member.workoutPlans.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Workout Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-zinc-900">Workout Plans</CardTitle>
              <Link href={`/trainer/workout-plans/new?memberId=${member.id}`}>
                <Button variant="outline" size="sm" className="border-zinc-200">
                  Create Plan
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {member.workoutPlans.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-500">No workout plans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {member.workoutPlans.map((plan) => (
                  <Link key={plan.id} href={`/trainer/workout-plans/${plan.id}`}>
                    <div className="p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-zinc-900">{plan.name}</p>
                          <p className="text-sm text-zinc-500">{plan.exercises.length} exercises</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={plan.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <CardTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {member.achievements.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-10 w-10 mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-500">No achievements yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {member.achievements.map((achievement) => (
                  <div key={achievement.id} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-center">
                    <div className="text-2xl mb-1">{achievement.icon || "🏆"}</div>
                    <p className="text-sm font-medium text-zinc-900">{achievement.name}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
