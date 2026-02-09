"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard, Check, X, Users, TrendingUp, DollarSign, ChevronRight } from "lucide-react"

interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  price: number
  interval: string
  features: string[]
  isActive: boolean
  memberCount: number
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month",
    stripePriceId: "",
    stripeAnnualPriceId: "",
    features: "",
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = () => {
    fetch("/api/admin/subscriptions/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans)
        }
      })
      .catch((err) => console.error("Failed to fetch plans:", err))
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/subscriptions/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: "",
          description: "",
          price: "",
          interval: "month",
          stripePriceId: "",
          stripeAnnualPriceId: "",
          features: "",
        })
        fetchPlans()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create plan")
      }
    } catch (err) {
      alert("Failed to create plan")
    } finally {
      setSaving(false)
    }
  }

  const totalSubscribers = plans.reduce((acc, plan) => acc + plan.memberCount, 0)
  const totalMonthlyRevenue = plans.reduce((acc, plan) => {
    return acc + (plan.price * (plan.interval === "month" ? 1 : plan.price / 12) * plan.memberCount)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Subscriptions</h1>
          <p className="text-zinc-500 mt-1">Manage subscription plans and billing</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">{totalSubscribers}</p>
              <p className="text-sm text-zinc-500 mt-1">Total Subscribers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">${totalMonthlyRevenue.toFixed(2)}</p>
              <p className="text-sm text-zinc-500 mt-1">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">{plans.length}</p>
              <p className="text-sm text-zinc-500 mt-1">Active Plans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-zinc-900">
                {plans.filter(p => p.isActive).length}
              </p>
              <p className="text-sm text-zinc-500 mt-1">Published Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Plan Form */}
      {showForm && (
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create New Plan</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
              className="text-zinc-500 hover:text-zinc-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Membership"
                    className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the plan"
                  className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="interval">Billing Interval</Label>
                  <select
                    id="interval"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripePriceId">Stripe Price ID (Monthly)</Label>
                  <Input
                    id="stripePriceId"
                    value={formData.stripePriceId}
                    onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                    placeholder="price_123..."
                    className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeAnnualPriceId">Stripe Price ID (Yearly)</Label>
                  <Input
                    id="stripeAnnualPriceId"
                    value={formData.stripeAnnualPriceId}
                    onChange={(e) => setFormData({ ...formData, stripeAnnualPriceId: e.target.value })}
                    placeholder="price_123... (optional)"
                    className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Unlimited access, Personal training, Nutrition plan"
                  className="bg-zinc-50 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg" disabled={saving}>
                  {saving ? "Creating..." : "Create Plan"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-zinc-200 shadow-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-zinc-200 rounded w-32" />
                    <div className="h-5 bg-zinc-200 rounded w-16" />
                  </div>
                  <div className="h-4 bg-zinc-200 rounded w-48" />
                  <div className="h-10 bg-zinc-200 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500 mb-4">No subscription plans configured</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`border-zinc-200 shadow-sm hover:shadow-md transition-all ${
                !plan.isActive ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">{plan.name}</h3>
                    <p className="text-sm text-zinc-500">{plan.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-zinc-900">${plan.price}</span>
                  <span className="text-zinc-500 ml-2">/{plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-zinc-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div className="flex items-center space-x-2 text-sm text-zinc-500">
                    <Users className="h-4 w-4" />
                    <span>{plan.memberCount} subscribers</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-zinc-900">Recent Subscription Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-zinc-500">
            <TrendingUp className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <p>Subscription activity will appear here</p>
            <p className="text-sm text-zinc-400 mt-1">Configure Stripe webhook to track activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
