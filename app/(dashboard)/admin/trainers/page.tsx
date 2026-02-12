"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, ChevronRight, Mail, Users, UserCog, ArrowRightLeft } from "lucide-react"

interface Trainer {
  id: number
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  specialization?: string
  maxClients: number
  bio?: string
  certifications?: string
  hourlyRate?: number
  isActive?: boolean
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchTrainers = () => {
    fetch("/api/admin/trainers")
      .then((res) => res.json())
      .then((data) => {
        if (data.trainers) {
          setTrainers(data.trainers)
        }
      })
      .catch((err) => console.error("Failed to fetch trainers:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTrainers()
  }, [])

  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.email?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.userId.toLowerCase().includes(search.toLowerCase())
  )

  const convertToMember = async (trainerId: number) => {
    if (!confirm("Are you sure you want to convert this trainer to a member? This will remove their trainer privileges.")) return

    try {
      const response = await fetch(`/api/admin/trainers/${trainerId}/convert`, {
        method: "POST",
      })

      if (response.ok) {
        fetchTrainers()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to convert trainer to member")
      }
    } catch (err) {
      alert("Failed to convert trainer to member")
    }
  }

  const toggleTrainerStatus = async (trainerId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/trainers/${trainerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchTrainers()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update trainer status")
      }
    } catch (err) {
      alert("Failed to update trainer status")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Trainers</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Manage gym trainers and their schedules</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainers by name, email, or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTrainers.length === 0 ? (
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">No trainers found</p>
            {search && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Try adjusting your search</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainers.map((trainer) => (
            <Card key={trainer.id} className="border-border dark:border-zinc-800 shadow-sm hover:shadow-md transition-all bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {trainer.firstName?.[0] || trainer.userId[0]?.toUpperCase()}
                        {trainer.lastName?.[0] || ""}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground dark:text-white">
                        {trainer.firstName && trainer.lastName
                          ? `${trainer.firstName} ${trainer.lastName}`
                          : trainer.userId}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {trainer.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trainer.isActive !== false
                        ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                        }`}
                    >
                      {trainer.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">Specialization</span>
                    <span className="font-medium text-foreground dark:text-white">
                      {trainer.specialization || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">Max Clients</span>
                    <span className="font-medium text-foreground dark:text-white">
                      {trainer.maxClients}
                    </span>
                  </div>

                  {trainer.hourlyRate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-muted-foreground">Hourly Rate</span>
                      <span className="font-medium text-foreground dark:text-white">
                        ${trainer.hourlyRate}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTrainerStatus(trainer.id, trainer.isActive !== false)}
                      className={trainer.isActive !== false
                        ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                      }
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      {trainer.isActive !== false ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => convertToMember(trainer.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-1" />
                      Convert
                    </Button>
                  </div>
                  <Link href={`/admin/trainers/${trainer.id}`}>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Trainers</p>
            <p className="text-2xl font-bold text-foreground dark:text-white">{trainers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Client Capacity</p>
            <p className="text-2xl font-bold text-foreground dark:text-white">
              {trainers.reduce((acc, t) => acc + t.maxClients, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Avg Max Clients</p>
            <p className="text-2xl font-bold text-blue-600">
              {trainers.length > 0 ? Math.round(trainers.reduce((acc, t) => acc + t.maxClients, 0) / trainers.length) : 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
