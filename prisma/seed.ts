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

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Standard user role for regular system access',
      isActive: true,
    },
  })

  const supervisorRole = await prisma.role.create({
    data: {
      name: 'Supervisor',
      description: 'Supervisory role with team oversight responsibilities',
      isActive: true,
    },
  })

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      description: 'Management role for overseeing operations and departments',
      isActive: true,
    },
  })

  const directorRole = await prisma.role.create({
    data: {
      name: 'Director',
      description: 'Executive director role with strategic decision-making authority',
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
        firstName: 'Alexandra',
        lastName: 'Mitchell',
        roleId: adminRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),

    // 4 Users
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
        username: 'rjohnson',
        email: 'robert.johnson@example.com',
        passwordHash,
        firstName: 'Robert',
        lastName: 'Johnson',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'mbrown',
        email: 'maria.brown@example.com',
        passwordHash,
        firstName: 'Maria',
        lastName: 'Brown',
        roleId: userRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),

    // 4 Supervisors
    prisma.user.create({
      data: {
        username: 'sadams',
        email: 'sarah.adams@example.com',
        passwordHash,
        firstName: 'Sarah',
        lastName: 'Adams',
        roleId: supervisorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'dmartinez',
        email: 'david.martinez@example.com',
        passwordHash,
        firstName: 'David',
        lastName: 'Martinez',
        roleId: supervisorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'lthompson',
        email: 'lisa.thompson@example.com',
        passwordHash,
        firstName: 'Lisa',
        lastName: 'Thompson',
        roleId: supervisorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'jwilson',
        email: 'james.wilson@example.com',
        passwordHash,
        firstName: 'James',
        lastName: 'Wilson',
        roleId: supervisorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),

    // 4 Managers
    prisma.user.create({
      data: {
        username: 'staylor',
        email: 'steven.taylor@example.com',
        passwordHash,
        firstName: 'Steven',
        lastName: 'Taylor',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'manderson',
        email: 'michelle.anderson@example.com',
        passwordHash,
        firstName: 'Michelle',
        lastName: 'Anderson',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'bthomas',
        email: 'brian.thomas@example.com',
        passwordHash,
        firstName: 'Brian',
        lastName: 'Thomas',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'jrodriguez',
        email: 'jennifer.rodriguez@example.com',
        passwordHash,
        firstName: 'Jennifer',
        lastName: 'Rodriguez',
        roleId: managerRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),

    // 4 Directors
    prisma.user.create({
      data: {
        username: 'cwhite',
        email: 'christopher.white@example.com',
        passwordHash,
        firstName: 'Christopher',
        lastName: 'White',
        roleId: directorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'pmoore',
        email: 'patricia.moore@example.com',
        passwordHash,
        firstName: 'Patricia',
        lastName: 'Moore',
        roleId: directorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'dcarter',
        email: 'daniel.carter@example.com',
        passwordHash,
        firstName: 'Daniel',
        lastName: 'Carter',
        roleId: directorRole.id,
        emailVerified: new Date(),
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'rmartin',
        email: 'rebecca.martin@example.com',
        passwordHash,
        firstName: 'Rebecca',
        lastName: 'Martin',
        roleId: directorRole.id,
        emailVerified: new Date(),
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

  // Create sample Transfer Requests
  try {
    const firstUser = await prisma.user.findFirst({ where: { role: { name: 'User' } } })
    const firstSupervisor = await prisma.user.findFirst({ where: { role: { name: 'Supervisor' } } })
    const firstManager = await prisma.user.findFirst({ where: { role: { name: 'Manager' } } })
    if (firstUser && firstSupervisor) {
      const tr1 = await prisma.transferRequest.create({
        data: {
          title: 'Transfer 50 boxes of medicine',
          purpose: 'Urgent supply for Clinic B',
          fromLocation: 'Warehouse A',
          toLocation: 'Clinic B',
          status: 'Submitted',
          submittedAt: new Date(),
          createdById: firstUser.id,
          supervisorId: firstSupervisor.id,
          managerId: firstManager?.id,
        }
      })
      await prisma.auditLog.create({ data: { entityType: 'TransferRequest', entityId: tr1.id, action: 'Create', actorId: firstUser.id, toStatus: 'Submitted' } })
    }
  } catch (e) {
    console.log('⚠️  Skipped seeding Transfer Requests (tables may not exist yet).')
  }

  console.log('🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`  • 5 Roles created`)
  console.log(`  • ${users.length} Users created`)
  console.log(`  • 100 Teachers created`)
  console.log(`  • 100 Doctors created`)
  console.log(`  • 100 Engineers created`)
  console.log(`  • 100 Lawyers created`)
  console.log('\n📋 Test accounts (all use password: password123):')
  console.log('\n🔑 Admin:')
  console.log('  • admin@example.com (Alexandra Mitchell)')
  console.log('\n👤 Users:')
  console.log('  • john.doe@example.com (John Doe)')
  console.log('  • alice.smith@example.com (Alice Smith)')
  console.log('  • robert.johnson@example.com (Robert Johnson)')
  console.log('  • maria.brown@example.com (Maria Brown)')
  console.log('\n👨‍💼 Supervisors:')
  console.log('  • sarah.adams@example.com (Sarah Adams)')
  console.log('  • david.martinez@example.com (David Martinez)')
  console.log('  • lisa.thompson@example.com (Lisa Thompson)')
  console.log('  • james.wilson@example.com (James Wilson)')
  console.log('\n📊 Managers:')
  console.log('  • steven.taylor@example.com (Steven Taylor)')
  console.log('  • michelle.anderson@example.com (Michelle Anderson)')
  console.log('  • brian.thomas@example.com (Brian Thomas)')
  console.log('  • jennifer.rodriguez@example.com (Jennifer Rodriguez)')
  console.log('\n🎯 Directors:')
  console.log('  • christopher.white@example.com (Christopher White)')
  console.log('  • patricia.moore@example.com (Patricia Moore)')
  console.log('  • daniel.carter@example.com (Daniel Carter)')
  console.log('  • rebecca.martin@example.com (Rebecca Martin)')
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
