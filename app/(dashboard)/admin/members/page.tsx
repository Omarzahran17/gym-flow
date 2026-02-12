"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ChevronRight, Mail, Calendar, Phone, ArrowUpCircle } from "lucide-react"

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
  role?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [promotingId, setPromotingId] = useState<number | null>(null)

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

  const handlePromoteToTrainer = async (memberId: number, memberName: string) => {
    setPromotingId(memberId)
    try {
      const response = await fetch(`/api/admin/members/${memberId}/convert`, {
        method: "POST",
      })

      if (response.ok) {
        // Refresh members list
        const membersRes = await fetch("/api/admin/members")
        const membersData = await membersRes.json()
        if (membersData.members) {
          setMembers(membersData.members)
        }
        alert(`${memberName} has been successfully promoted to trainer!`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to promote member to trainer")
      }
    } catch (err) {
      alert("Failed to promote member to trainer")
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Members</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Manage gym members and their subscriptions</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white mx-auto"></div>
              <p className="text-muted-foreground dark:text-muted-foreground mt-4">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
              </div>
              <p className="text-muted-foreground dark:text-muted-foreground mb-4">No members found</p>
              {search && (
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Try adjusting your search</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {member.firstName?.[0] || member.userId[0]?.toUpperCase()}
                        {member.lastName?.[0] || ""}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground dark:text-white">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : member.userId}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
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
                        {member.role === "trainer" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Trainer
                          </span>
                        )}
                        {member.role === "admin" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                      >
                        {member.status}
                      </span>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 flex items-center justify-end">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                    {member.role !== "trainer" && member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const memberName = member.firstName && member.lastName
                            ? `${member.firstName} ${member.lastName}`
                            : member.userId
                          if (confirm(`Are you sure you want to promote ${memberName} to a trainer?`)) {
                            handlePromoteToTrainer(member.id, memberName)
                          }
                        }}
                        disabled={promotingId === member.id}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                      >
                        {promotingId === member.id ? (
                          <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 mr-1" />
                        )}
                        {promotingId === member.id ? "Promoting..." : "Promote to Trainer"}
                      </Button>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground dark:text-white">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-muted-foreground dark:text-muted-foreground">
              {members.filter(m => m.status !== "active").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
