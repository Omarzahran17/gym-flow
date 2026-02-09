"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Dumbbell, Calendar, ArrowRight, Plus, ChevronRight, Clock } from "lucide-react"

interface TrainerStats {
  memberCount: number
  workoutPlanCount: number
  activePlanCount: number
}

interface RecentMember {
  id: number
  name: string
  email: string | null
  planName: string
  lastActive: string
}

interface TodaysSession {
  id: number
  time: string
  member: string
  type: string
  duration: string
}

export default function TrainerDashboardPage() {
  const [stats, setStats] = useState<TrainerStats>({
    memberCount: 0,
    workoutPlanCount: 0,
    activePlanCount: 0,
  })
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([])
  const [todaysSchedule, setTodaysSchedule] = useState<TodaysSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, plansRes, dashboardRes] = await Promise.all([
          fetch("/api/trainer/members"),
          fetch("/api/trainer/workout-plans"),
          fetch("/api/trainer/dashboard"),
        ])

        const membersData = await membersRes.json()
        const plansData = await plansRes.json()
        const dashboardData = await dashboardRes.json()

        const members = membersData.members || []
        const plans = plansData.plans || []

        setStats({
          memberCount: members.length,
          workoutPlanCount: plans.length,
          activePlanCount: plans.filter((p: any) => p.isActive).length,
        })

        if (dashboardData.recentMembers) {
          setRecentMembers(dashboardData.recentMembers)
        }
        if (dashboardData.todaysSchedule) {
          setTodaysSchedule(dashboardData.todaysSchedule)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickActions = [
    { href: "/trainer/members", label: "View Members", icon: Users, color: "blue" },
    { href: "/trainer/workout-plans/new", label: "Create Plan", icon: Dumbbell, color: "purple" },
    { href: "/trainer/exercises/new", label: "Add Exercise", icon: Plus, color: "green" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Trainer Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage your clients and workout plans</p>
        </div>
        <Link href="/trainer/workout-plans/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Workout Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                {loading ? (
                  <div className="h-8 w-12 bg-zinc-100 animate-pulse rounded"></div>
                ) : stats.memberCount}
              </p>
              <p className="text-sm text-zinc-500 mt-1">My Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Dumbbell className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                {loading ? (
                  <div className="h-8 w-12 bg-zinc-100 animate-pulse rounded"></div>
                ) : stats.workoutPlanCount}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Workout Plans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs text-emerald-600 font-medium px-2 py-1 bg-emerald-50 rounded-full">Active</span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-zinc-900">
                {loading ? (
                  <div className="h-8 w-12 bg-zinc-100 animate-pulse rounded"></div>
                ) : stats.activePlanCount}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Active Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/trainer/members">
          <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>
              <p className="mt-4 font-medium text-zinc-900">View Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainer/workout-plans/new">
          <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>
              <p className="mt-4 font-medium text-zinc-900">Create Plan</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/trainer/exercises/new">
          <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>
              <p className="mt-4 font-medium text-zinc-900">Add Exercise</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100">
            <CardTitle className="text-base font-semibold text-zinc-900">Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 h-8">
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-zinc-200 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-200 rounded" />
                        <div className="h-3 w-32 bg-zinc-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todaysSchedule.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSchedule.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                        <Clock className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{session.member}</p>
                        <p className="text-sm text-zinc-500">{session.type} • {session.duration}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{session.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100">
            <CardTitle className="text-base font-semibold text-zinc-900">Recent Members</CardTitle>
            <Link href="/trainer/members">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 h-8">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-200 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-200 rounded" />
                        <div className="h-3 w-32 bg-zinc-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p>No members with active plans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <Link key={member.id} href={`/trainer/members/${member.id}`}>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{member.name}</p>
                          <p className="text-sm text-zinc-500">{member.planName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">{member.lastActive}</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
