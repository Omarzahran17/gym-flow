"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTrainerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    specialization: "",
    maxClients: "20",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxClients: parseInt(formData.maxClients),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create trainer")
      }

      router.push("/admin/trainers")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/trainers">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add New Trainer</h1>
          <p className="text-zinc-500 mt-1">Create a new trainer account</p>
        </div>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">Trainer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-zinc-700">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-zinc-700">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-sm font-medium text-zinc-700">Specialization</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="e.g., Weight Training, Yoga, Cardio"
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxClients" className="text-sm font-medium text-zinc-700">Max Clients</Label>
              <Input
                id="maxClients"
                type="number"
                value={formData.maxClients}
                onChange={(e) =>
                  setFormData({ ...formData, maxClients: e.target.value })
                }
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/admin/trainers" className="flex-1">
                <Button variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  "Create Trainer"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
