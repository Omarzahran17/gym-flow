"use client"

import { useState } from "react"
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
  FilePieChart
} from "lucide-react"
import { format } from "date-fns"

export default function AdminReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)

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

  const downloadPDF = async (type: string, period: string) => {
    setLoading(`${type}-pdf-${period}`)
    try {
      const response = await fetch(`/api/admin/reports/${type}/export?period=${period}&format=json`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate report")
      }

      const data = await response.json()

      // Generate simple text report as PDF substitute
      let content = ""
      if (type === "revenue") {
        content = generateRevenueReport(data)
      } else {
        content = generateAttendanceReport(data)
      }

      const blob = new Blob([content], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report-${period}-${format(new Date(), "yyyy-MM-dd")}.txt`
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
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">Generate and download business reports</p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 p-1">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
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
                    CSV
                  </Button>
                  <Button
                    className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    onClick={() => downloadPDF("revenue", report.period)}
                    disabled={loading === `revenue-pdf-${report.period}`}
                  >
                    {loading === `revenue-pdf-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Text Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground dark:text-white">Report Includes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[
                  "Total revenue & subscription counts",
                  "Revenue breakdown by plan",
                  "New member acquisitions",
                  "Subscription status distribution",
                  "Daily/weekly trends",
                  "Churn analysis"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-foreground/80 dark:text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
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
                    CSV
                  </Button>
                  <Button
                    className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    onClick={() => downloadPDF("attendance", report.period)}
                    disabled={loading === `attendance-pdf-${report.period}`}
                  >
                    {loading === `attendance-pdf-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Text Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground dark:text-white">Report Includes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {[
                  "Total check-ins & unique members",
                  "Daily breakdown",
                  "Peak days & hours",
                  "Member retention metrics",
                  "Attendance trends",
                  "Class popularity"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm text-foreground/80 dark:text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function generateRevenueReport(data: any): string {
  const period = data.data?.period || {}
  const start = period.start ? format(new Date(period.start), "yyyy-MM-dd") : "N/A"
  const end = period.end ? format(new Date(period.end), "yyyy-MM-dd") : "N/A"

  let report = `
========================================
           REVENUE REPORT
========================================
Period: ${start} to ${end}
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}
========================================

SUMMARY
-------
`

  if (data.data?.summary) {
    report += `Total Revenue: $${(data.data.summary.totalRevenue || 0).toFixed(2)}
Total Subscriptions: ${data.data.summary.totalSubscriptions || 0}
New Members: ${data.data.summary.newMembers || 0}
Total Attendance: ${data.data.summary.totalAttendance || 0}
Average Daily Attendance: ${(data.data.summary.avgDailyAttendance || 0).toFixed(1)}
`
  }

  if (data.data?.revenueByPlan) {
    report += `
REVENUE BY PLAN
---------------
`
    Object.entries(data.data.revenueByPlan).forEach(([name, stats]: [string, any]) => {
      report += `${name}: $${stats.revenue.toFixed(2)} (${stats.count} subscriptions)\n`
    })
  }

  report += `
========================================
            END OF REPORT
========================================
`

  return report
}

function generateAttendanceReport(data: any): string {
  const period = data.data?.period || {}
  const months = period.months || 3
  const start = period.start ? format(new Date(period.start), "yyyy-MM-dd") : "N/A"
  const end = period.end ? format(new Date(period.end), "yyyy-MM-dd") : "N/A"

  let report = `
========================================
         ATTENDANCE REPORT
========================================
Period: Last ${months} months (${start} to ${end})
Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}
========================================

SUMMARY
-------
`

  if (data.data?.summary) {
    report += `Total Check-ins: ${data.data.summary.totalCheckIns || 0}
Unique Members: ${data.data.summary.uniqueMembers || 0}
Member Retention: ${data.data.summary.memberRetention || 0}%
`
  }

  if (data.data?.peakHours && data.data.peakHours.length > 0) {
    report += `
PEAK HOURS
----------
`
    data.data.peakHours.forEach((ph: any) => {
      report += `${ph.hour}:00 - ${ph.count} check-ins\n`
    })
  }

  report += `
========================================
            END OF REPORT
========================================
`

  return report
}
