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
                        await db.insert(memberSubscriptions).values({
                            memberId: parseInt(subscription.referenceId),
                            stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
                            planId: planDetails.id,
                            status: 'active',
                            currentPeriodStart: subscription.periodStart ? new Date(subscription.periodStart) : new Date(),
                            currentPeriodEnd: subscription.periodEnd ? new Date(subscription.periodEnd) : new Date(),
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

                    await db.update(memberSubscriptions)
                        .set({
                            status: subscription.status,
                            currentPeriodStart: subscription.periodStart ? new Date(subscription.periodStart) : undefined,
                            currentPeriodEnd: subscription.periodEnd ? new Date(subscription.periodEnd) : undefined,
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
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
    },
    socialProviders: {},
});

export type Auth = typeof auth;
