"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

export function SubscriptionSync({ showSuccess }: { showSuccess: boolean }) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(showSuccess)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (!showSuccess) return

    const syncSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/sync-subscription", { method: "POST" })
        if (res.ok) {
          setSynced(true)
          setTimeout(() => {
            router.refresh()
          }, 1000)
        }
      } catch (error) {
        console.error("Failed to sync subscription:", error)
      } finally {
        setSyncing(false)
      }
    }

    syncSubscription()
  }, [showSuccess, router])

  if (!showSuccess) return null

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 text-emerald-800">
      {syncing ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Syncing your subscription...</span>
        </>
      ) : synced ? (
        <>
          <Check className="h-5 w-5" />
          <span>Your subscription has been successfully activated!</span>
        </>
      ) : (
        <>
          <Check className="h-5 w-5" />
          <span>Your subscription has been successfully updated!</span>
        </>
      )}
    </div>
  )
}
