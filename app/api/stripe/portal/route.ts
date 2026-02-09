import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { members } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get member details
    const member = await db.query.members.findFirst({
      where: eq(members.userId, session.user.id),
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (!member.stripeCustomerId) {
      return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 })
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: member.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/member/subscription`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Create portal session error:", error)
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    )
  }
}
