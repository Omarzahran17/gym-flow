"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, QrCode, Camera, Loader2, Clock, User } from "lucide-react"

interface CheckInResult {
  success: boolean
  member?: {
    id: number
    name: string
    email: string
    status: string
  }
  message: string
}

export default function CheckInPage() {
  const [qrInput, setQrInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [recentCheckIns, setRecentCheckIns] = useState<{memberName: string, time: string}[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [result])

  const handleCheckIn = async (qrCode: string) => {
    if (!qrCode.trim()) return
    
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          member: data.member,
          message: "Check-in successful!",
        })
        setRecentCheckIns(prev => [
          { memberName: data.member.name, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9),
        ])
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
        <h1 className="text-2xl font-bold text-zinc-900">Member Check-In</h1>
        <p className="text-zinc-500 mt-1">Scan QR code or enter member code</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
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
                  placeholder="Enter QR code or scan..."
                  className="text-lg h-14 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 pr-24"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 hover:bg-zinc-800"
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
              <div className={`mt-6 p-6 rounded-xl border ${
                result.success 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-start gap-4">
                  {result.success ? (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${result.success ? "text-emerald-800" : "text-red-800"}`}>
                      {result.message}
                    </p>
                    {result.member && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-zinc-500" />
                          <span className="font-medium text-zinc-900">{result.member.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          <span className="text-zinc-600">{new Date().toLocaleString()}</span>
                        </div>
                        <div>
                          <Badge className={result.member.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"}>
                            {result.member.status}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-zinc-100">
            <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {recentCheckIns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500">No check-ins yet today</p>
                <p className="text-zinc-400 text-sm mt-1">Scan a member&apos;s QR code to check them in</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {checkIn.memberName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-zinc-900">{checkIn.memberName}</span>
                    </div>
                    <span className="text-sm text-zinc-500">{checkIn.time}</span>
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
