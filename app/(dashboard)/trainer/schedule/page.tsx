"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Users } from "lucide-react"

interface ScheduleItem {
  id: number
  classId: number
  className: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room: string
  maxCapacity: number
  bookedCount: number
  color: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 6
  return `${hour.toString().padStart(2, '0')}:00`
})

export default function TrainerSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek
    return new Date(today.setDate(diff))
  })

  useEffect(() => {
    fetch("/api/trainer/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data.schedule) {
          setSchedule(data.schedule)
        }
      })
      .catch((err) => console.error("Failed to fetch schedule:", err))
      .finally(() => setLoading(false))
  }, [])

  const getWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = today.getDate() - dayOfWeek
    setCurrentWeekStart(new Date(today.setDate(diff)))
  }

  const getClassesForDayAndTime = (dayOfWeek: number, time: string) => {
    return schedule.filter((item) => {
      if (item.dayOfWeek !== dayOfWeek) return false
      const classHour = parseInt(item.startTime.split(":")[0])
      const slotHour = parseInt(time.split(":")[0])
      return classHour === slotHour
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Schedule</h1>
          <p className="text-zinc-500 mt-1">View and manage your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={previousWeek}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-lg font-semibold text-zinc-900">
              {weekDates[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} - {" "}
              {weekDates[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextWeek}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="relative inline-block">
                <div className="h-10 w-10 rounded-full border-4 border-zinc-200"></div>
                <div className="absolute top-0 left-0 h-10 w-10 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-zinc-500 mt-4">Loading schedule...</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
              <p className="text-zinc-500 mb-2">No classes scheduled</p>
              <p className="text-sm text-zinc-400">Your scheduled classes will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 border-b border-zinc-100">
                  <div className="p-3 text-sm font-medium text-zinc-500 border-r border-zinc-100">Time</div>
                  {weekDates.map((date, i) => (
                    <div
                      key={i}
                      className={`p-3 text-center border-r border-zinc-100 last:border-r-0 ${
                        isToday(date) ? "bg-blue-50" : ""
                      }`}
                    >
                      <p className={`text-sm font-medium ${isToday(date) ? "text-blue-600" : "text-zinc-500"}`}>
                        {DAYS[i].slice(0, 3)}
                      </p>
                      <p className={`text-lg font-semibold ${isToday(date) ? "text-blue-600" : "text-zinc-900"}`}>
                        {date.getDate()}
                      </p>
                    </div>
                  ))}
                </div>

                {TIME_SLOTS.map((time) => (
                  <div key={time} className="grid grid-cols-8 border-b border-zinc-100 last:border-b-0">
                    <div className="p-3 text-sm text-zinc-500 border-r border-zinc-100 bg-zinc-50">
                      {time}
                    </div>
                    {DAYS.map((_, dayIndex) => {
                      const classes = getClassesForDayAndTime(dayIndex, time)
                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 min-h-[80px] border-r border-zinc-100 last:border-r-0 ${
                            isToday(weekDates[dayIndex]) ? "bg-blue-50/50" : ""
                          }`}
                        >
                          {classes.map((cls) => (
                            <Link
                              key={cls.id}
                              href={`/admin/classes/${cls.classId}`}
                              className="block p-2 rounded-lg mb-1 last:mb-0 hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: `${cls.color}20`, borderLeft: `3px solid ${cls.color}` }}
                            >
                              <p className="text-sm font-medium text-zinc-900 truncate">{cls.className}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                <Clock className="h-3 w-3" />
                                <span>{cls.startTime.slice(0, 5)} - {cls.endTime?.slice(0, 5) || "?"}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                <MapPin className="h-3 w-3" />
                                <span>{cls.room}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                <Users className="h-3 w-3" />
                                <span>{cls.bookedCount}/{cls.maxCapacity}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-7">
        {DAYS.map((day, i) => {
          const dayClasses = schedule.filter((s) => s.dayOfWeek === i)
          return (
            <Card key={i} className="border-zinc-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-900">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {dayClasses.length === 0 ? (
                  <p className="text-sm text-zinc-400">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {dayClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${cls.color}15` }}
                      >
                        <p className="text-sm font-medium text-zinc-900">{cls.className}</p>
                        <p className="text-xs text-zinc-500">{cls.startTime.slice(0, 5)} • {cls.room}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
