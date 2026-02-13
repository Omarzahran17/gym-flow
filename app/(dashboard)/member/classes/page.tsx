"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, isToday, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns"
import { Clock, Users, MapPin, Check, X, CalendarDays, ChevronLeft, ChevronRight, Sparkles, CreditCard, AlertCircle } from "lucide-react"

interface ClassSchedule {
  id: number
  dayOfWeek: number
  startTime: string
  room: string
  class: {
    id: number
    name: string
    description: string
    maxCapacity: number
    durationMinutes: number
    color: string
  }
  trainer?: { id: number }
  bookingsCount: number
  availableSpots: number
  isFull: boolean
  isBooked: boolean
}

interface ClassBooking {
  id: number
  scheduleId: number
  bookingDate: string
  status: string
  schedule: ClassSchedule
}

interface SubscriptionStatus {
  hasSubscription: boolean
  isActive: boolean
  plan?: {
    id: number
    name: string
    tier: string
    maxClassesPerWeek: number
    maxCheckInsPerDay: number
    hasTrainerAccess: boolean
    hasPersonalTraining: boolean
    hasProgressTracking: boolean
    hasAchievements: boolean
  }
  usage?: {
    classesThisWeek: number
    checkInsToday: number
  }
  limits?: {
    classesRemaining: number
    canCheckIn: boolean
  }
}

