"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Calendar, Clock, MapPin, Mail, Phone, User, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

interface BookingMember {
  id: number
  memberId: number
  memberName: string
  memberEmail: string
  status: string
}

interface ClassDetail {
  id: number
  className: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
  maxCapacity: number
  bookedCount: number
  color: string
  bookings: BookingMember[]
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export default function TrainerClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classData, setClassData] = useState<ClassDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch("/api/trainer/schedule")
        if (!response.ok) {
          throw new Error("Failed to fetch schedule")
        }
        const data = await response.json()
        const schedule = data.schedule || []
        const classId = parseInt(params.id as string)
        const classDetail = schedule.find((s: ClassDetail) => s.id === classId)

        if (classDetail) {
          setClassData(classDetail)
        } else {
          setError("Class not found")
        }
      } catch (err) {
        console.error("Failed to fetch class data:", err)
        setError("Failed to load class data")
      } finally {
        setLoading(false)
      }
    }

    fetchClassData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-border"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/trainer/schedule">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Class Not Found</h1>
            <p className="text-muted-foreground mt-1">{error || "The requested class could not be found"}</p>
          </div>
        </div>
        <Link href="/trainer/schedule">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schedule
          </Button>
        </Link>
      </div>
    )
  }

  const dayInfo = DAYS.find(d => d.value === classData.dayOfWeek)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trainer/schedule">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-2 rounded-full"
            style={{ backgroundColor: classData.color }}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{classData.className}</h1>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Every {dayInfo?.label}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {classData.startTime.slice(0, 5)} - {classData.endTime.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {classData.room}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant={classData.bookedCount >= classData.maxCapacity ? "secondary" : "default"}>
                {classData.bookedCount >= classData.maxCapacity ? "Full" : "Available"}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-foreground">{classData.bookedCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Booked / {classData.maxCapacity} capacity</p>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((classData.bookedCount / classData.maxCapacity) * 100, 100)}%`,
                  backgroundColor: classData.color
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Booked Members ({classData.bookings.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {classData.bookings.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
              <p className="text-muted-foreground">No members booked for this class</p>
              <p className="text-sm text-muted-foreground mt-1">Members will appear here once they book this class</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classData.bookings.map((booking) => (
                <Link key={booking.id} href={`/trainer/members/${booking.memberId}`}>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{booking.memberName}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {booking.memberEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                      >
                        {booking.status === "confirmed" ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Pending</>
                        )}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
