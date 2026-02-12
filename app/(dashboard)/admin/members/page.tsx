"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Mail, User, Shield, Crown, ArrowUpCircle } from "lucide-react"

interface Member {
  id: string
  userId: string
  name?: string | null
  email?: string | null
  status?: string
  role?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [promotingId, setPromotingId] = useState<string | null>(null)

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
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      member.userId.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleIcon = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 mr-1" />
      case "trainer":
        return <Shield className="h-3 w-3 mr-1" />
      default:
        return <User className="h-3 w-3 mr-1" />
    }
  }

  const getRoleBadgeColor = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "trainer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
    }
  }

  const handlePromoteToTrainer = async (userId: string, memberName: string) => {
    setPromotingId(userId)
    try {
      const response = await fetch(`/api/admin/members/${userId}/convert`, {
        method: "POST",
      })

      if (response.ok) {
        // Refresh members list
        const membersRes = await fetch("/api/admin/members")
        const membersData = await membersRes.json()
        if (membersData.members) {
          setMembers(membersData.members)
        }
        alert(`${memberName} has been promoted to trainer!`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to promote to trainer")
      }
    } catch (err) {
      alert("Failed to promote to trainer")
    } finally {
      setPromotingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground dark:text-white">Members</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">View all gym members and users</p>
      </div>

      {/* Search */}
      <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-border dark:border-zinc-800 shadow-sm bg-card animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-24 mb-2" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground dark:text-muted-foreground">No members found</p>
            {search && (
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Try adjusting your search</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="border-border dark:border-zinc-800 shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {member.name?.[0] || member.userId[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground dark:text-white truncate">
                      {member.name || member.userId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground truncate">
                        {member.email || "No email"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role || "member"}
                    </span>
                    {member.role !== "trainer" && member.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const name = member.name || member.userId
                          if (confirm(`Promote ${name} to trainer?`)) {
                            handlePromoteToTrainer(member.id, name)
                          }
                        }}
                        disabled={promotingId === member.id}
                        className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        {promotingId === member.id ? (
                          <span className="animate-spin h-3 w-3 mr-1">⟳</span>
                        ) : (
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                        )}
                        Promote
                      </Button>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    member.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {member.status || "active"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground dark:text-white">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Members</p>
            <p className="text-2xl font-bold text-blue-600">
              {members.filter(m => m.role === "member" || !m.role).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Trainers</p>
            <p className="text-2xl font-bold text-emerald-600">
              {members.filter(m => m.role === "trainer").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-purple-600">
              {members.filter(m => m.role === "admin").length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
