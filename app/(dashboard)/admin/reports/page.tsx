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
    setLoading(type)
    try {
      const response = await fetch(`/api/admin/reports/${type}/export?period=${period}&format=csv`)
      if (!response.ok) throw new Error("Failed to generate report")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      alert("Failed to download report")
    } finally {
      setLoading(null)
    }
  }

  const downloadPDF = async (type: string, period: string) => {
    setLoading(`${type}-pdf`)
    try {
      const response = await fetch(`/api/admin/reports/${type}/export?period=${period}&format=pdf`)
      if (!response.ok) throw new Error("Failed to generate report")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      alert("Failed to download report")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Reports & Analytics</h1>
        <p className="text-zinc-500 mt-1">Generate and download business reports</p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-zinc-100 border border-zinc-200 p-1">
          <TabsTrigger 
            value="revenue" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger 
            value="attendance"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm" 
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
              <Card key={report.period} className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <report.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{report.title}</CardTitle>
                      <p className="text-sm text-zinc-500">{report.desc}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => downloadCSV("revenue", report.period)}
                    disabled={loading === `revenue-${report.period}`}
                  >
                    {loading === `revenue-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    CSV
                  </Button>
                  <Button 
                    className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 text-white"
                    onClick={() => downloadPDF("revenue", report.period)}
                    disabled={loading === `revenue-${report.period}-pdf`}
                  >
                    {loading === `revenue-${report.period}-pdf` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    PDF Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Report Includes</CardTitle>
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
                  <div key={i} className="flex items-center space-x-2 text-sm text-zinc-600">
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
              { period: "3", title: "3 Months", icon: Calendar, desc: "Quarterly attendance" },
              { period: "6", title: "6 Months", icon: FilePieChart, desc: "Half-year trends" },
              { period: "12", title: "12 Months", icon: TrendingUp, desc: "Full year analysis" },
            ].map((report) => (
              <Card key={report.period} className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <report.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Last {report.title}</CardTitle>
                      <p className="text-sm text-zinc-500">{report.desc}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => downloadCSV("attendance", report.period)}
                    disabled={loading === `attendance-${report.period}`}
                  >
                    {loading === `attendance-${report.period}` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    CSV
                  </Button>
                  <Button 
                    className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 text-white"
                    onClick={() => downloadPDF("attendance", report.period)}
                    disabled={loading === `attendance-${report.period}-pdf`}
                  >
                    {loading === `attendance-${report.period}-pdf` ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    PDF Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Report Includes</CardTitle>
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
                  <div key={i} className="flex items-center space-x-2 text-sm text-zinc-600">
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
