"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react"

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    healthNotes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/members")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create member")
      }
    } catch (err) {
      setError("Failed to create member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/members">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add New Member</h1>
          <p className="text-zinc-500 mt-1">Create a new member account</p>
        </div>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-zinc-100">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-zinc-700">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-zinc-700">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-sm font-medium text-zinc-700">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                placeholder="Name and phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthNotes" className="text-sm font-medium text-zinc-700">Health Notes</Label>
              <textarea
                id="healthNotes"
                value={formData.healthNotes}
                onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 min-h-[100px] resize-none focus:border-zinc-900 focus:ring-zinc-900"
                placeholder="Any injuries, conditions, or limitations..."
              />
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-100">
              <Link href="/admin/members" className="flex-1">
                <Button type="button" variant="outline" className="w-full border-zinc-200 hover:bg-zinc-50">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Member
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
