"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"

const CATEGORIES = [
  "Cardio",
  "Strength",
  "Free Weights",
  "Machines",
  "Accessories",
  "Other"
]

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "In Maintenance" },
  { value: "broken", label: "Broken" },
  { value: "retired", label: "Retired" },
]

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchaseDate: "",
    warrantyExpiry: "",
    nextMaintenance: "",
    status: "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create equipment")
      }

      router.push("/admin/equipment")
    } catch (err) {
      console.error("Error creating equipment:", err)
      alert("Failed to create equipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/equipment">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Equipment</h1>
          <p className="text-muted-foreground mt-1">Add a new piece of gym equipment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Treadmill T-1000"
                className="border-border focus:border-zinc-900 focus:ring-zinc-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:border-zinc-900 focus:ring-zinc-900"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-sm font-medium text-foreground">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="border-border focus:border-zinc-900 focus:ring-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyExpiry" className="text-sm font-medium text-foreground">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  className="border-border focus:border-zinc-900 focus:ring-zinc-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextMaintenance" className="text-sm font-medium text-foreground">Next Scheduled Maintenance</Label>
              <Input
                id="nextMaintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
                className="border-border focus:border-zinc-900 focus:ring-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 focus:border-zinc-900 focus:ring-zinc-900"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href="/admin/equipment">
                <Button variant="outline" type="button" className="border-border hover:bg-muted/50">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-zinc-900 hover:bg-zinc-800 text-white">
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Equipment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}