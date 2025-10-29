import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (with error handling for missing tables)

  try {
    await prisma.upload.deleteMany()
    await prisma.lawyer.deleteMany()
    await prisma.engineer.deleteMany()
    await prisma.doctor.deleteMany()
    await prisma.teacher.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.passwordResetToken.deleteMany()
    await prisma.user.deleteMany()
    await prisma.role.deleteMany()
  } catch (error: any) {
    if (error.code !== 'P2021') {
      throw error
    }
    console.log('⚠️  Some tables do not exist yet, continuing with seed...')
  }

  // Create default roles first
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full system administrator with complete access',
      isActive: true,
    },
  })

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      description: 'Management role for overseeing operations',
      isActive: true,
    },
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Standard user role for regular system access',
      isActive: true,
    },
  })

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 12)
  
  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    // Manager user
    prisma.user.create({
      data: {
        username: 'manager',
        email: 'manager@example.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Johnson',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    // Regular users (8 additional users)
    prisma.user.create({
      data: {
        username: 'analyst',
        email: 'analyst@example.com',
        passwordHash,
        firstName: 'Michael',
        lastName: 'Chen',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'jdoe',
        email: 'john.doe@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'asmith',
        email: 'alice.smith@example.com',
        passwordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'bwilson',
        email: 'bob.wilson@example.com',
        passwordHash,
        firstName: 'Bob',
        lastName: 'Wilson',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'cdavis',
        email: 'carol.davis@example.com',
        passwordHash,
        firstName: 'Carol',
        lastName: 'Davis',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'dlee',
        email: 'david.lee@example.com',
        passwordHash,
        firstName: 'David',
        lastName: 'Lee',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: false, // Inactive user for testing
      },
    }),
    prisma.user.create({
      data: {
        username: 'emartinez',
        email: 'elena.martinez@example.com',
        passwordHash,
        firstName: 'Elena',
        lastName: 'Martinez',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'fthompson',
        email: 'frank.thompson@example.com',
        passwordHash,
        firstName: 'Frank',
        lastName: 'Thompson',
        roleId: userRole.id,
        emailVerified: null, // Unverified user for testing
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${users.length} test users`)

  // Create sample Teachers (all assigned to admin user for testing)
  const teachers = []
  for (let i = 0; i < 100; i++) {
    const teacher = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      employeeId: `T${faker.string.numeric(6)}`,
      department: faker.helpers.arrayElement(['Mathematics', 'Science', 'English', 'History', 'Arts']),
      subject: faker.helpers.arrayElement(['Algebra', 'Physics', 'Literature', 'World History', 'Painting']),
      yearsOfExperience: faker.number.int({ min: 1, max: 25 }),
      salary: faker.number.float({ min: 30000, max: 80000, multipleOf: 1000 }),
      hireDate: faker.date.past({ years: 10 }),
      isActive: faker.datatype.boolean(),
// No user assignment - global data
    }
    teachers.push(teacher)
  }

  const createdTeachers = await prisma.teacher.createMany({
    data: teachers,
  })
  console.log(`✅ Created ${createdTeachers.count} Teacher records`)

  // Create sample Doctors (all assigned to admin user for testing)
  const doctors = []
  for (let i = 0; i < 100; i++) {
    const doctor = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      employeeId: `D${faker.string.numeric(6)}`,
      department: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Pediatrics', 'Surgery', 'Emergency']),
      specialization: faker.helpers.arrayElement(['Interventional Cardiology', 'Pediatric Neurology', 'General Surgery']),
      licenseNumber: `MD${faker.string.alphanumeric(8).toUpperCase()}`,
      yearsOfExperience: faker.number.int({ min: 2, max: 30 }),
      salary: faker.number.float({ min: 80000, max: 300000, multipleOf: 1000 }),
      isActive: faker.datatype.boolean(),
// No user assignment - global data
    }
    doctors.push(doctor)
  }

  const createdDoctors = await prisma.doctor.createMany({
    data: doctors,
  })
  console.log(`✅ Created ${createdDoctors.count} Doctor records`)

  // Create sample Engineers (all assigned to admin user for testing)
  const engineers = []
  for (let i = 0; i < 100; i++) {
    const engineer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      employeeId: `E${faker.string.numeric(6)}`,
      department: faker.helpers.arrayElement(['Software', 'Hardware', 'Civil', 'Mechanical', 'Electrical']),
      specialization: faker.helpers.arrayElement(['Full Stack Development', 'Machine Learning', 'Structural Design']),
      engineeringType: faker.helpers.arrayElement(['Software', 'Hardware', 'Civil', 'Mechanical', 'Electrical']),
      yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
      salary: faker.number.float({ min: 60000, max: 150000, multipleOf: 1000 }),
      isActive: faker.datatype.boolean(),
// No user assignment - global data
    }
    engineers.push(engineer)
  }

  const createdEngineers = await prisma.engineer.createMany({
    data: engineers,
  })
  console.log(`✅ Created ${createdEngineers.count} Engineer records`)

  // Create sample Lawyers (all assigned to admin user for testing)
  const lawyers = []
  for (let i = 0; i < 100; i++) {
    const lawyer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      employeeId: `L${faker.string.numeric(6)}`,
      department: faker.helpers.arrayElement(['Corporate', 'Criminal', 'Family', 'Real Estate', 'Intellectual Property']),
      practiceArea: faker.helpers.arrayElement(['Corporate Law', 'Criminal Defense', 'Family Law', 'Real Estate Law']),
      barNumber: `BAR${faker.string.alphanumeric(8).toUpperCase()}`,
      yearsOfExperience: faker.number.int({ min: 3, max: 25 }),
      salary: faker.number.float({ min: 70000, max: 200000, multipleOf: 1000 }),
      isActive: faker.datatype.boolean(),
// No user assignment - global data
    }
    lawyers.push(lawyer)
  }

  const createdLawyers = await prisma.lawyer.createMany({
    data: lawyers,
  })
  console.log(`✅ Created ${createdLawyers.count} Lawyer records`)

  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`  • 3 Roles created`)
  console.log(`  • ${users.length} Users created`)
  console.log(`  • 100 Teachers created`)
  console.log(`  • 100 Doctors created`)
  console.log(`  • 100 Engineers created`)
  console.log(`  • 100 Lawyers created`)
  console.log(`  • 100 Master Data entries created`)
  console.log('\n📋 Test accounts (all use password: password123):')
  console.log('  🔑 Admin: admin@example.com (Admin role)')
  console.log('  👥 Manager: manager@example.com (Manager role)')
  console.log('  👤 Analyst: analyst@example.com (User role)')
  console.log('  👤 John Doe: john.doe@example.com (User role)')
  console.log('  👤 Alice Smith: alice.smith@example.com (User role)')
  console.log('  👥 Bob Wilson: bob.wilson@example.com (Manager role)')
  console.log('  👤 Carol Davis: carol.davis@example.com (User role)')
  console.log('  ❌ David Lee: david.lee@example.com (User role - INACTIVE)')
  console.log('  👤 Elena Martinez: elena.martinez@example.com (User role)')
  console.log('  ⚠️  Frank Thompson: frank.thompson@example.com (User role - UNVERIFIED)')
  console.log('\n🔐 All users have the same password: password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
