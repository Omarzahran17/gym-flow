import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members, memberSubscriptions, subscriptionPlans } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Calendar, CreditCard, AlertCircle, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { SubscribeButton, ManageBillingButton } from "@/components/subscription/SubscriptionButtons"
import { SubscriptionSync } from "@/components/subscription/SubscriptionSync"

export const metadata: Metadata = {
  title: "My Subscription",
  description: "Manage your gym subscription",
}

async function getOrCreateMember(userId: string) {
  const existingMember = await db.query.members.findFirst({
    where: eq(members.userId, userId),
    with: {
      subscriptions: {
        with: {
          plan: true,
        },
        orderBy: [desc(memberSubscriptions.createdAt)],
        limit: 1,
      },
    },
  })

  if (existingMember) {
    return existingMember
  }

  const [newMember] = await db.insert(members).values({
    userId: userId,
    status: "active",
    qrCode: `GYM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  }).returning()

  return { ...newMember, subscriptions: [] }
}

async function getAvailablePlans() {
  const plans = await db.query.subscriptionPlans.findMany({
    where: eq(subscriptionPlans.isActive, true),
    orderBy: [subscriptionPlans.price],
  })
  return plans
}

export default async function MemberSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session) {
    redirect("/login")
  }

  const member = await getOrCreateMember(session.user.id)
  const plans = await getAvailablePlans()

  const params = await searchParams
  const currentSubscription = member.subscriptions?.[0]
  const showSuccess = params.success === "true"
  const showCanceled = params.canceled === "true"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">My Subscription</h1>
        <p className="text-zinc-500 mt-1">Manage your gym membership and billing</p>
      </div>

      {showSuccess && <SubscriptionSync showSuccess={showSuccess} />}

      {showCanceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          <span>Subscription update was canceled. No changes were made.</span>
        </div>
      )}

      {currentSubscription ? (
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-zinc-900">Current Subscription</CardTitle>
                <CardDescription className="text-zinc-500">Your active gym membership</CardDescription>
              </div>
              <SubscriptionStatusBadge status={currentSubscription.status || "unknown"} />
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Plan</p>
                  <p className="text-lg font-semibold text-zinc-900">{currentSubscription.plan?.name || "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Price</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    ${currentSubscription.plan?.price}/{currentSubscription.plan?.interval}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-purple-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Current Period</p>
                  <p className="text-zinc-900">
                    {currentSubscription.currentPeriodStart 
                      ? format(new Date(currentSubscription.currentPeriodStart), "MMM d, yyyy")
                      : "N/A"} - {" "}
                    {currentSubscription.currentPeriodEnd 
                      ? format(new Date(currentSubscription.currentPeriodEnd), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-orange-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Billing</p>
                  <p className="text-zinc-900">
                    Auto-renewal {currentSubscription.cancelAtPeriodEnd ? "disabled" : "enabled"}
                  </p>
                </div>
              </div>
            </div>

            {(() => {
              const features = currentSubscription.plan?.features;
              if (features && Array.isArray(features) && features.length > 0) {
                return (
                  <div className="pt-6 border-t border-zinc-100">
                    <p className="text-sm font-medium text-zinc-700 mb-3">Plan Features</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(features as string[]).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-zinc-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}
          </CardContent>
          <CardFooter className="border-t border-zinc-100 pt-6">
            <ManageBillingButton />
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-zinc-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-zinc-900 mb-2">No Active Subscription</CardTitle>
            <CardDescription className="text-zinc-500">Choose a plan below to get started</CardDescription>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Available Plans</h2>
        {plans.length === 0 ? (
          <Card className="border-zinc-200 shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">No plans available at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border-zinc-200 shadow-sm hover:shadow-md transition-all ${
                  currentSubscription?.planId === plan.id ? "ring-2 ring-zinc-900" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-zinc-900">{plan.name}</CardTitle>
                      {plan.description && (
                        <CardDescription className="text-zinc-500 mt-1">{plan.description}</CardDescription>
                      )}
                    </div>
                    {currentSubscription?.planId === plan.id && (
                      <Badge className="bg-zinc-900 text-white">Current</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-3xl font-bold text-zinc-900">${plan.price}</span>
                    <span className="text-zinc-500 ml-1">/{plan.interval}</span>
                  </div>
                  
                  {(() => {
                    const features = plan.features;
                    if (features && Array.isArray(features) && features.length > 0) {
                      return (
                        <ul className="space-y-2">
                          {(features as string[]).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-zinc-600">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
                <CardFooter className="pt-4 border-t border-zinc-100">
                  {currentSubscription?.planId === plan.id ? (
                    <Button disabled className="w-full bg-zinc-100 text-zinc-500 hover:bg-zinc-100">
                      Current Plan
                    </Button>
                  ) : (
                    <SubscribeButton planId={plan.id} />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; label: string }> = {
    active: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Active" },
    canceled: { className: "bg-zinc-100 text-zinc-700 border-zinc-200", label: "Canceled" },
    past_due: { className: "bg-red-50 text-red-700 border-red-200", label: "Past Due" },
    unpaid: { className: "bg-red-50 text-red-700 border-red-200", label: "Unpaid" },
    trialing: { className: "bg-blue-50 text-blue-700 border-blue-200", label: "Trialing" },
  }

  const { className, label } = config[status] || { className: "bg-zinc-100 text-zinc-700 border-zinc-200", label: status }

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
