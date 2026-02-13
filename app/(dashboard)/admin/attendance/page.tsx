"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clock, Users, UserCheck } from "lucide-react"

type FilterType = "today" | "week" | "month"

interface MemberCheckIn {
  id: number
  memberName: string
  checkInTime: string
  date: string
  method: string
}

interface TrainerCheckIn {
  id: number
  trainerName: string
  checkInTime: string
  checkOutTime: string | null
  date: string
  status: string
}

export default function AdminAttendancePage() {
  const [memberCheckIns, setMemberCheckIns] = useState<MemberCheckIn[]>([])
  const [trainerCheckIns, setTrainerCheckIns] = useState<TrainerCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>("today")

  useEffect(() => {
    fetchAttendance()
  }, [filter])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const [memberRes, trainerRes] = await Promise.all([
        fetch(`/api/admin/attendance?filter=${filter}`),
        fetch(`/api/admin/trainer-attendance?filter=${filter}`),
      ])

      const memberData = await memberRes.json()
      const trainerData = await trainerRes.json()

      if (memberRes.ok) {
        setMemberCheckIns(memberData.attendance || [])
      }
      if (trainerRes.ok) {
        setTrainerCheckIns(trainerData.attendance || [])
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getFilterLabel = () => {
    switch (filter) {
      case "today": return "Today"
      case "week": return "This Week"
      case "month": return "This Month"
      default: return "Today"
    }
  }

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Attendance</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">
            View all member and trainer attendance records
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("today")}
            className={filter === "today" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : ""}
          >
            Today
          </Button>
          <Button
            variant={filter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("week")}
            className={filter === "week" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : ""}
          >
            This Week
          </Button>
          <Button
            variant={filter === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("month")}
            className={filter === "month" ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : ""}
          >
            This Month
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border dark:border-zinc-800 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">{memberCheckIns.length}</p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Member Check-ins {getFilterLabel()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground dark:text-white">
                  {trainerCheckIns.filter(t => t.status === "checked_in").length}
                </p>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Trainers Present {getFilterLabel()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Member Check-ins
          </TabsTrigger>
          <TabsTrigger value="trainers" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Trainer Attendance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="border-border dark:border-zinc-800 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                Member Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : memberCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No member check-ins found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {memberCheckIns.map((checkIn) => (
                    <div 
                      key={checkIn.id} 
                      className="flex items-center justify-between p-4 bg-muted/50 dark:bg-zinc-800 rounded-lg border border-border dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {checkIn.memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground dark:text-white">{checkIn.memberName}</p>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                            {formatDate(checkIn.date)} • {checkIn.method.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          Checked In
                        </Badge>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                          {formatTime(checkIn.checkInTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trainers">
          <Card className="border-border dark:border-zinc-800 bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-foreground dark:text-white">
                Trainer Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : trainerCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No trainer attendance records found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainerCheckIns.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-4 bg-muted/50 dark:bg-zinc-800 rounded-lg border border-border dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {record.trainerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground dark:text-white">{record.trainerName}</p>
                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                            {formatDate(record.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={record.status === "checked_in" 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }>
                          {record.status === "checked_in" ? "Checked In" : "Checked Out"}
                        </Badge>
                        <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-1 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <span className="text-emerald-600">In:</span> {formatTime(record.checkInTime)}
                          </p>
                          {record.checkOutTime && (
                            <p className="flex items-center gap-1">
                              <span className="text-blue-600">Out:</span> {formatTime(record.checkOutTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
