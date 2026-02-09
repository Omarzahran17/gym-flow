"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"

const COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
]

export default function NewClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxCapacity: 20,
    durationMinutes: 60,
    color: "#3b82f6",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create class")
      }

      router.push("/admin/classes")
    } catch (err) {
      console.error("Error creating class:", err)
      alert("Failed to create class")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add New Class</h1>
          <p className="text-zinc-500 mt-1">Create a new gym class</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">Class Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-zinc-700">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Yoga Flow, HIIT Cardio"
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-zinc-700">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the class..."
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 min-h-[100px] resize-none focus:border-zinc-900 focus:ring-zinc-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCapacity" className="text-sm font-medium text-zinc-700">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCapacity: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-zinc-700">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value),
                    })
                  }
                  min={15}
                  step={5}
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-zinc-700">Class Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? "border-zinc-900 scale-110 shadow-md"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href="/admin/classes">
                <Button variant="outline" type="button" className="border-zinc-200 hover:bg-zinc-50">
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
                    Create Class
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