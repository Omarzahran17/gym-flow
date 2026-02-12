"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Calendar, TrendingUp, ArrowRight, ChevronRight } from "lucide-react"

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalTrainers: number
  todayAttendance: number
  monthlyRevenue: number
}

interface RecentMember {
  id: number
  name: string
  email: string
  joinDate: string
}

interface TodayClass {
  id: number
  name: string
  time: string
  trainerName: string
  color: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalTrainers: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
  })
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([])
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dashboardRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/admin/dashboard"),
        ])

        const statsData = await statsRes.json()
        const dashboardData = await dashboardRes.json()

        if (statsData.stats) {
          setStats(statsData.stats)
        }
        if (dashboardData.recentMembers) {
          setRecentMembers(dashboardData.recentMembers)
        }
        if (dashboardData.todayClasses) {
          setTodayClasses(dashboardData.todayClasses)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickActions = [
    { href: "/admin/classes/new", label: "Schedule Class", icon: Calendar, color: "bg-green-500" },
    { href: "/admin/subscriptions", label: "Manage Plans", icon: CreditCard, color: "bg-orange-500" },
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-zinc-500 dark:text-zinc-400">Overview of your gym operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.totalMembers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.activeMembers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Active Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.totalTrainers}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Trainers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? "..." : stats.todayAttendance}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Today&apos;s Attendance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">+8%</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading ? "..." : `$${stats.monthlyRevenue.toLocaleString()}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${action.color} bg-opacity-10 rounded-lg`}>
                    <action.icon className={`h-5 w-5 ${action.color.replace("bg-", "text-")}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-4 font-medium">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Members</CardTitle>
            <Link href="/admin/members">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No members yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(member.joinDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Today&apos;s Classes</CardTitle>
            <Link href="/admin/classes">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cls.color}20` }}
                      >
                        <Calendar className="h-5 w-5" style={{ color: cls.color }} />
                      </div>
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">with {cls.trainerName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{cls.time}</span>
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
