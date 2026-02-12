"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Mail, User, Shield, Crown, ArrowUpCircle, Phone, HeartPulse, ShieldAlert, Calendar, FileText, Award } from "lucide-react"

interface Member {
  id: string
  userId: string
  name?: string | null
  email?: string | null
  status?: string
  role?: string
  phone?: string | null
  emergencyContact?: string | null
  healthNotes?: string | null
  joinDate?: string | null
  createdAt?: string | null
  bio?: string | null
  specialization?: string | null
  certifications?: string | null
  isMember: boolean
  isTrainer: boolean
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
            <Card
              key={member.id}
              className="border-border dark:border-zinc-800 shadow-sm bg-card hover:shadow-md transition-all cursor-pointer hover:border-blue-500/50 group"
              onClick={() => {
                setSelectedMember(member)
                setIsDialogOpen(true)
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      {member.role || "member"}
                    </span>
                    {member.role !== "trainer" && member.role !== "admin" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
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
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.status === "active"
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

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-zinc-900 border-border dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {selectedMember?.name?.[0] || selectedMember?.userId[0]?.toUpperCase()}
              </div>
              <div>
                <p>{selectedMember?.name || "User Details"}</p>
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleBadgeColor(selectedMember?.role)}`}>
                  {getRoleIcon(selectedMember?.role)}
                  {selectedMember?.role || "member"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-zinc-600 dark:text-zinc-300">{selectedMember?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-500" />
                    <span className="text-zinc-600 dark:text-zinc-300">{selectedMember?.phone || "No phone number"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                    <div className="text-sm">
                      <p className="text-zinc-400 text-xs">Emergency Contact</p>
                      <p className="text-zinc-600 dark:text-zinc-300">{selectedMember?.emergencyContact || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Health & Access</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <HeartPulse className="h-4 w-4 text-pink-500 mt-1" />
                    <div className="text-sm">
                      <p className="text-zinc-400 text-xs">Medical Notes</p>
                      <p className="text-zinc-600 dark:text-zinc-300 italic">
                        {selectedMember?.healthNotes || "No medical notes on file."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <div className="text-sm">
                      <p className="text-zinc-400 text-xs">Member Since</p>
                      <p className="text-zinc-600 dark:text-zinc-300">
                        {selectedMember?.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              {selectedMember?.role === "trainer" && (
                <section className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Trainer Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-zinc-400 text-xs mb-1 font-medium">Specialization</p>
                      <p className="text-zinc-700 dark:text-zinc-200">{selectedMember?.specialization || "General Fitness"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1 font-medium">Certifications</p>
                      <p className="text-zinc-700 dark:text-zinc-200 text-sm">{selectedMember?.certifications || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-xs mb-1 font-medium">Bio</p>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs italic line-clamp-3">{selectedMember?.bio || "No bio provided."}</p>
                    </div>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 font-medium">System Data</h3>
                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">User ID</span>
                    <span className="text-zinc-500 font-mono">{selectedMember?.userId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">System ID</span>
                    <span className="text-zinc-500 font-mono">{selectedMember?.id}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
