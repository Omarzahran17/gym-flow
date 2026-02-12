"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Dumbbell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Member {
  id: number
  userId: string
  phone?: string
  status: string
  joinDate: Date
  assignedPlans: number
  user?: {
    name: string | null
    email: string | null
  }
  activePlan: {
    id: number
    name: string
    isActive: boolean
  } | null
}

export default function TrainerMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trainer/members")
      .then((res) => res.json())
      .then((data) => {
        if (data.members) {
          setMembers(data.members)
        }
      })
      .catch((err) => console.error("Failed to fetch members:", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredMembers = members.filter(
    (member) =>
      member.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.phone?.toLowerCase().includes(search.toLowerCase()) ||
      member.userId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Members</h1>
        <p className="text-gray-600">View and manage your assigned clients</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading members...</p>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {members.length === 0
                  ? "No members assigned to you yet"
                  : "No members match your search"}
              </p>
              {members.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Members will appear here when you create workout plans for them
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {member.user?.name || member.userId.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {member.phone || "No phone"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span
                          className={`font-medium ${member.status === "active"
                            ? "text-green-600"
                            : "text-gray-500"
                            }`}
                        >
                          {member.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Plans</span>
                        <span className="font-medium">{member.assignedPlans}</span>
                      </div>
                      {member.activePlan && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Active Plan</span>
                          <span className="font-medium">{member.activePlan.name}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/trainer/workout-plans/new?memberId=${member.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Create Plan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
