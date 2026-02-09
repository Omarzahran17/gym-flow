"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Calendar, TrendingUp, CreditCard, ArrowRight, Play, CalendarCheck } from "lucide-react"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      })
      .catch(err => console.error("Failed to fetch stats:", err))
      .finally(() => setLoading(false))
  }, [])

  const quickActions = [
    { href: "/member/workout-plan", label: "View Workout", icon: Dumbbell, color: "blue" },
    { href: "/member/classes", label: "Book Class", icon: Calendar, color: "purple" },
    { href: "/member/progress", label: "Track Progress", icon: TrendingUp, color: "green" },
    { href: "/member/subscription", label: "Manage Plan", icon: CreditCard, color: "orange" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Welcome back!</h1>
        <p className="text-zinc-500 mt-1">Here's your fitness overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Dumbbell className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.workoutsThisWeek}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Workouts This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.classesBooked}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Classes Booked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">On track</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : `${stats.goalCompletion}%`}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Goal Completion</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${stats.activeSubscription ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"}`}>
                {stats.activeSubscription ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : (stats.activeSubscription ? "Premium" : "Free")}
              </p>
              <p className="text-sm text-zinc-500 mt-1">{stats.activeSubscription ? "Subscription active" : "No subscription"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-${action.color}-50`}>
                    <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                </div>
                <p className="mt-4 font-medium text-zinc-900">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-zinc-900">Today's Schedule</CardTitle>
            <Link href="/member/classes">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-200 rounded" />
                        <div className="h-3 w-32 bg-zinc-200 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
                <p className="text-zinc-500">No upcoming classes this week</p>
                <Link href="/member/classes">
                  <Button variant="outline" className="mt-4">
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Book a Class
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-zinc-200">
                        <Calendar className="h-5 w-5 text-zinc-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{cls.name}</p>
                        <p className="text-sm text-zinc-500">{cls.trainer} • {cls.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-sm font-medium text-zinc-900">{cls.time}</span>
                        <p className="text-xs text-zinc-500">{cls.day}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Workout */}
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900">Quick Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Dumbbell className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Ready to train?</h3>
              <p className="text-zinc-500 mb-6">Start your daily workout routine</p>
              <Link href="/member/workout-plan">
                <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
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