export default function MemberClassesPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [schedule, setSchedule] = useState<ClassSchedule[]>([])
  const [myBookings, setMyBookings] = useState<ClassBooking[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/classes/schedule").then(r => r.json()),
      fetch("/api/member/class-bookings").then(r => r.json()),
      fetch("/api/member/subscription-status").then(r => r.json()),
    ]).then(([scheduleData, bookingsData, subData]) => {
      if (scheduleData.schedule) {
        setSchedule(scheduleData.schedule)
      }
      if (bookingsData.bookings) {
        setMyBookings(bookingsData.bookings)
      }
      setSubscriptionStatus(subData)
    }).catch(err => console.error("Failed to load classes:", err))
      .finally(() => setLoading(false))
  }, [])

  const upcomingBookings = myBookings
    .filter(b => new Date(b.bookingDate) >= new Date())
    .sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())

  const handleBookClass = async (scheduleId: number) => {
    setBookingLoading(scheduleId)
    try {
      const response = await fetch("/api/member/class-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId,
          bookingDate: format(selectedDate, "yyyy-MM-dd"),
        }),
      })

      if (response.ok) {
        const bookingsRes = await fetch("/api/member/class-bookings")
        const bookingsData = await bookingsRes.json()
        if (bookingsData.bookings) {
          setMyBookings(bookingsData.bookings)
        }
        
        const scheduleRes = await fetch("/api/classes/schedule")
        const scheduleData = await scheduleRes.json()
        if (scheduleData.schedule) {
          setSchedule(scheduleData.schedule)
        }
        
        const subRes = await fetch("/api/member/subscription-status")
        const subData = await subRes.json()
        setSubscriptionStatus(subData)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to book class")
      }
    } catch (err) {
      console.error("Booking error:", err)
      alert("Failed to book class")
    } finally {
      setBookingLoading(null)
    }
  }

  const handleCancelBooking = async (bookingId: number, scheduleId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    try {
      const response = await fetch(`/api/member/class-bookings?id=${bookingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMyBookings(myBookings.filter(b => b.id !== bookingId))
        
        setSchedule(schedule.map(s => 
          s.id === scheduleId 
            ? { ...s, isBooked: false, bookingsCount: Math.max(0, s.bookingsCount - 1), availableSpots: s.availableSpots + 1 }
            : s
        ))
        
        const subRes = await fetch("/api/member/subscription-status")
        const subData = await subRes.json()
        setSubscriptionStatus(subData)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to cancel booking")
      }
    } catch (err) {
      console.error("Cancel error:", err)
      alert("Failed to cancel booking")
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today"
    return format(date, "EEEE, MMMM d")
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding days for the start of the month
    const startDayOfWeek = getDay(start)
    const paddingDays = Array(startDayOfWeek).fill(null)
    
    return [...paddingDays, ...days]
  }

  // Get classes for a specific date
  const getClassesForDate = (date: Date) => {
    const dayOfWeek = date.getDay()
    return schedule.filter(s => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const classesForSelectedDay = getClassesForDate(selectedDate)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="h-12 w-12 rounded-full border-4 border-border"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Class Schedule</h1>
        <p className="text-muted-foreground mt-1">Book classes and manage your gym schedule</p>
      </div>

      {!subscriptionStatus?.hasSubscription && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Subscription Required</p>
                  <p className="text-sm text-amber-700">You need an active subscription to book classes</p>
                </div>
              </div>
              <Link href="/member/subscription">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {subscriptionStatus?.hasSubscription && subscriptionStatus?.plan && (
        <Card className="border-border shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{subscriptionStatus.plan.name} Plan</p>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionStatus.usage?.classesThisWeek || 0} of {subscriptionStatus.plan.maxClassesPerWeek === 999 ? "∞" : subscriptionStatus.plan.maxClassesPerWeek} classes used this week
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {subscriptionStatus.limits && subscriptionStatus.plan.maxClassesPerWeek !== 999 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{subscriptionStatus.limits.classesRemaining}</p>
                    <p className="text-xs text-muted-foreground">classes remaining</p>
                  </div>
                )}
                {subscriptionStatus.limits && subscriptionStatus.plan.maxClassesPerWeek === 999 && (
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">Unlimited Classes</Badge>
                )}
              </div>
            </div>
            {subscriptionStatus.plan.maxClassesPerWeek !== 999 && (
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (subscriptionStatus.usage?.classesThisWeek || 0) >= subscriptionStatus.plan.maxClassesPerWeek ? "bg-red-500" :
                      (subscriptionStatus.usage?.classesThisWeek || 0) >= subscriptionStatus.plan.maxClassesPerWeek * 0.8 ? "bg-amber-500" : 
                      "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(((subscriptionStatus.usage?.classesThisWeek || 0) / subscriptionStatus.plan.maxClassesPerWeek) * 100, 100)}%` }}
                  />
                </div>
                {subscriptionStatus.limits?.classesRemaining === 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    You&apos;ve reached your weekly limit. <Link href="/member/subscription" className="underline font-medium">Upgrade your plan</Link> for more classes.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          {/* Full Month Calendar */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-foreground/80" />
                  {format(currentMonth, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={() => setCurrentMonth(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {generateCalendarDays().map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-24 border border-border/50 bg-muted/20" />
                  }
                  
                  const classesForDay = getClassesForDate(day)
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isTodayDate = isToday(day)
                  
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`h-24 border border-border/50 p-1 cursor-pointer transition-all hover:bg-muted/50 ${
                        isSelected ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 bg-zinc-50 dark:bg-zinc-800' : ''
                      } ${!isCurrentMonth ? 'opacity-50' : ''} ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                        {format(day, "d")}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {classesForDay.slice(0, 3).map((cls, idx) => (
                          <div
                            key={idx}
                            className="text-[10px] truncate px-1 py-0.5 rounded text-white"
                            style={{ backgroundColor: cls.class.color }}
                          >
                            {cls.startTime.slice(0, 5)} {cls.class.name}
                          </div>
                        ))}
                        {classesForDay.length > 3 && (
                          <div className="text-[10px] text-muted-foreground text-center">
                            +{classesForDay.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground">My Upcoming Classes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                    <CalendarDays className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No upcoming classes</p>
                  <p className="text-muted-foreground text-xs mt-1">Book a class to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-border transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2 h-10 rounded-full"
                          style={{ backgroundColor: booking.schedule.class.color }}
                        />
                        <div>
                          <p className="font-medium text-foreground text-sm">{booking.schedule.class.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.bookingDate), "MMM d")} at {booking.schedule.startTime.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelBooking(booking.id, booking.scheduleId)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {upcomingBookings.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{upcomingBookings.length - 5} more bookings
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {getDateLabel(selectedDate)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {classesForSelectedDay.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No classes scheduled</p>
                  <p className="text-muted-foreground text-sm mt-1">Try selecting a different date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classesForSelectedDay.map((classSchedule) => {
                    const startMinutes = parseInt(classSchedule.startTime.split(":")[0]) * 60 + 
                                      parseInt(classSchedule.startTime.split(":")[1])
                    const endMinutes = startMinutes + classSchedule.class.durationMinutes
                    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`
                    const capacityPercent = (classSchedule.bookingsCount / classSchedule.class.maxCapacity) * 100
                    
                    return (
                      <div
                        key={classSchedule.id}
                        className={`group border border-border rounded-xl overflow-hidden hover:shadow-md transition-all ${
                          classSchedule.isBooked ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                        }`}
                      >
                        <div className="flex">
                          <div 
                            className="w-2 flex-shrink-0"
                            style={{ backgroundColor: classSchedule.class.color }}
                          />
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">{classSchedule.class.name}</h3>
                                  {classSchedule.isBooked && (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                      <Check className="h-3 w-3 mr-1" />
                                      Booked
                                    </Badge>
                                  )}
                                </div>
                                {classSchedule.class.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{classSchedule.class.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{classSchedule.startTime.slice(0, 5)} - {endTime}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{classSchedule.room}</span>
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground/80">
                                    {classSchedule.bookingsCount}/{classSchedule.class.maxCapacity}
                                  </span>
                                </div>
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      capacityPercent >= 100 ? "bg-red-500" : 
                                      capacityPercent >= 80 ? "bg-amber-500" : 
                                      "bg-emerald-500"
                                    }`}
                                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                  />
                                </div>
                                {classSchedule.isFull && !classSchedule.isBooked && (
                                  <span className="text-xs text-red-500 font-medium">Full</span>
                                )}
                              </div>

                              {classSchedule.isBooked ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const booking = myBookings.find(
                                      b => b.scheduleId === classSchedule.id && 
                                      format(new Date(b.bookingDate), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                                    )
                                    if (booking) {
                                      handleCancelBooking(booking.id, classSchedule.id)
                                    }
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                  <X className="h-4 w-4 mr-1.5" />
                                  Cancel
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleBookClass(classSchedule.id)}
                                  disabled={
                                    classSchedule.isFull || 
                                    bookingLoading === classSchedule.id ||
                                    !subscriptionStatus?.hasSubscription ||
                                    (subscriptionStatus?.limits?.classesRemaining === 0 && subscriptionStatus?.plan?.maxClassesPerWeek !== 999)
                                  }
                                  className="bg-zinc-900 hover:bg-zinc-800 text-white disabled:bg-zinc-300"
                                >
                                  {bookingLoading === classSchedule.id ? (
                                    <>
                                      <div className="h-4 w-4 mr-1.5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                      Booking...
                                    </>
                                  ) : !subscriptionStatus?.hasSubscription ? (
                                    "Subscribe to Book"
                                  ) : subscriptionStatus?.limits?.classesRemaining === 0 && subscriptionStatus?.plan?.maxClassesPerWeek !== 999 ? (
                                    "Limit Reached"
                                  ) : classSchedule.isFull ? (
                                    "Class Full"
                                  ) : (
                                    <>
                                      <Sparkles className="h-4 w-4 mr-1.5" />
                                      Book Class
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Almost Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Full</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
