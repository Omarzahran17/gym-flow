"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, ChevronRight, Mail, Users } from "lucide-react"

interface Trainer {
  id: number
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  specialization?: string
  maxClients: number
  currentClients: number
}

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/trainers")
      .then((res) => res.json())
      .then((data) => {
        if (data.trainers) {
          setTrainers(data.trainers)
        }
      })
      .catch((err) => console.error("Failed to fetch trainers:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.email?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      trainer.userId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Trainers</h1>
          <p className="text-zinc-500 mt-1">Manage gym trainers and their schedules</p>
        </div>
        <Link href="/admin/trainers/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search trainers by name, email, or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-200 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-zinc-200 rounded w-24" />
                      <div className="h-3 bg-zinc-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-3 bg-zinc-200 rounded w-full" />
                  <div className="h-2 bg-zinc-200 rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTrainers.length === 0 ? (
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500 mb-4">No trainers found</p>
            {search && (
              <p className="text-sm text-zinc-400">Try adjusting your search</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrainers.map((trainer) => (
            <Link key={trainer.id} href={`/admin/trainers/${trainer.id}`}>
              <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {trainer.firstName?.[0] || trainer.userId[0]?.toUpperCase()}
                          {trainer.lastName?.[0] || ""}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {trainer.firstName && trainer.lastName
                            ? `${trainer.firstName} ${trainer.lastName}`
                            : trainer.userId}
                        </p>
                        <p className="text-sm text-zinc-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {trainer.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Specialization</span>
                      <span className="font-medium text-zinc-900">
                        {trainer.specialization || "Not specified"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-zinc-500">Clients</span>
                        <span className="font-medium text-zinc-900">
                          {trainer.currentClients} / {trainer.maxClients}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                          style={{
                            width: `${Math.min((trainer.currentClients / trainer.maxClients) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Total Trainers</p>
            <p className="text-2xl font-bold text-zinc-900">{trainers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Total Capacity</p>
            <p className="text-2xl font-bold text-zinc-900">
              {trainers.reduce((acc, t) => acc + t.maxClients, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Available Slots</p>
            <p className="text-2xl font-bold text-blue-600">
              {trainers.reduce((acc, t) => acc + (t.maxClients - t.currentClients), 0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
