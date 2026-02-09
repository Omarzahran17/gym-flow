"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Wrench, Calendar, Trash2, Settings } from "lucide-react"
import Link from "next/link"

interface EquipmentItem {
  id: number
  name: string
  category?: string
  purchaseDate?: Date
  warrantyExpiry?: Date
  lastMaintenance?: Date
  nextMaintenance?: Date
  status?: string
  qrCode?: string
  maintenance?: Array<{
    id: number
    date: Date
    description: string
    cost: number
    technician?: string
  }>
}

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [equipmentId, setEquipmentId] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params
      setEquipmentId(id)

      try {
        const res = await fetch(`/api/admin/equipment/${id}`)
        const data = await res.json()

        if (data.equipment) {
          setEquipment(data.equipment)
        }
      } catch (err) {
        console.error("Failed to fetch equipment:", err)
        setError("Failed to load equipment data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment || !equipmentId) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/equipment/${equipmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: equipment.name,
          category: equipment.category,
          status: equipment.status,
          purchaseDate: equipment.purchaseDate,
          warrantyExpiry: equipment.warrantyExpiry,
          lastMaintenance: equipment.lastMaintenance,
          nextMaintenance: equipment.nextMaintenance,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update equipment")
      }

      router.push("/admin/equipment")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!equipmentId || !confirm("Are you sure you want to delete this equipment?")) return

    try {
      const response = await fetch(`/api/admin/equipment/${equipmentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete equipment")
      }

      router.push("/admin/equipment")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Equipment not found</p>
        <Link href="/admin/equipment">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Equipment
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/equipment">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Equipment</h1>
          <p className="text-gray-600">Update equipment information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Equipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input
                  id="name"
                  value={equipment.name || ""}
                  onChange={(e) =>
                    setEquipment({ ...equipment, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={equipment.category || ""}
                  onChange={(e) =>
                    setEquipment({ ...equipment, category: e.target.value })
                  }
                  placeholder="e.g., Cardio, Strength, Free Weights"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEquipment({
                        ...equipment,
                        purchaseDate: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEquipment({
                        ...equipment,
                        warrantyExpiry: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                  <Input
                    id="lastMaintenance"
                    type="date"
                    value={equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEquipment({
                        ...equipment,
                        lastMaintenance: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextMaintenance">Next Maintenance</Label>
                  <Input
                    id="nextMaintenance"
                    type="date"
                    value={equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEquipment({
                        ...equipment,
                        nextMaintenance: e.target.value ? new Date(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full p-2 border rounded-md"
                  value={equipment.status || "active"}
                  onChange={(e) =>
                    setEquipment({ ...equipment, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="repair">Under Repair</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/admin/equipment")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={`/admin/equipment/${equipmentId}/maintenance`} className="block">
              <Button variant="outline" className="w-full">
                <Wrench className="h-4 w-4 mr-2" />
                Maintenance History
              </Button>
            </Link>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Category</p>
              <p className="text-sm text-blue-600">{equipment.category || "Uncategorized"}</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">Warranty Status</p>
              <p className="text-sm text-green-600">
                {equipment.warrantyExpiry
                  ? new Date(equipment.warrantyExpiry) > new Date()
                    ? "Active"
                    : "Expired"
                  : "No warranty"}
              </p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Maintenance Due</p>
              <p className="text-sm text-yellow-600">{formatDate(equipment.nextMaintenance)}</p>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Equipment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
