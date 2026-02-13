import 'dotenv/config';
import { db } from './lib/db';
import { 
  users, session, account, verification, subscription,
  members, trainers, subscriptionPlans, memberSubscriptions,
  attendance, trainerAttendance, exercises, workoutPlans,
  workoutPlanAssignments, planExercises, measurements,
  progressPhotos, personalRecords, achievements, memberAchievements,
  classes, classSchedules, classBookings, equipment,
  equipmentMaintenance, messages, contactMessages
} from './lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex } from '@noble/hashes/utils.js';

const TEST_PASSWORD = 'password123';

// Match better-auth's scrypt config exactly
const scryptConfig = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
};

async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
  const key = await scryptAsync(password.normalize('NFKC'), salt, scryptConfig);
  return `${salt}:${bytesToHex(key)}`;
}

async function generateUserId(): Promise<string> {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

async function generateAccountId(): Promise<string> {
  return `acc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

async function generateSessionId(): Promise<string> {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

async function generateToken(): Promise<string> {
  return `tok_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

async function clearAllTables() {
  console.log('Clearing all tables...');
  
  await db.delete(memberAchievements);
  await db.delete(achievements);
  await db.delete(personalRecords);
  await db.delete(progressPhotos);
  await db.delete(measurements);
  await db.delete(planExercises);
  await db.delete(workoutPlanAssignments);
  await db.delete(workoutPlans);
  await db.delete(classBookings);
  await db.delete(classSchedules);
  await db.delete(classes);
  await db.delete(exercises);
  await db.delete(equipmentMaintenance);
  await db.delete(equipment);
  await db.delete(messages);
  await db.delete(contactMessages);
  await db.delete(memberSubscriptions);
  await db.delete(subscriptionPlans);
  await db.delete(trainerAttendance);
  await db.delete(attendance);
  await db.delete(trainers);
  await db.delete(members);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(subscription);
  await db.delete(users);
  
  console.log('All tables cleared.');
}

async function createUserWithRole(
  name: string,
  email: string,
  role: 'member' | 'trainer' | 'admin',
  phone?: string
) {
  const userId = await generateUserId();
  const hashedPassword = await hashPassword(TEST_PASSWORD);
  
  await db.insert(users).values({
    id: userId,
    name,
    email,
    emailVerified: true,
    role,
    phone: phone || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(account).values({
    id: await generateAccountId(),
    accountId: userId,
    providerId: 'credential',
    userId,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return userId;
}

async function seed() {
  console.log('Starting seed process...');
  
  await clearAllTables();
  
  console.log('Creating subscription plans...');
  const basicPlan = await db.insert(subscriptionPlans).values({
    name: 'Basic',
    description: 'Basic gym access with limited classes',
    price: '29.99',
    interval: 'month',
    tier: 'basic',
    maxClassesPerMonth: 8,
    maxCheckInsPerDay: 1,
    hasTrainerAccess: false,
    hasPersonalTraining: false,
    hasProgressTracking: true,
    hasAchievements: true,
    isActive: true,
  }).returning();
  
  const premiumPlan = await db.insert(subscriptionPlans).values({
    name: 'Premium',
    description: 'Full gym access with unlimited classes and trainer access',
    price: '59.99',
    interval: 'month',
    tier: 'premium',
    maxClassesPerMonth: 999,
    maxCheckInsPerDay: 999,
    hasTrainerAccess: true,
    hasPersonalTraining: false,
    hasProgressTracking: true,
    hasAchievements: true,
    isActive: true,
  }).returning();
  
  const proPlan = await db.insert(subscriptionPlans).values({
    name: 'Pro',
    description: 'Ultimate access with personal training sessions',
    price: '99.99',
    interval: 'month',
    tier: 'pro',
    maxClassesPerMonth: 999,
    maxCheckInsPerDay: 999,
    hasTrainerAccess: true,
    hasPersonalTraining: true,
    hasProgressTracking: true,
    hasAchievements: true,
    isActive: true,
  }).returning();

  console.log('Creating users...');
  
  // 2 Admins
  const admin1Id = await createUserWithRole('Admin One', 'admin1@gym.com', 'admin', '+1234567890');
  const admin2Id = await createUserWithRole('Admin Two', 'admin2@gym.com', 'admin', '+1234567891');
  
  // 2 Trainers
  const trainer1Id = await createUserWithRole('John Smith', 'john@gym.com', 'trainer', '+1234567892');
  const trainer2Id = await createUserWithRole('Sarah Johnson', 'sarah@gym.com', 'trainer', '+1234567893');
  
  // 6 Members
  const member1Id = await createUserWithRole('Mike Wilson', 'mike@email.com', 'member', '+1234567894');
  const member2Id = await createUserWithRole('Emily Brown', 'emily@email.com', 'member', '+1234567895');
  const member3Id = await createUserWithRole('David Lee', 'david@email.com', 'member', '+1234567896');
  const member4Id = await createUserWithRole('Jessica Davis', 'jessica@email.com', 'member', '+1234567897');
  const member5Id = await createUserWithRole('Chris Martinez', 'chris@email.com', 'member', '+1234567898');
  const member6Id = await createUserWithRole('Amanda Taylor', 'amanda@email.com', 'member', '+1234567899');

  console.log('Creating members table records...');
  
  // Create member records
  const member1Rec = await db.insert(members).values({
    userId: member1Id,
    phone: '+1234567894',
    joinDate: new Date('2024-01-15'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-1`,
  }).returning();
  
  const member2Rec = await db.insert(members).values({
    userId: member2Id,
    phone: '+1234567895',
    joinDate: new Date('2024-02-20'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-2`,
  }).returning();
  
  const member3Rec = await db.insert(members).values({
    userId: member3Id,
    phone: '+1234567896',
    joinDate: new Date('2024-03-10'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-3`,
  }).returning();
  
  const member4Rec = await db.insert(members).values({
    userId: member4Id,
    phone: '+1234567897',
    joinDate: new Date('2024-04-05'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-4`,
  }).returning();
  
  const member5Rec = await db.insert(members).values({
    userId: member5Id,
    phone: '+1234567898',
    joinDate: new Date('2024-05-12'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-5`,
  }).returning();
  
  const member6Rec = await db.insert(members).values({
    userId: member6Id,
    phone: '+1234567899',
    joinDate: new Date('2024-06-18'),
    status: 'active',
    qrCode: `GYM-MEMBER-${Date.now()}-6`,
  }).returning();

  console.log('Creating trainers table records...');
  
  const trainer1Rec = await db.insert(trainers).values({
    userId: trainer1Id,
    bio: 'Certified personal trainer with 10+ years of experience in strength training and HIIT.',
    specialization: 'Strength Training, HIIT, Sports Performance',
    certifications: 'NASM-CPT, ACE-CPT, TRX Certified',
    maxClients: 20,
    hourlyRate: '75.00',
    isActive: true,
  }).returning();
  
  const trainer2Rec = await db.insert(trainers).values({
    userId: trainer2Id,
    bio: 'Expert in yoga, pilates and functional fitness. Helping members achieve flexibility and balance.',
    specialization: 'Yoga, Pilates, Functional Fitness',
    certifications: 'RYT-500, Pilates Certified, ACE-CPT',
    maxClients: 15,
    hourlyRate: '65.00',
    isActive: true,
  }).returning();

  console.log('Creating member subscriptions...');
  
  await db.insert(memberSubscriptions).values({
    memberId: member1Rec[0].id,
    planId: basicPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-01-15'),
    currentPeriodEnd: new Date('2025-02-15'),
    seats: 1,
  });
  
  await db.insert(memberSubscriptions).values({
    memberId: member2Rec[0].id,
    planId: premiumPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-02-20'),
    currentPeriodEnd: new Date('2025-02-20'),
    seats: 1,
  });
  
  await db.insert(memberSubscriptions).values({
    memberId: member3Rec[0].id,
    planId: premiumPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-03-10'),
    currentPeriodEnd: new Date('2025-03-10'),
    seats: 1,
  });
  
  await db.insert(memberSubscriptions).values({
    memberId: member4Rec[0].id,
    planId: proPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-04-05'),
    currentPeriodEnd: new Date('2025-04-05'),
    seats: 1,
  });
  
  await db.insert(memberSubscriptions).values({
    memberId: member5Rec[0].id,
    planId: basicPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-05-12'),
    currentPeriodEnd: new Date('2025-05-12'),
    seats: 1,
  });
  
  await db.insert(memberSubscriptions).values({
    memberId: member6Rec[0].id,
    planId: proPlan[0].id,
    status: 'active',
    currentPeriodStart: new Date('2024-06-18'),
    currentPeriodEnd: new Date('2025-06-18'),
    seats: 1,
  });

  console.log('Creating attendance records...');
  
  // Member attendance
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    await db.insert(attendance).values({
      memberId: member1Rec[0].id,
      checkInTime: date,
      date: date.toISOString().split('T')[0],
      method: i % 3 === 0 ? 'qr_code' : 'manual',
    });
  }
  
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    await db.insert(attendance).values({
      memberId: member2Rec[0].id,
      checkInTime: date,
      date: date.toISOString().split('T')[0],
      method: 'qr_code',
    });
  }

  // Trainer attendance
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8, 0, 0, 0);
    
    const checkOut = new Date(date);
    checkOut.setHours(17, 0, 0, 0);
    
    await db.insert(trainerAttendance).values({
      trainerId: trainer1Rec[0].id,
      checkInTime: date,
      checkOutTime: checkOut,
      date: date.toISOString().split('T')[0],
      status: 'completed',
    });
  }

  console.log('Creating exercises...');
  
  const exerciseData = [
    { name: 'Bench Press', category: 'Chest', muscleGroup: 'Pectorals' },
    { name: 'Squat', category: 'Legs', muscleGroup: 'Quadriceps' },
    { name: 'Deadlift', category: 'Back', muscleGroup: 'Lower Back' },
    { name: 'Pull Up', category: 'Back', muscleGroup: 'Lats' },
    { name: 'Overhead Press', category: 'Shoulders', muscleGroup: 'Deltoids' },
    { name: 'Barbell Row', category: 'Back', muscleGroup: 'Lats' },
    { name: 'Leg Press', category: 'Legs', muscleGroup: 'Quadriceps' },
    { name: 'Dumbbell Curl', category: 'Arms', muscleGroup: 'Biceps' },
    { name: 'Tricep Pushdown', category: 'Arms', muscleGroup: 'Triceps' },
    { name: 'Lat Pulldown', category: 'Back', muscleGroup: 'Lats' },
    { name: 'Leg Curl', category: 'Legs', muscleGroup: 'Hamstrings' },
    { name: 'Chest Fly', category: 'Chest', muscleGroup: 'Pectorals' },
    { name: 'Shoulder Lateral Raise', category: 'Shoulders', muscleGroup: 'Deltoids' },
    { name: 'Plank', category: 'Core', muscleGroup: 'Abs' },
    { name: 'Cable Crunch', category: 'Core', muscleGroup: 'Abs' },
  ];
  
  const insertedExercises = await db.insert(exercises).values(
    exerciseData.map(ex => ({
      ...ex,
      description: `Perform ${ex.name} with proper form`,
    }))
  ).returning();

  console.log('Creating workout plans...');
  
  const plan1 = await db.insert(workoutPlans).values({
    trainerId: trainer1Rec[0].id,
    name: 'Strength Builder',
    description: '8-week strength training program for beginners',
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    isActive: true,
  }).returning();
  
  const plan2 = await db.insert(workoutPlans).values({
    trainerId: trainer1Rec[0].id,
    name: 'Hiit Fat Burner',
    description: 'High intensity interval training for fat loss',
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    isActive: true,
  }).returning();
  
  const plan3 = await db.insert(workoutPlans).values({
    trainerId: trainer2Rec[0].id,
    name: 'Yoga Flow',
    description: 'Weekly yoga sessions for flexibility',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    isActive: true,
  }).returning();

  console.log('Creating workout plan exercises...');
  
  await db.insert(planExercises).values({
    planId: plan1[0].id,
    exerciseId: insertedExercises[0].id,
    sets: 4,
    reps: '8-10',
    weight: '135',
    restSeconds: 90,
    orderIndex: 0,
  });
  
  await db.insert(planExercises).values({
    planId: plan1[0].id,
    exerciseId: insertedExercises[1].id,
    sets: 4,
    reps: '10-12',
    weight: '185',
    restSeconds: 120,
    orderIndex: 1,
  });
  
  await db.insert(planExercises).values({
    planId: plan1[0].id,
    exerciseId: insertedExercises[2].id,
    sets: 3,
    reps: '5',
    weight: '225',
    restSeconds: 180,
    orderIndex: 2,
  });
  
  await db.insert(planExercises).values({
    planId: plan2[0].id,
    exerciseId: insertedExercises[7].id,
    sets: 3,
    reps: '12-15',
    weight: '25',
    restSeconds: 30,
    orderIndex: 0,
  });
  
  await db.insert(planExercises).values({
    planId: plan3[0].id,
    exerciseId: insertedExercises[13].id,
    sets: 3,
    reps: '60 sec',
    weight: null,
    restSeconds: 15,
    orderIndex: 0,
  });

  console.log('Creating workout plan assignments...');
  
  await db.insert(workoutPlanAssignments).values({
    planId: plan1[0].id,
    memberId: member1Rec[0].id,
  });
  
  await db.insert(workoutPlanAssignments).values({
    planId: plan1[0].id,
    memberId: member3Rec[0].id,
  });
  
  await db.insert(workoutPlanAssignments).values({
    planId: plan2[0].id,
    memberId: member2Rec[0].id,
  });
  
  await db.insert(workoutPlanAssignments).values({
    planId: plan3[0].id,
    memberId: member4Rec[0].id,
  });

  console.log('Creating measurements...');
  
  // Member 1 measurements
  await db.insert(measurements).values({
    memberId: member1Rec[0].id,
    date: '2024-01-15',
    weight: '180.5',
    bodyFat: '22.0',
    chest: '42.0',
    waist: '34.0',
    hips: '38.0',
    arms: '15.0',
    thighs: '22.0',
    notes: 'Initial measurement',
  });
  
  await db.insert(measurements).values({
    memberId: member1Rec[0].id,
    date: '2024-06-15',
    weight: '175.0',
    bodyFat: '19.5',
    chest: '43.0',
    waist: '32.5',
    hips: '37.5',
    arms: '15.5',
    thighs: '22.5',
    notes: 'Making good progress!',
  });
  
  await db.insert(measurements).values({
    memberId: member1Rec[0].id,
    date: '2024-12-15',
    weight: '170.0',
    bodyFat: '17.0',
    chest: '44.0',
    waist: '31.0',
    hips: '37.0',
    arms: '16.0',
    thighs: '23.0',
    notes: 'Great transformation!',
  });
  
  // Member 2 measurements
  await db.insert(measurements).values({
    memberId: member2Rec[0].id,
    date: '2024-02-20',
    weight: '145.0',
    bodyFat: '28.0',
    chest: '36.0',
    waist: '28.0',
    hips: '36.0',
    arms: '12.0',
    thighs: '20.0',
  });
  
  await db.insert(measurements).values({
    memberId: member2Rec[0].id,
    date: '2024-08-20',
    weight: '138.0',
    bodyFat: '24.0',
    chest: '37.0',
    waist: '26.5',
    hips: '35.0',
    arms: '12.5',
    thighs: '20.5',
  });

  console.log('Creating personal records...');
  
  await db.insert(personalRecords).values({
    memberId: member1Rec[0].id,
    exerciseName: 'Bench Press',
    weight: '185',
    reps: 5,
    date: '2024-06-01',
  });
  
  await db.insert(personalRecords).values({
    memberId: member1Rec[0].id,
    exerciseName: 'Squat',
    weight: '225',
    reps: 8,
    date: '2024-08-15',
  });
  
  await db.insert(personalRecords).values({
    memberId: member1Rec[0].id,
    exerciseName: 'Deadlift',
    weight: '275',
    reps: 5,
    date: '2024-10-01',
  });
  
  await db.insert(personalRecords).values({
    memberId: member3Rec[0].id,
    exerciseName: 'Bench Press',
    weight: '145',
    reps: 10,
    date: '2024-07-20',
  });

  console.log('Creating achievements...');
  
  const achievement1 = await db.insert(achievements).values({
    name: 'First Check-in',
    description: 'Attend your first gym session',
    icon: '🏃',
    criteriaType: 'attendance',
    criteriaValue: 1,
    points: 10,
  }).returning();
  
  const achievement2 = await db.insert(achievements).values({
    name: 'Dedicated Member',
    description: 'Check in 10 times',
    icon: '⭐',
    criteriaType: 'attendance',
    criteriaValue: 10,
    points: 50,
  }).returning();
  
  const achievement3 = await db.insert(achievements).values({
    name: 'Gym Enthusiast',
    description: 'Check in 50 times',
    icon: '🔥',
    criteriaType: 'attendance',
    criteriaValue: 50,
    points: 200,
  }).returning();
  
  const achievement4 = await db.insert(achievements).values({
    name: 'First PR',
    description: 'Set your first personal record',
    icon: '💪',
    criteriaType: 'personal_record',
    criteriaValue: 1,
    points: 25,
  }).returning();
  
  const achievement5 = await db.insert(achievements).values({
    name: 'Consistent',
    description: 'Maintain a 4-week streak',
    icon: '🏆',
    criteriaType: 'streak',
    criteriaValue: 28,
    points: 100,
  }).returning();

  console.log('Creating member achievements...');
  
  await db.insert(memberAchievements).values({
    memberId: member1Rec[0].id,
    achievementId: achievement1[0].id,
  });
  
  await db.insert(memberAchievements).values({
    memberId: member1Rec[0].id,
    achievementId: achievement2[0].id,
  });
  
  await db.insert(memberAchievements).values({
    memberId: member1Rec[0].id,
    achievementId: achievement4[0].id,
  });
  
  await db.insert(memberAchievements).values({
    memberId: member2Rec[0].id,
    achievementId: achievement1[0].id,
  });

  console.log('Creating classes...');
  
  const class1 = await db.insert(classes).values({
    name: 'Morning HIIT',
    trainerId: trainer1Rec[0].id,
    maxCapacity: 20,
    durationMinutes: 45,
    description: 'High intensity interval training to start your day',
    color: '#ef4444',
  }).returning();
  
  const class2 = await db.insert(classes).values({
    name: 'Power Yoga',
    trainerId: trainer2Rec[0].id,
    maxCapacity: 15,
    durationMinutes: 60,
    description: 'Strength building yoga session',
    color: '#8b5cf6',
  }).returning();
  
  const class3 = await db.insert(classes).values({
    name: 'Strength Training',
    trainerId: trainer1Rec[0].id,
    maxCapacity: 12,
    durationMinutes: 60,
    description: 'Full body strength training',
    color: '#3b82f6',
  }).returning();
  
  const class4 = await db.insert(classes).values({
    name: 'Pilates',
    trainerId: trainer2Rec[0].id,
    maxCapacity: 15,
    durationMinutes: 50,
    description: 'Core focused pilates class',
    color: '#10b981',
  }).returning();

  console.log('Creating class schedules...');
  
  await db.insert(classSchedules).values({
    classId: class1[0].id,
    dayOfWeek: 1,
    startTime: '07:00:00',
    room: 'Room A',
  });
  
  await db.insert(classSchedules).values({
    classId: class1[0].id,
    dayOfWeek: 3,
    startTime: '07:00:00',
    room: 'Room A',
  });
  
  await db.insert(classSchedules).values({
    classId: class1[0].id,
    dayOfWeek: 5,
    startTime: '07:00:00',
    room: 'Room A',
  });
  
  await db.insert(classSchedules).values({
    classId: class2[0].id,
    dayOfWeek: 2,
    startTime: '18:00:00',
    room: 'Yoga Studio',
  });
  
  await db.insert(classSchedules).values({
    classId: class2[0].id,
    dayOfWeek: 4,
    startTime: '18:00:00',
    room: 'Yoga Studio',
  });
  
  await db.insert(classSchedules).values({
    classId: class3[0].id,
    dayOfWeek: 2,
    startTime: '10:00:00',
    room: 'Weight Room',
  });
  
  await db.insert(classSchedules).values({
    classId: class3[0].id,
    dayOfWeek: 4,
    startTime: '10:00:00',
    room: 'Weight Room',
  });
  
  await db.insert(classSchedules).values({
    classId: class4[0].id,
    dayOfWeek: 3,
    startTime: '19:00:00',
    room: 'Yoga Studio',
  });
  
  await db.insert(classSchedules).values({
    classId: class4[0].id,
    dayOfWeek: 6,
    startTime: '10:00:00',
    room: 'Yoga Studio',
  });

  const schedules = await db.select().from(classSchedules);

  console.log('Creating class bookings...');
  
  await db.insert(classBookings).values({
    scheduleId: schedules[0].id,
    memberId: member1Rec[0].id,
    bookingDate: '2024-12-16',
    status: 'confirmed',
  });
  
  await db.insert(classBookings).values({
    scheduleId: schedules[0].id,
    memberId: member2Rec[0].id,
    bookingDate: '2024-12-16',
    status: 'confirmed',
  });
  
  await db.insert(classBookings).values({
    scheduleId: schedules[4].id,
    memberId: member4Rec[0].id,
    bookingDate: '2024-12-19',
    status: 'confirmed',
  });
  
  await db.insert(classBookings).values({
    scheduleId: schedules[6].id,
    memberId: member3Rec[0].id,
    bookingDate: '2024-12-17',
    status: 'confirmed',
  });

  console.log('Creating equipment...');
  
  await db.insert(equipment).values({
    name: 'Treadmill #1',
    category: 'Cardio',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    lastMaintenance: '2024-11-01',
    nextMaintenance: '2025-02-01',
    status: 'active',
    qrCode: 'EQ-TREAD-001',
  });
  
  await db.insert(equipment).values({
    name: 'Treadmill #2',
    category: 'Cardio',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    lastMaintenance: '2024-11-15',
    nextMaintenance: '2025-02-15',
    status: 'active',
    qrCode: 'EQ-TREAD-002',
  });
  
  await db.insert(equipment).values({
    name: 'Squat Rack #1',
    category: 'Strength',
    purchaseDate: '2022-06-01',
    warrantyExpiry: '2025-06-01',
    lastMaintenance: '2024-10-20',
    nextMaintenance: '2025-01-20',
    status: 'active',
    qrCode: 'EQ-SQUAT-001',
  });
  
  await db.insert(equipment).values({
    name: 'Bench Press #1',
    category: 'Strength',
    purchaseDate: '2022-06-01',
    warrantyExpiry: '2025-06-01',
    lastMaintenance: '2024-10-20',
    nextMaintenance: '2025-01-20',
    status: 'active',
    qrCode: 'EQ-BENCH-001',
  });
  
  await db.insert(equipment).values({
    name: 'Leg Press Machine',
    category: 'Strength',
    purchaseDate: '2022-08-15',
    warrantyExpiry: '2025-08-15',
    lastMaintenance: '2024-11-10',
    nextMaintenance: '2025-02-10',
    status: 'active',
    qrCode: 'EQ-LEG-001',
  });
  
  await db.insert(equipment).values({
    name: 'Cable Machine #1',
    category: 'Strength',
    purchaseDate: '2022-06-01',
    warrantyExpiry: '2025-06-01',
    lastMaintenance: '2024-09-15',
    nextMaintenance: '2024-12-15',
    status: 'maintenance',
    qrCode: 'EQ-CABLE-001',
  });
  
  await db.insert(equipment).values({
    name: 'Elliptical #1',
    category: 'Cardio',
    purchaseDate: '2023-03-20',
    warrantyExpiry: '2026-03-20',
    lastMaintenance: '2024-11-01',
    nextMaintenance: '2025-02-01',
    status: 'active',
    qrCode: 'EQ-ELLIP-001',
  });
  
  await db.insert(equipment).values({
    name: 'Spin Bike #1',
    category: 'Cardio',
    purchaseDate: '2023-05-10',
    warrantyExpiry: '2026-05-10',
    lastMaintenance: '2024-10-25',
    nextMaintenance: '2025-01-25',
    status: 'active',
    qrCode: 'EQ-SPIN-001',
  });

  console.log('Creating equipment maintenance records...');
  
  const allEquipment = await db.select().from(equipment);
  
  await db.insert(equipmentMaintenance).values({
    equipmentId: allEquipment[0].id,
    maintenanceDate: '2024-11-01',
    description: 'Routine cleaning and lubrication',
    cost: '50.00',
    performedBy: 'Maintenance Team',
  });
  
  await db.insert(equipmentMaintenance).values({
    equipmentId: allEquipment[5].id,
    maintenanceDate: '2024-12-01',
    description: 'Replaced damaged cables',
    cost: '150.00',
    performedBy: 'Professional Technician',
  });
  
  await db.insert(equipmentMaintenance).values({
    equipmentId: allEquipment[2].id,
    maintenanceDate: '2024-10-20',
    description: 'Bolt tightening and safety check',
    cost: '30.00',
    performedBy: 'Maintenance Team',
  });

  console.log('Creating contact messages...');
  
  await db.insert(contactMessages).values({
    name: 'John Doe',
    email: 'john.doe@email.com',
    message: 'I would like to inquire about personal training sessions.',
    status: 'new',
  });
  
  await db.insert(contactMessages).values({
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    message: 'What are your membership options for couples?',
    status: 'responded',
  });
  
  await db.insert(contactMessages).values({
    name: 'Bob Wilson',
    email: 'bob.wilson@email.com',
    message: 'The equipment in the weight room needs maintenance.',
    status: 'in_progress',
  });

  console.log('Creating messages between users...');
  
  await db.insert(messages).values({
    senderId: member1Id,
    receiverId: trainer1Id,
    content: 'Hi John, I have a question about my workout plan.',
    isRead: true,
    createdAt: new Date('2024-12-10T10:00:00'),
  });
  
  await db.insert(messages).values({
    senderId: trainer1Id,
    receiverId: member1Id,
    content: 'Sure Mike! What would you like to know?',
    isRead: true,
    createdAt: new Date('2024-12-10T10:30:00'),
  });
  
  await db.insert(messages).values({
    senderId: member2Id,
    receiverId: trainer2Id,
    content: 'Can we schedule an additional session this week?',
    isRead: false,
    createdAt: new Date('2024-12-15T14:00:00'),
  });

  console.log('\n========================================');
  console.log('SEED COMPLETED SUCCESSFULLY!');
  console.log('========================================\n');
  console.log('Test Users Created:');
  console.log('-------------------');
  console.log('Admins:');
  console.log('  - admin1@gym.com / password123');
  console.log('  - admin2@gym.com / password123');
  console.log('');
  console.log('Trainers:');
  console.log('  - john@gym.com / password123');
  console.log('  - sarah@gym.com / password123');
  console.log('');
  console.log('Members:');
  console.log('  - mike@email.com / password123');
  console.log('  - emily@email.com / password123');
  console.log('  - david@email.com / password123');
  console.log('  - jessica@email.com / password123');
  console.log('  - chris@email.com / password123');
  console.log('  - amanda@email.com / password123');
  console.log('');
  console.log('All users have the password: password123');
  console.log('========================================\n');
}

seed().catch(console.error);
