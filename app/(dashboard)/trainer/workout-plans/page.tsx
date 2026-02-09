"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, User, Dumbbell, Edit, Trash2, CheckCircle } from "lucide-react"

interface WorkoutPlan {
  id: number
  name: string
  description: string
  memberId: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
  member?: {
    id: number
    userId: string
  }
  exercises?: {
    id: number
    orderIndex: number
    exercise: {
      name: string
    }
  }[]
}

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trainer/workout-plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans)
        }
      })
      .catch((err) => console.error("Failed to fetch plans:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this workout plan?")) return

    try {
      await fetch(`/api/trainer/workout-plans/${id}`, {
        method: "DELETE",
      })
      setPlans(plans.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Failed to delete plan:", err)
    }
  }

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/trainer/workout-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        setPlans(
          plans.map((p) =>
            p.id === id ? { ...p, isActive: !currentStatus } : p
          )
        )
      }
    } catch (err) {
      console.error("Failed to toggle plan status:", err)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Workout Plans</h1>
          <p className="text-zinc-500 mt-1">Create and manage workout plans for your members</p>
        </div>
        <Link href="/trainer/workout-plans/new">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-zinc-200"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-zinc-900 border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-xl">
          <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-zinc-500 mb-4">No workout plans created yet</p>
          <Link href="/trainer/workout-plans/new">
            <Button variant="outline" className="border-zinc-200 hover:bg-zinc-50">
              <Plus className="h-4 w-4 mr-2" />
              Create your first plan
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`border-zinc-200 shadow-sm transition-all ${!plan.isActive ? "opacity-60" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-zinc-900">{plan.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                      <User className="h-4 w-4" />
                      <span>Member #{plan.memberId}</span>
                    </div>
                  </div>
                  <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-100 text-zinc-600"}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                  {plan.description || "No description"}
                </p>

                <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="h-4 w-4" />
                    <span>{plan.exercises?.length || 0} exercises</span>
                  </div>
                  {plan.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(plan.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-200 hover:bg-zinc-50"
                    onClick={() => toggleActive(plan.id, plan.isActive)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Link href={`/trainer/workout-plans/${plan.id}`}>
                    <Button variant="outline" size="icon" className="border-zinc-200 hover:bg-zinc-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-zinc-200 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
