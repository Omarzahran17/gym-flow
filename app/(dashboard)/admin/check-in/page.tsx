"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, QrCode, Loader2, Clock, User } from "lucide-react"

interface CheckInResult {
  success: boolean
  member?: {
    id: number
    name: string
    email: string
    status: string
    subscription?: string
  }
  message: string
}

export default function CheckInPage() {
  const [qrInput, setQrInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<{ memberName: string, time: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/attendance")
      .then(res => res.json())
      .then(data => {
        if (data.attendance) {
          setRecentCheckIns(data.attendance)
        }
      })
      .catch(err => console.error("Failed to fetch recent check-ins:", err))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [result])

  const handleCheckIn = async (code: string) => {
    if (!code.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode: code }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          member: data.member,
          message: "Check-in successful!",
        })
        const newCheckIn = {
          memberName: data.member.name,
          time: new Date().toLocaleTimeString()
        }
        setRecentCheckIns(prev => [newCheckIn, ...prev].slice(0, 10))
        setQrInput("")
      } else {
        setResult({
          success: false,
          message: data.error || "Check-in failed",
        })
      }
    } catch (err) {
      setResult({
        success: false,
        message: "Failed to process check-in",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCheckIn(qrInput)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Member Check-In</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">Scan QR code or enter member code</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardHeader className="pb-4 border-b border-border dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan or Enter Code
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Enter QR code, user ID, or name..."
                  className="text-lg h-14 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white pr-24 bg-muted/50 dark:bg-zinc-800"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-foreground dark:hover:bg-muted"
                  disabled={loading || !qrInput.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>

            {result && (
              <div className={`mt-6 p-6 rounded-xl border ${result.success
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}>
                <div className="flex items-start gap-4">
                  {result.success ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${result.success ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"}`}>
                      {result.message}
                    </p>
                    {result.member && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground dark:text-white">{result.member.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground/80 dark:text-muted-foreground">{new Date().toLocaleString()}</span>
                        </div>
                        <div>
                          <Badge className={result.member.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-muted text-foreground/80 dark:bg-zinc-800 dark:text-muted-foreground"}>
                            {result.member.status}
                          </Badge>
                          {result.member.subscription && (
                            <span className="ml-2 text-sm text-muted-foreground dark:text-muted-foreground">
                              ({result.member.subscription})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardHeader className="pb-4 border-b border-border dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentCheckIns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
                </div>
                <p className="text-muted-foreground dark:text-muted-foreground">No check-ins yet today</p>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-1">Scan a member&apos;s QR code to check them in</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-zinc-800 rounded-lg border border-border dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {checkIn.memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground dark:text-white">{checkIn.memberName}</span>
                    </div>
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {new Date(checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
