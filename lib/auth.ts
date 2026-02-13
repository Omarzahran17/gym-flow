import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { db } from "./db";
import { members, memberSubscriptions, subscriptionPlans, users, session, account, verification, usersRelations, sessionRelations, accountRelations } from "./db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

const getBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"
    return url.startsWith("http") ? url : `https://${url}`
}

export const auth = betterAuth({
    baseURL: getBaseUrl(),
    emailAndPassword: {
        enabled: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            users: users,
            session: session,
            account: account,
            verification: verification,
            usersRelations: usersRelations,
            sessionRelations: sessionRelations,
            accountRelations: accountRelations,
        },
    }),

    plugins: [
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            subscription: {
                enabled: true,
                plans: async () => {
                    const plans = await db.query.subscriptionPlans.findMany({
                        where: eq(subscriptionPlans.isActive, true)
                    });
                    return plans.map(plan => ({
                        name: plan.name.toLowerCase(),
                        priceId: plan.stripePriceId || undefined,
                        annualDiscountPriceId: plan.stripeAnnualPriceId || undefined,
                    }));
                },
                onSubscriptionComplete: async ({ subscription, plan }) => {
                    if (!subscription.referenceId) return;

                    await db.update(members)
                        .set({ status: 'active' })
                        .where(eq(members.userId, subscription.referenceId));

                    const planDetails = await db.query.subscriptionPlans.findFirst({
                        where: eq(subscriptionPlans.name, plan.name)
                    });

                    if (planDetails && subscription.referenceId) {
                        let currentPeriodStart = subscription.periodStart ? new Date(subscription.periodStart) : new Date()
                        let currentPeriodEnd = subscription.periodEnd ? new Date(subscription.periodEnd) : null

                        // Calculate end date based on plan interval if not provided
                        if (!currentPeriodEnd || currentPeriodEnd.getTime() <= currentPeriodStart.getTime()) {
                            const interval = planDetails.interval || 'month'
                            currentPeriodEnd = new Date(currentPeriodStart)
                            if (interval === 'year') {
                                currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
                            } else if (interval === 'month') {
                                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
                            } else if (interval === 'week') {
                                currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7)
                            } else {
                                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
                            }
                        }

                        await db.insert(memberSubscriptions).values({
                            memberId: parseInt(subscription.referenceId),
                            stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
                            planId: planDetails.id,
                            status: 'active',
                            currentPeriodStart,
                            currentPeriodEnd,
                        });
                    }
                },
                onSubscriptionCancel: async ({ subscription }) => {
                    if (!subscription.stripeSubscriptionId) return;

                    await db.update(memberSubscriptions)
                        .set({ status: 'canceled' })
                        .where(eq(memberSubscriptions.stripeSubscriptionId, subscription.stripeSubscriptionId));
                },
                onSubscriptionUpdate: async ({ subscription }) => {
                    if (!subscription.stripeSubscriptionId) return;

                    const existingSub = await db.query.memberSubscriptions.findFirst({
                        where: eq(memberSubscriptions.stripeSubscriptionId, subscription.stripeSubscriptionId),
                    })

                    let currentPeriodEnd: Date | undefined
                    if (subscription.periodEnd) {
                        currentPeriodEnd = new Date(subscription.periodEnd)
                    } else if (existingSub?.currentPeriodStart) {
                        const plan = existingSub.planId 
                            ? await db.query.subscriptionPlans.findFirst({
                                where: eq(subscriptionPlans.id, existingSub.planId),
                              })
                            : null
                        const interval = plan?.interval || 'month'
                        currentPeriodEnd = new Date(existingSub.currentPeriodStart)
                        if (interval === 'year') {
                            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
                        } else if (interval === 'month') {
                            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
                        } else if (interval === 'week') {
                            currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7)
                        } else {
                            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
                        }
                    }

                    await db.update(memberSubscriptions)
                        .set({
                            status: subscription.status,
                            currentPeriodStart: subscription.periodStart ? new Date(subscription.periodStart) : undefined,
                            currentPeriodEnd,
                            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                        })
                        .where(eq(memberSubscriptions.stripeSubscriptionId, subscription.stripeSubscriptionId));
                }
            }
        }),
        nextCookies(),
    ],
    user: {
        modelName: "users",
        additionalFields: {
            role: {
                type: "string",
                default: "member",
                input: false,
            },
            phone: {
                type: "string",
                required: false,
                input: true,
            },
            emergencyContact: {
                type: "string",
                required: false,
                input: true,
            },
            healthNotes: {
                type: "string",
                required: false,
                input: true,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await db.insert(members).values({
                        userId: user.id,
                        status: 'active',
                        qrCode: `GYM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
                    });
                },
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
    },
    socialProviders: {},
});

export type Auth = typeof auth;
