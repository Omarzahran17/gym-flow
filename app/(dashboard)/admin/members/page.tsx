"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, ChevronRight, Mail, Calendar, Phone } from "lucide-react"

interface Member {
  id: number
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  status: string
  joinDate: string
  qrCode?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/members")
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
      member.email?.toLowerCase().includes(search.toLowerCase()) ||
      member.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      member.userId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Members</h1>
          <p className="text-zinc-500 mt-1">Manage gym members and their subscriptions</p>
        </div>
        <Link href="/admin/members/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search members by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="border-zinc-200 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto"></div>
              <p className="text-zinc-500 mt-4">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500 mb-4">No members found</p>
              {search && (
                <p className="text-sm text-zinc-400">Try adjusting your search</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/admin/members/${member.id}`}
                  className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {member.firstName?.[0] || member.userId[0]?.toUpperCase()}
                        {member.lastName?.[0] || ""}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.userId}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-zinc-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email || "No email"}
                        </span>
                        {member.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {member.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-zinc-100 text-zinc-800"
                        }`}
                      >
                        {member.status}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center justify-end">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Total Members</p>
            <p className="text-2xl font-bold text-zinc-900">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500">Inactive</p>
            <p className="text-2xl font-bold text-zinc-400">
              {members.filter(m => m.status !== "active").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
