"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Loader2, LogIn } from "lucide-react"

interface MemberAttendance {
  id: number
  checkInTime: string
  date: string
}

export default function MemberCheckInPage() {
  const [loading, setLoading] = useState(false)
  const [todayStatus, setTodayStatus] = useState<string>("not_checked_in")
  const [recentRecords, setRecentRecords] = useState<MemberAttendance[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchMemberAttendance()
  }, [])

  const fetchMemberAttendance = async () => {
    try {
      const response = await fetch("/api/member-attendance")
      const data = await response.json()
      
      if (response.ok) {
        setTodayStatus(data.todayStatus || "not_checked_in")
        setRecentRecords(data.recentRecords || [])
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/member-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-in" }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
        })
        fetchMemberAttendance()
      } else {
        setResult({
          success: false,
          message: data.error || "Check-in failed",
        })
      }
    } catch (err) {
      setResult({
        success: false,
        message: "Failed to process request",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">Checked In</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Checked In</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Check-In</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">Check in to the gym</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardHeader className="pb-4 border-b border-border dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today&apos;s Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                todayStatus === "checked_in" 
                  ? "bg-emerald-100 dark:bg-emerald-900/30" 
                  : "bg-muted dark:bg-zinc-800"
              }`}>
                {loading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                ) : todayStatus === "checked_in" ? (
                  <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              <div className="mb-6">
                <p className="text-2xl font-bold text-foreground dark:text-white mb-2">
                  {new Date().toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
                {getStatusBadge(todayStatus)}
              </div>

              {result && (
                <div className={`mb-6 p-4 rounded-xl border ${
                  result.success 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" 
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                  <p className={`font-semibold ${
                    result.success ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
                  }`}>
                    {result.message}
                  </p>
                </div>
              )}

              {todayStatus !== "checked_in" && (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                  Check In Now
                </Button>
              )}
              {todayStatus === "checked_in" && (
                <p className="text-muted-foreground dark:text-muted-foreground">
                  You have checked in for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardHeader className="pb-4 border-b border-border dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground dark:text-muted-foreground">No check-ins yet</p>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">
                  Check in to start tracking your attendance
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 dark:bg-zinc-800 rounded-lg border border-border dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground dark:text-white">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {record.checkInTime && new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      Checked In
                    </Badge>
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
