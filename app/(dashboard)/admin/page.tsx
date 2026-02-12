"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, CreditCard, Calendar, TrendingUp, ArrowRight, ChevronRight, Activity, DollarSign, UserPlus } from "lucide-react"

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

const statCards = [
  { key: "totalMembers", label: "Total Members", icon: UserPlus, color: "blue", gradient: "from-blue-500 to-blue-600" },
  { key: "activeMembers", label: "Active Members", icon: Activity, color: "green", gradient: "from-green-500 to-green-600" },
  { key: "totalTrainers", label: "Trainers", icon: Users, color: "purple", gradient: "from-purple-500 to-purple-600" },
  { key: "attendance", label: "Today's Attendance", icon: Calendar, color: "orange", gradient: "from-orange-500 to-orange-600" },
  { key: "revenue", label: "Monthly Revenue", icon: DollarSign, color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
]

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
    { href: "/admin/classes/new", label: "Schedule Class", icon: Calendar, color: "green", gradient: "from-green-500 to-green-600" },
    { href: "/admin/subscriptions", label: "Manage Plans", icon: CreditCard, color: "orange", gradient: "from-orange-500 to-orange-600" },
    { href: "/admin/members", label: "Add Member", icon: UserPlus, color: "blue", gradient: "from-blue-500 to-blue-600" },
    { href: "/admin/reports", label: "View Reports", icon: TrendingUp, color: "purple", gradient: "from-purple-500 to-purple-600" },
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

  const getStatValue = (key: string) => {
    switch (key) {
      case "totalMembers": return stats.totalMembers.toLocaleString()
      case "activeMembers": return stats.activeMembers.toLocaleString()
      case "totalTrainers": return stats.totalTrainers.toString()
      case "attendance": return stats.todayAttendance.toString()
      case "revenue": return `$${stats.monthlyRevenue.toLocaleString()}`
      default: return "0"
    }
  }

  const getStatTrend = (key: string) => {
    switch (key) {
      case "totalMembers": return "+12%"
      case "activeMembers": return "Active"
      case "revenue": return "+8%"
      default: return null
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">Overview of your gym operations</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/members">
            <Button variant="outline" className="rounded-lg">
              <Users className="h-4 w-4 mr-2" />
              Manage Members
            </Button>
          </Link>
          <Link href="/admin/classes/new">
            <Button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Class
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.key} className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                {getStatTrend(stat.key) && (
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    {getStatTrend(stat.key)}
                  </span>
                )}
              </div>
              <div className="mt-4">
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">{getStatValue(stat.key)}</p>
                )}
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
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
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Members</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Latest member registrations</p>
            </div>
            <Link href="/admin/members">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
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
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Members will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between py-3 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index !== recentMembers.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-semibold text-white">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400 dark:text-zinc-500">{formatDate(member.joinDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Scheduled sessions for today</p>
            </div>
            <Link href="/admin/classes">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">No classes today</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Schedule a class to get started</p>
                <Link href="/admin/classes/new">
                  <Button variant="outline" size="sm" className="mt-4 rounded-lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Class
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {todayClasses.map((cls, index) => (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between py-3 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index !== todayClasses.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${cls.color}20` }}
                      >
                        <Calendar className="h-5 w-5" style={{ color: cls.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{cls.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">with {cls.trainerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{cls.time}</span>
                    </div>
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


