"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dumbbell, Calendar, TrendingUp, CreditCard, ArrowRight, Play, CalendarCheck, Target, Flame, QrCode, MessageCircle } from "lucide-react"
import { CheckInQRCode } from "@/components/member/CheckInQRCode"
import { authClient } from "@/lib/auth-client"

interface MemberStats {
  workoutsThisWeek: number
  classesBooked: number
  goalCompletion: number
  activeSubscription: boolean
}

interface UpcomingClass {
  id: number
  name: string
  time: string
  day: string
  trainer: string
  room: string
}

export default function MemberDashboardPage() {
  const [stats, setStats] = useState<MemberStats>({
    workoutsThisWeek: 0,
    classesBooked: 0,
    goalCompletion: 0,
    activeSubscription: false,
  })
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [qrCode, setQrCode] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) {
        setUserName(data.user.name)
      }
    })

    Promise.all([
      fetch("/api/member/workout-plan").then(res => res.json()),
      fetch("/api/member/class-bookings").then(res => res.json()),
      fetch("/api/member/dashboard").then(res => res.json()),
    ])
      .then(([workoutData, classData, dashboardData]) => {
        setStats({
          workoutsThisWeek: dashboardData.stats?.workoutsThisWeek || 0,
          classesBooked: classData.bookings?.length || 0,
          goalCompletion: dashboardData.goalCompletion || 0,
          activeSubscription: dashboardData.stats?.activeSubscription || false,
        })
        if (dashboardData.upcomingClasses) {
          setUpcomingClasses(dashboardData.upcomingClasses)
        }
        if (dashboardData.qrCode) {
          setQrCode(dashboardData.qrCode)
        }
      })
      .catch(err => console.error("Failed to fetch stats:", err))
      .finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { href: "/member/workout-plan", label: "View Workout", icon: Dumbbell, color: "blue", gradient: "from-blue-500 to-blue-600" },
    { href: "/member/chat", label: "AI Coach", icon: MessageCircle, color: "purple", gradient: "from-purple-500 to-purple-600" },
    { href: "/member/classes", label: "Book Class", icon: Calendar, color: "green", gradient: "from-green-500 to-green-600" },
    { href: "/member/progress", label: "Track Progress", icon: TrendingUp, color: "orange", gradient: "from-orange-500 to-orange-600" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back!</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Here's your fitness overview for today</p>
        </div>
        <div className="flex items-center gap-3">
          {qrCode && (
            <CheckInQRCode qrCode={qrCode} memberName={userName || "Member"} />
          )}
          <Link href="/member/workout-plan">
            <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Play className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Dumbbell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-4 w-4 fill-current" />
                <span className="text-xs font-medium">This week</span>
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.workoutsThisWeek}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Workouts Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.classesBooked}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Classes Booked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                {loading ? "..." : stats.goalCompletion >= 70 ? "On track" : stats.goalCompletion >= 40 ? "Halfway" : "Just started"}
              </span>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.goalCompletion}%</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Goal Completion</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-5" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.activeSubscription ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                {loading ? "..." : stats.activeSubscription ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.activeSubscription ? "Premium" : "Free"}</p>
              )}
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stats.activeSubscription ? "Subscription active" : "No subscription"}</p>
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your upcoming classes</p>
              </div>
              <Link href="/member/classes">
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg">
                  View all
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
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">No upcoming classes</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Book a class to start your fitness journey</p>
                <Link href="/member/classes">
                  <Button variant="outline" size="sm" className="mt-4 rounded-lg">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Book a Class
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingClasses.slice(0, 4).map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{cls.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{cls.trainer} • {cls.room}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-700 px-3 py-1 rounded-lg">{cls.time}</span>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{cls.day}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold">Quick Workout</CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Ready to train?</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Dumbbell className="h-12 w-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-white dark:border-zinc-900 animate-pulse opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Ready to train?</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">Start your daily workout routine and crush your fitness goals</p>
              <Link href="/member/workout-plan">
                <Button size="lg" className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Play className="h-5 w-5 mr-2" />
                  Start Workout
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
