"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CreditCard, Check, X, Users, TrendingUp, DollarSign, ChevronRight, Edit2, Trash2 } from "lucide-react"

interface SubscriptionPlan {
  id: number
  name: string
  description?: string
  price: number
  interval: string
  features: string[]
  isActive: boolean
  memberCount: number
  tier?: string
  maxClassesPerWeek?: number
  maxCheckInsPerDay?: number
  hasTrainerAccess?: boolean
  hasPersonalTraining?: boolean
  hasProgressTracking?: boolean
  hasAchievements?: boolean
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month",
    stripePriceId: "",
    stripeAnnualPriceId: "",
    features: "",
    tier: "basic",
    maxClassesPerWeek: "3",
    maxCheckInsPerDay: "1",
    hasTrainerAccess: false,
    hasPersonalTraining: false,
    hasProgressTracking: true,
    hasAchievements: true,
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
      const url = editingPlan
        ? "/api/admin/subscriptions/plans"
        : "/api/admin/subscriptions/plans"
      const method = editingPlan ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingPlan && { id: editingPlan.id }),
          ...formData,
          price: parseFloat(formData.price),
          features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingPlan(null)
        setFormData({
          name: "",
          description: "",
          price: "",
          interval: "month",
          stripePriceId: "",
          stripeAnnualPriceId: "",
          features: "",
          tier: "basic",
          maxClassesPerWeek: "3",
          maxCheckInsPerDay: "1",
          hasTrainerAccess: false,
          hasPersonalTraining: false,
          hasProgressTracking: true,
          hasAchievements: true,
        })
        fetchPlans()
      } else {
        const data = await response.json()
        alert(data.error || `Failed to ${editingPlan ? "update" : "create"} plan`)
      }
    } catch (err) {
      alert(`Failed to ${editingPlan ? "update" : "create"} plan`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      interval: plan.interval,
      stripePriceId: "",
      stripeAnnualPriceId: "",
      features: plan.features.join(", "),
      tier: plan.tier || "basic",
      maxClassesPerWeek: (plan.maxClassesPerWeek || 3).toString(),
      maxCheckInsPerDay: (plan.maxCheckInsPerDay || 1).toString(),
      hasTrainerAccess: plan.hasTrainerAccess || false,
      hasPersonalTraining: plan.hasPersonalTraining || false,
      hasProgressTracking: plan.hasProgressTracking !== false,
      hasAchievements: plan.hasAchievements !== false,
    })
    setShowForm(true)
  }

  const handleDelete = async (planId: number, force: boolean = false) => {
    if (!confirm(force ? "This will cancel all active subscriptions. Are you sure?" : "Are you sure you want to delete this plan?")) return

    try {
      const url = force
        ? `/api/admin/subscriptions/plans?id=${planId}&force=true`
        : `/api/admin/subscriptions/plans?id=${planId}`
      const response = await fetch(url, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchPlans()
      } else {
        const data = await response.json()
        const errorMsg = data.error || "Failed to delete plan"

        // If failed due to active subscriptions, offer force delete
        if (errorMsg.includes("active subscriptions") && !force) {
          if (confirm(`${errorMsg}\n\nDo you want to cancel all subscriptions and delete anyway?`)) {
            handleDelete(planId, true)
          }
        } else {
          alert(errorMsg)
        }
      }
    } catch (err) {
      alert("Failed to delete plan")
    }
  }

  const cancelEdit = () => {
    setShowForm(false)
    setEditingPlan(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      interval: "month",
      stripePriceId: "",
      stripeAnnualPriceId: "",
      features: "",
      tier: "basic",
      maxClassesPerWeek: "3",
      maxCheckInsPerDay: "1",
      hasTrainerAccess: false,
      hasPersonalTraining: false,
      hasProgressTracking: true,
      hasAchievements: true,
    })
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
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Subscriptions</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-1">Manage subscription plans and billing</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-foreground dark:hover:bg-muted rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground dark:text-white">{totalSubscribers}</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Total Subscribers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground dark:text-white">${totalMonthlyRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground dark:text-white">{plans.length}</p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Active Plans</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground dark:text-white">
                {plans.filter(p => p.isActive).length}
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Published Plans</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Plan Form */}
      {showForm && (
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground dark:text-white">{editingPlan ? "Edit Plan" : "Create New Plan"}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelEdit}
              className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground dark:text-zinc-300">Plan Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Membership"
                    className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-foreground dark:text-zinc-300">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground dark:text-zinc-300">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the plan"
                  className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="interval" className="text-foreground dark:text-zinc-300">Billing Interval</Label>
                  <select
                    id="interval"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="w-full p-2.5 bg-muted/50 dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripePriceId" className="text-foreground dark:text-zinc-300">Stripe Price ID (Monthly)</Label>
                  <Input
                    id="stripePriceId"
                    value={formData.stripePriceId}
                    onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                    placeholder="price_123..."
                    className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeAnnualPriceId" className="text-foreground dark:text-zinc-300">Stripe Price ID (Yearly)</Label>
                  <Input
                    id="stripeAnnualPriceId"
                    value={formData.stripeAnnualPriceId}
                    onChange={(e) => setFormData({ ...formData, stripeAnnualPriceId: e.target.value })}
                    placeholder="price_123... (optional)"
                    className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features" className="text-foreground dark:text-zinc-300">Features (comma-separated)</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Unlimited access, Personal training, Nutrition plan"
                  className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                />
              </div>

              <div className="border-t border-border dark:border-zinc-800 pt-6">
                <h4 className="text-sm font-medium text-foreground dark:text-white mb-4">Plan Limits</h4>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier" className="text-foreground dark:text-zinc-300">Tier</Label>
                    <select
                      id="tier"
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="w-full p-2.5 bg-muted/50 dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxClassesPerWeek" className="text-foreground dark:text-zinc-300">Classes/Week</Label>
                    <Input
                      id="maxClassesPerWeek"
                      type="number"
                      value={formData.maxClassesPerWeek}
                      onChange={(e) => setFormData({ ...formData, maxClassesPerWeek: e.target.value })}
                      placeholder="3"
                      className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                    />
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground">Use 999 for unlimited</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCheckInsPerDay" className="text-foreground dark:text-zinc-300">Check-ins/Day</Label>
                    <Input
                      id="maxCheckInsPerDay"
                      type="number"
                      value={formData.maxCheckInsPerDay}
                      onChange={(e) => setFormData({ ...formData, maxCheckInsPerDay: e.target.value })}
                      placeholder="1"
                      className="bg-muted/50 dark:bg-zinc-800 border-border dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:ring-zinc-900 dark:focus:ring-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-foreground dark:text-zinc-300">Features</Label>
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 text-sm text-foreground/80 dark:text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={formData.hasTrainerAccess}
                          onChange={(e) => setFormData({ ...formData, hasTrainerAccess: e.target.checked })}
                          className="rounded border-border dark:border-zinc-600"
                        />
                        Trainer Access
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground/80 dark:text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={formData.hasPersonalTraining}
                          onChange={(e) => setFormData({ ...formData, hasPersonalTraining: e.target.checked })}
                          className="rounded border-border dark:border-zinc-600"
                        />
                        Personal Training
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg" disabled={saving}>
                  {saving ? (editingPlan ? "Updating..." : "Creating...") : (editingPlan ? "Update Plan" : "Create Plan")}
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
            <Card key={i} className="border-border dark:border-zinc-800 shadow-sm bg-card">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-32" />
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-16" />
                  </div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-48" />
                  <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">No subscription plans configured</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-foreground dark:hover:bg-muted rounded-lg"
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
              className={`border-border dark:border-zinc-800 shadow-sm hover:shadow-md transition-all bg-card ${!plan.isActive ? "opacity-60" : ""
                }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">{plan.description}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-muted text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground dark:text-white">${plan.price}</span>
                  <span className="text-muted-foreground dark:text-muted-foreground ml-2">/{plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-foreground/80 dark:text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-4 border-t border-border dark:border-zinc-800">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{plan.memberCount} subscribers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 dark:text-muted-foreground dark:hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <Card className="border-border dark:border-zinc-800 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground dark:text-white">Recent Subscription Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto text-zinc-300 dark:text-foreground/80 mb-4" />
            <p>Subscription activity will appear here</p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">Configure Stripe webhook to track activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
