"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Dumbbell, Calendar, ArrowRight, Plus, ChevronRight, Clock, ClipboardList, Activity } from "lucide-react"

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
    { href: "/trainer/members", label: "View Members", icon: Users, color: "blue", gradient: "from-blue-500 to-blue-600" },
    { href: "/trainer/workout-plans/new", label: "Create Plan", icon: ClipboardList, color: "purple", gradient: "from-purple-500 to-purple-600" },
    { href: "/trainer/exercises/new", label: "Add Exercise", icon: Plus, color: "green", gradient: "from-green-500 to-green-600" },
    { href: "/trainer/schedule", label: "My Schedule", icon: Calendar, color: "orange", gradient: "from-orange-500 to-orange-600" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Trainer Dashboard</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Manage your clients and workout plans</p>
        </div>
        <Link href="/trainer/workout-plans/new">
          <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Workout Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Activity className="h-4 w-4 fill-current" />
                <span className="text-xs font-medium">Active</span>
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.memberCount}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">My Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.workoutPlanCount}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Workout Plans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                Active
              </span>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.activePlanCount}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Active Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/20 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <p className="mt-4 font-semibold text-zinc-900 dark:text-white">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your sessions for today</p>
              </div>
              <Link href="/trainer/schedule">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-11 w-11 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todaysSchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">No classes today</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Enjoy your day off!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSchedule.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{session.member}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{session.type} • {session.duration}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 px-3 py-1 rounded-lg">{session.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Members</CardTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Members with active plans</p>
              </div>
              <Link href="/trainer/members">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg">
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">No members yet</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Members will appear here once assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <Link key={member.id} href={`/trainer/members/${member.id}`}>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-sm font-semibold text-white">
                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{member.name}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.planName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">{member.lastActive}</span>
                        <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 group-hover:translate-x-1 transition-all duration-300" />
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


