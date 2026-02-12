"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Loader2,
  FileBarChart,
  FilePieChart,
  TrendingDown,
  UserCheck,
  Clock
} from "lucide-react"
import { format } from "date-fns"

interface RevenueData {
  period: { start: string; end: string }
  summary: {
    totalRevenue: number
    totalSubscriptions: number
    newMembers: number
    totalAttendance: number
    avgDailyAttendance: number
  }
  revenueByPlan: Record<string, { count: number; revenue: number }>
}

interface AttendanceData {
  period: { start: string; end: string; months: number }
  summary: {
    totalCheckIns: number
    uniqueMembers: number
    avgDailyAttendance: number
    memberRetention: number
  }
  peakHours: { hour: number; count: number }[]
  dailyStats: { date: string; count: number; uniqueMembers: number }[]
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [activeTab, setActiveTab] = useState("revenue")

  useEffect(() => {
    loadRevenueData("month")
    loadAttendanceData("3")
  }, [])

  const loadRevenueData = async (period: string) => {
    try {
      const response = await fetch(`/api/admin/reports/revenue?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setRevenueData(data)
      }
    } catch (err) {
      console.error("Failed to load revenue data:", err)
    }
  }

  const loadAttendanceData = async (months: string) => {
    try {
      const response = await fetch(`/api/admin/reports/attendance?months=${months}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceData(data)
      }
    } catch (err) {
      console.error("Failed to load attendance data:", err)
    }
  }

  const downloadCSV = async (type: string, period: string) => {
    setLoading(`${type}-csv-${period}`)
    try {
      const response = await fetch(`/api/admin/reports/${type}/export?period=${period}&format=csv`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report-${period}-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      alert(err instanceof Error ? err.message : "Failed to download report")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">Reports & Analytics</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">View business metrics and download reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 p-1">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700">
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700">
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Summary Cards */}
          {revenueData && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        ${revenueData.summary.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Subscriptions</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {revenueData.summary.totalSubscriptions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">New Members</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {revenueData.summary.newMembers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Avg Daily</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {revenueData.summary.avgDailyAttendance}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue by Plan */}
          {revenueData && revenueData.revenueByPlan && Object.keys(revenueData.revenueByPlan).length > 0 && (
            <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground dark:text-white">Revenue by Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(revenueData.revenueByPlan).map(([name, stats]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-foreground dark:text-white">{name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground dark:text-white">${stats.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">{stats.count} subscriptions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Reports */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { period: "month", title: "Monthly Report", icon: Calendar, desc: "Current month revenue & subscriptions" },
              { period: "quarter", title: "Quarterly Report", icon: TrendingUp, desc: "3-month revenue trends" },
              { period: "year", title: "Yearly Report", icon: FileBarChart, desc: "Annual summary & comparisons" },
            ].map((report) => (
              <Card key={report.period} className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <report.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground dark:text-white">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">{report.desc}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border dark:border-zinc-700"
                    onClick={() => downloadCSV("revenue", report.period)}
                    disabled={loading === `revenue-csv-${report.period}`}
                  >
                    {loading === `revenue-csv-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          {/* Summary Cards */}
          {attendanceData && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Check-ins</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {attendanceData.summary.totalCheckIns}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Unique Members</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {attendanceData.summary.uniqueMembers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Retention</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {attendanceData.summary.memberRetention}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">Avg Daily</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">
                        {attendanceData.summary.avgDailyAttendance}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Peak Hours */}
          {attendanceData && attendanceData.peakHours && attendanceData.peakHours.length > 0 && (
            <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground dark:text-white">Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {attendanceData.peakHours.map((ph, i) => (
                    <div key={ph.hour} className="p-3 bg-muted/50 dark:bg-zinc-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-foreground dark:text-white">{ph.hour}:00</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">{ph.count} check-ins</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Rank #{i + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Stats */}
          {attendanceData && attendanceData.dailyStats && attendanceData.dailyStats.length > 0 && (
            <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground dark:text-white">Recent Daily Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {attendanceData.dailyStats.slice(0, 14).reverse().map((day) => (
                    <div key={day.date} className="flex items-center justify-between p-2 hover:bg-muted/50 dark:hover:bg-zinc-800/50 rounded-lg">
                      <span className="text-sm text-foreground dark:text-white">
                        {format(new Date(day.date), "MMM d, yyyy")}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {day.count} check-ins
                        </span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                          {day.uniqueMembers} members
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download Reports */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { period: "3", title: "Last 3 Months", icon: Calendar, desc: "Quarterly attendance" },
              { period: "6", title: "Last 6 Months", icon: FilePieChart, desc: "Half-year trends" },
              { period: "12", title: "Last 12 Months", icon: TrendingUp, desc: "Full year analysis" },
            ].map((report) => (
              <Card key={report.period} className="border-border dark:border-zinc-800 shadow-sm bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <report.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-foreground dark:text-white">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">{report.desc}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border dark:border-zinc-700"
                    onClick={() => downloadCSV("attendance", report.period)}
                    disabled={loading === `attendance-csv-${report.period}`}
                  >
                    {loading === `attendance-csv-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download CSV
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
