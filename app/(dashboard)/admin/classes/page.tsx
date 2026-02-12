"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Calendar, Clock, Users, ChevronRight } from "lucide-react"

interface Class {
  id: number
  name: string
  description: string
  maxCapacity: number
  durationMinutes: number
  color: string
  trainer?: {
    id: number
    userId: string
    name?: string | null
    email?: string | null
  }
  schedules?: {
    id: number
    dayOfWeek: number
    startTime: string
    room: string
  }[]
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/classes")
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) {
          setClasses(data.classes)
        }
      })
      .catch((err) => console.error("Failed to fetch classes:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      await fetch(`/api/admin/classes/${id}`, {
        method: "DELETE",
      })
      setClasses(classes.filter((c) => c.id !== id))
    } catch (err) {
      console.error("Failed to delete class:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground mt-1">Manage gym classes and schedules</p>
        </div>
        <Link href="/admin/classes/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-zinc-200 rounded-full" />
                    <div className="h-5 bg-zinc-200 rounded w-32" />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded w-full" />
                  <div className="h-3 bg-zinc-200 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No classes created yet</p>
            <Link href="/admin/classes/new">
              <Button variant="outline" className="rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create your first class
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      {!loading && classes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <Link key={classItem.id} href={`/admin/classes/${classItem.id}`}>
              <Card className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: classItem.color }}
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">{classItem.name}</h3>
                        {classItem.trainer && (
                          <p className="text-sm text-muted-foreground">
                            {classItem.trainer.name || classItem.trainer.email || classItem.trainer.userId}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {classItem.description || "No description"}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {classItem.durationMinutes} min
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Max {classItem.maxCapacity}
                    </span>
                  </div>

                  {classItem.schedules && classItem.schedules.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Schedule</p>
                      <div className="space-y-1">
                        {classItem.schedules.slice(0, 3).map((schedule) => (
                          <div
                            key={schedule.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-foreground/80">{DAYS[schedule.dayOfWeek]}</span>
                            <span className="text-muted-foreground">
                              {schedule.startTime.slice(0, 5)} • {schedule.room}
                            </span>
                          </div>
                        ))}
                        {classItem.schedules.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{classItem.schedules.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Classes</p>
            <p className="text-2xl font-bold text-foreground">{classes.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Capacity</p>
            <p className="text-2xl font-bold text-foreground">
              {classes.reduce((acc, c) => acc + c.maxCapacity, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Scheduled Classes</p>
            <p className="text-2xl font-bold text-blue-600">
              {classes.filter(c => c.schedules && c.schedules.length > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
