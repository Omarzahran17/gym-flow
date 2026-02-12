"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Edit, Calendar, Dumbbell, TrendingUp } from "lucide-react"

interface Member {
  id: number
  userId: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  emergencyContact?: string
  healthNotes?: string
  status: string
  joinDate: string
  qrCode?: string
}

interface MemberStats {
  totalWorkouts: number
  attendanceRate: number
  memberSince: string
}

export default function MemberDetailPage() {
  const params = useParams()
  const memberId = params.id
  const [member, setMember] = useState<Member | null>(null)
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/members/${memberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.member) {
          setMember(data.member)
          setStats(data.stats)
        }
      })
      .catch((err) => console.error("Failed to fetch member:", err))
      .finally(() => setLoading(false))
  }, [memberId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-border"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Member not found</p>
        <Link href="/admin/members">
          <Button className="mt-4">Back to Members</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/members">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {member.firstName?.[0]}{member.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-muted-foreground">{member.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              if (!confirm("Are you sure you want to convert this member to a trainer?")) return

              try {
                const response = await fetch(`/api/admin/members/${memberId}/convert`, {
                  method: "POST",
                })

                if (!response.ok) {
                  const data = await response.json()
                  throw new Error(data.error || "Failed to convert member")
                }

                window.location.href = "/admin/trainers"
              } catch (err) {
                alert(err instanceof Error ? err.message : "Failed to convert")
              }
            }}
          >
            Convert to Trainer
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Member
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <QRCodeSVG value={member.qrCode || member.userId} size={140} />
              <p className="mt-4 text-sm font-medium text-foreground">Member QR Code</p>
              <p className="text-xs text-muted-foreground mt-1">Scan at reception for quick check-in</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Phone</span>
              <span className="font-medium text-foreground">{member.phone || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Emergency Contact</span>
              <span className="font-medium text-foreground">{member.emergencyContact || "-"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Health Notes</span>
              <span className="font-medium text-foreground">{member.healthNotes || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Membership Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Status</span>
              <span
                className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium w-fit mt-1 ${member.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-muted text-foreground border border-border"
                  }`}
              >
                {member.status}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Member Since</span>
              <span className="font-medium text-foreground">
                {new Date(member.joinDate).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stats.totalWorkouts}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Workouts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stats.attendanceRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">Attendance Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-foreground">{stats.memberSince}</p>
                <p className="text-sm text-muted-foreground mt-1">Member Duration</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
