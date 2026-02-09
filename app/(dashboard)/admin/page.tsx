"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Calendar, TrendingUp, ArrowRight, Plus, ChevronRight } from "lucide-react"

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
    { href: "/admin/members", label: "Add Member", icon: Plus, color: "bg-blue-500" },
    { href: "/admin/trainers", label: "Add Trainer", icon: Users, color: "bg-purple-500" },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Overview of your gym operations</p>
        </div>
        <Link href="/admin/members">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.totalMembers.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.activeMembers.toLocaleString()}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Active Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.totalTrainers}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Trainers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : stats.todayAttendance}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Today&apos;s Attendance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">+8%</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {loading ? "..." : `$${stats.monthlyRevenue.toLocaleString()}`}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href}>
            <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${action.color} bg-opacity-10 rounded-lg`}>
                    <action.icon className={`h-5 w-5 ${action.color.replace("bg-", "text-")}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </div>
                <p className="mt-4 font-medium text-zinc-900">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-zinc-900">Recent Members</CardTitle>
            <Link href="/admin/members">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                        <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMembers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p>No members yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{member.name}</p>
                        <p className="text-sm text-zinc-500">{member.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-zinc-400">{formatDate(member.joinDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-zinc-900">Today&apos;s Classes</CardTitle>
            <Link href="/admin/classes">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-zinc-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p>No classes scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cls.color}20` }}
                      >
                        <Calendar className="h-5 w-5" style={{ color: cls.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{cls.name}</p>
                        <p className="text-sm text-zinc-500">with {cls.trainerName}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{cls.time}</span>
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
