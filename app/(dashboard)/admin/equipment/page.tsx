"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, Wrench, Calendar, ChevronRight, AlertTriangle } from "lucide-react"

interface Equipment {
  id: number
  name: string
  category: string
  purchaseDate: string | null
  warrantyExpiry: string | null
  lastMaintenance: string | null
  nextMaintenance: string | null
  status: string
  qrCode: string | null
}

const CATEGORIES = [
  "Cardio",
  "Strength",
  "Free Weights",
  "Machines",
  "Accessories",
  "Other"
]

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetch("/api/admin/equipment")
      .then((res) => res.json())
      .then((data) => {
        if (data.equipment) {
          setEquipment(data.equipment)
        }
      })
      .catch((err) => console.error("Failed to fetch equipment:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    const matchesStatus = !statusFilter || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getMaintenanceStatus = (item: Equipment) => {
    if (!item.nextMaintenance) return null
    const nextDate = new Date(item.nextMaintenance)
    const today = new Date()
    const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "overdue", text: `${Math.abs(diffDays)} days overdue`, color: "text-red-600 bg-red-50" }
    if (diffDays <= 7) return { status: "due-soon", text: `Due in ${diffDays} days`, color: "text-yellow-600 bg-yellow-50" }
    return null
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipment</h1>
          <p className="text-muted-foreground mt-1">Manage gym equipment and maintenance</p>
        </div>
        <Link href="/admin/equipment/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{equipment.length}</p>
            <p className="text-sm text-muted-foreground">Total Equipment</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">
              {equipment.filter(e => e.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">
              {equipment.filter(e => e.status === "maintenance").length}
            </p>
            <p className="text-sm text-muted-foreground">In Maintenance</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">
              {equipment.filter(e => {
                if (!e.nextMaintenance) return false
                return new Date(e.nextMaintenance) < new Date()
              }).length}
            </p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-zinc-900 focus:ring-zinc-900"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg px-3 py-2 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg px-3 py-2 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-zinc-200 rounded w-32" />
                    <div className="h-5 bg-zinc-200 rounded w-20" />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded w-full" />
                  <div className="h-4 bg-zinc-200 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEquipment.length === 0 && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No equipment found</p>
            <Link href="/admin/equipment/new">
              <Button variant="outline" className="rounded-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add your first equipment
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Equipment Grid */}
      {!loading && filteredEquipment.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => {
            const maintenanceStatus = getMaintenanceStatus(item)

            return (
              <Link key={item.id} href={`/admin/equipment/${item.id}`}>
                <Card className="border-border shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : item.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "broken"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-muted text-zinc-800"
                            }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {maintenanceStatus && (
                      <div className={`flex items-center space-x-2 p-2 rounded-lg mb-4 ${maintenanceStatus.color}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{maintenanceStatus.text}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      {item.purchaseDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Purchased {formatDate(item.purchaseDate)}</span>
                        </div>
                      )}
                      {item.lastMaintenance && (
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4" />
                          <span>Last service {formatDate(item.lastMaintenance)}</span>
                        </div>
                      )}
                      {item.nextMaintenance && !maintenanceStatus && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Next service {formatDate(item.nextMaintenance)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        View details
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
