"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SubscribeButtonProps {
  planId: number
  isAnnual?: boolean
}

export function SubscribeButton({ planId, isAnnual = false }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId, isAnnual }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error("Subscribe error:", error)
      alert("Failed to initiate checkout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="w-full">
      {loading ? "Loading..." : "Subscribe"}
    </Button>
  )
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false)

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error("Billing portal error:", error)
      alert("Failed to open billing portal. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleManageBilling} disabled={loading} variant="outline">
      {loading ? "Loading..." : "Manage Billing"}
    </Button>
  )
}
