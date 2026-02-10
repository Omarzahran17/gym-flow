import { db } from "../lib/db"
import { users, members, trainers, subscriptionPlans, memberSubscriptions, classes, classSchedules, account } from "../lib/db/schema"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("🌱 Adding seed data...")

  const hashedPassword = await bcrypt.hash("password123", 10)
  const existingUsers = await db.select().from(users)

  const testEmail = "admin@gymflow.com"
  const adminExists = existingUsers.find(u => u.email === testEmail)

  if (!adminExists) {
    const [adminUser] = await db.insert(users).values({
      id: "admin-user-001",
      name: "Admin User",
      email: testEmail,
      emailVerified: true,
      role: "admin",
    }).returning()

    await db.insert(account).values({
      id: "acc-admin-001",
      accountId: "admin-account-001",
      providerId: "email",
      userId: adminUser.id,
      password: hashedPassword,
    })
    console.log("✅ Created admin user")
  }

  const trainerEmail = "trainer@gymflow.com"
  const trainerExists = existingUsers.find(u => u.email === trainerEmail)
  if (!trainerExists) {
    const [trainerUser] = await db.insert(users).values({
      id: "trainer-user-001",
      name: "John Trainer",
      email: trainerEmail,
      emailVerified: true,
      role: "trainer",
    }).returning()

    await db.insert(trainers).values({
      userId: trainerUser.id,
      bio: "Certified personal trainer with 10 years of experience.",
      specialization: "Strength Training, HIIT",
      maxClients: 15,
    })

    await db.insert(account).values({
      id: "acc-trainer-001",
      accountId: "trainer-account-001",
      providerId: "email",
      userId: trainerUser.id,
      password: hashedPassword,
    })
    console.log("✅ Created trainer user")
  }

  const member1Email = "member1@gymflow.com"
  const member1Exists = existingUsers.find(u => u.email === member1Email)
  if (!member1Exists) {
    const memberUsers = []
    for (let i = 1; i <= 3; i++) {
      const [user] = await db.insert(users).values({
        id: `member-user-${String(i).padStart(3, '0')}`,
        name: `Member ${i}`,
        email: `member${i}@gymflow.com`,
        emailVerified: true,
        role: "member",
      }).returning()
      memberUsers.push(user)

      await db.insert(account).values({
        id: `acc-member-${String(i).padStart(3, '0')}`,
        accountId: `member-account-${String(i).padStart(3, '0')}`,
        providerId: "email",
        userId: user.id,
        password: hashedPassword,
      })
    }

    const existingPlans = await db.select().from(subscriptionPlans)
    if (existingPlans.length === 0) {
      await db.insert(subscriptionPlans).values([
        {
          name: "Basic",
          description: "Perfect for beginners",
          price: 29.99,
          interval: "month",
          tier: "basic",
          maxClassesPerWeek: 3,
          maxCheckInsPerDay: 1,
          hasTrainerAccess: false,
          hasPersonalTraining: false,
          hasProgressTracking: true,
          hasAchievements: true,
        },
        {
          name: "Pro",
          description: "For serious fitness enthusiasts",
          price: 79.99,
          interval: "month",
          tier: "pro",
          maxClassesPerWeek: 10,
          maxCheckInsPerDay: 2,
          hasTrainerAccess: true,
          hasPersonalTraining: false,
          hasProgressTracking: true,
          hasAchievements: true,
        },
        {
          name: "Premium",
          description: "The ultimate fitness experience",
          price: 149.99,
          interval: "month",
          tier: "premium",
          maxClassesPerWeek: 999,
          maxCheckInsPerDay: 999,
          hasTrainerAccess: true,
          hasPersonalTraining: true,
          hasProgressTracking: true,
          hasAchievements: true,
        },
      ])
      console.log("✅ Created subscription plans")
    }

    const plans = await db.select().from(subscriptionPlans)

    for (let i = 0; i < memberUsers.length; i++) {
      const user = memberUsers[i]
      const joinDate = new Date()
      joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 90))

      const [member] = await db.insert(members).values({
        userId: user.id,
        phone: `555-${String(1000 + i).padStart(4, '0')}`,
        joinDate,
        status: "active",
        qrCode: `QR-${user.id}`,
      }).returning()

      let planId = plans[0]?.id
      if (i === 1 && plans[1]) planId = plans[1].id
      if (i === 2 && plans[2]) planId = plans[2].id

      if (planId) {
        await db.insert(memberSubscriptions).values({
          memberId: member.id,
          planId,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
      }
    }
    console.log("✅ Created member users with subscriptions")
  }

  const existingClasses = await db.select().from(classes)
  if (existingClasses.length === 0) {
    const classData = [
      { name: "Morning HIIT", color: "#ef4444", durationMinutes: 45, maxCapacity: 20 },
      { name: "Yoga Flow", color: "#8b5cf6", durationMinutes: 60, maxCapacity: 15 },
      { name: "Strength Training", color: "#3b82f6", durationMinutes: 60, maxCapacity: 12 },
      { name: "Spin Class", color: "#10b981", durationMinutes: 45, maxCapacity: 25 },
      { name: "Pilates", color: "#f59e0b", durationMinutes: 50, maxCapacity: 18 },
    ]

    const createdClasses = []
    for (const c of classData) {
      const [cls] = await db.insert(classes).values({
        name: c.name,
        maxCapacity: c.maxCapacity,
        durationMinutes: c.durationMinutes,
        color: c.color,
      }).returning()
      createdClasses.push(cls)
    }

    const times = ["06:00", "07:00", "09:00", "12:00", "17:00", "18:00"]
    const rooms = ["Room A", "Room B", "Studio 1", "Main Floor"]

    for (let day = 1; day <= 5; day++) {
      for (let i = 0; i < createdClasses.length; i++) {
        const time = times[i % times.length]
        const room = rooms[i % rooms.length]
        await db.insert(classSchedules).values({
          classId: createdClasses[i].id,
          dayOfWeek: day,
          startTime: time,
          room,
        })
      }
    }
    console.log("✅ Created classes and schedules")
  }

  console.log("\n🎉 Seed completed!")
  console.log("\n📋 Test Accounts:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("👤 Admin:    admin@gymflow.com / password123")
  console.log("👤 Trainer:   trainer@gymflow.com / password123")
  console.log("👤 Member 1:  member1@gymflow.com / password123")
  console.log("👤 Member 2:  member2@gymflow.com / password123")
  console.log("👤 Member 3: member3@gymflow.com / password123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

seed().catch(console.error)
