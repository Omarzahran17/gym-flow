"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Wrench, Calendar, DollarSign, User } from "lucide-react"
import { format } from "date-fns"

interface MaintenanceRecord {
  id: number
  maintenanceDate: string
  description: string
  cost: number | null
  performedBy: string | null
  createdAt: string
}

interface Equipment {
  id: number
  name: string
  category: string
  status: string
}

export default function EquipmentMaintenancePage() {
  const params = useParams()
  const equipmentId = params.id as string
  
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/equipment/${equipmentId}`).then(r => r.json()),
      fetch(`/api/admin/equipment/maintenance?equipmentId=${equipmentId}`).then(r => r.json()),
    ]).then(([equipData, maintData]) => {
      if (equipData.equipment) setEquipment(equipData.equipment)
      if (maintData.maintenance) setMaintenance(maintData.maintenance)
    }).catch(err => console.error("Failed to load data:", err))
      .finally(() => setLoading(false))
  }, [equipmentId])

  const handleAddMaintenance = async (formData: {
    maintenanceDate: string
    description: string
    cost: string
    performedBy: string
  }) => {
    try {
      const response = await fetch("/api/admin/equipment/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: parseInt(equipmentId),
          ...formData,
        }),
      })

      if (!response.ok) throw new Error("Failed to add maintenance record")
      
      // Refresh data
      const maintRes = await fetch(`/api/admin/equipment/maintenance?equipmentId=${equipmentId}`)
      const maintData = await maintRes.json()
      if (maintData.maintenance) setMaintenance(maintData.maintenance)
      
      setShowAddForm(false)
    } catch (err) {
      console.error("Error adding maintenance:", err)
      alert("Failed to add maintenance record")
    }
  }

  const totalCost = maintenance.reduce((sum, record) => sum + (record.cost || 0), 0)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-500">Loading maintenance records...</p>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-gray-500">Equipment not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/equipment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{equipment.name}</h1>
          <p className="text-gray-600">Maintenance History</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{maintenance.length}</p>
            <p className="text-sm text-gray-500">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Maintenance Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {maintenance[0] 
                ? format(new Date(maintenance[0].maintenanceDate), "MMM d, yyyy")
                : "N/A"}
            </p>
            <p className="text-sm text-gray-500">Last Maintenance</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance Record
        </Button>
      </div>

      {showAddForm && (
        <AddMaintenanceForm 
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddMaintenance}
        />
      )}

      <div className="space-y-4">
        {maintenance.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No maintenance records yet</p>
          </div>
        ) : (
          maintenance.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {format(new Date(record.maintenanceDate), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-gray-700">{record.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {record.performedBy && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{record.performedBy}</span>
                        </div>
                      )}
                      {record.cost && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${record.cost.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function AddMaintenanceForm({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void
  onSubmit: (data: {
    maintenanceDate: string
    description: string
    cost: string
    performedBy: string
  }) => void
}) {
  const [formData, setFormData] = useState({
    maintenanceDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    cost: "",
    performedBy: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Maintenance Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Maintenance Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.maintenanceDate}
              onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the maintenance work performed..."
              className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                placeholder="Technician name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Record
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}