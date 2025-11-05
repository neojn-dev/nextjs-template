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

  // Create sample Transfer Requests (10 requests covering all workflow states)
  try {
    const userUsers = await prisma.user.findMany({ where: { role: { name: 'User' } }, take: 4 })
    const supervisorUsers = await prisma.user.findMany({ where: { role: { name: 'Supervisor' } }, take: 4 })
    const managerUsers = await prisma.user.findMany({ where: { role: { name: 'Manager' } }, take: 4 })
    
    if (userUsers.length > 0 && supervisorUsers.length > 0 && managerUsers.length > 0) {
      const now = new Date()
      const baseTime = now.getTime() - (10 * 24 * 60 * 60 * 1000) // 10 days ago
      
      // 1. Draft - Just created, not submitted yet
      const tr1 = await prisma.transferRequest.create({
        data: {
          title: 'Transfer Medical Supplies - Draft',
          purpose: 'Need to transfer basic medical supplies for inventory rotation',
          fromLocation: 'Central Warehouse',
          toLocation: 'Branch Office A',
          itemsJson: JSON.stringify([
            { name: 'Bandages', quantity: '100', unit: 'boxes' },
            { name: 'Antiseptic', quantity: '50', unit: 'bottles' }
          ]),
          status: 'Draft',
          createdById: userUsers[0].id,
          supervisorId: supervisorUsers[0].id,
          createdAt: new Date(baseTime),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr1.id, 
          action: 'Create', 
          actorId: userUsers[0].id, 
          toStatus: 'Draft',
          createdAt: new Date(baseTime)
        } 
      })

      // 2. Submitted - Awaiting supervisor review
      const tr2 = await prisma.transferRequest.create({
        data: {
          title: 'Urgent Medicine Transfer Request',
          purpose: 'Emergency supply needed for patient care',
          fromLocation: 'Main Pharmacy',
          toLocation: 'Emergency Ward',
          itemsJson: JSON.stringify([
            { name: 'Pain Relief Medicine', quantity: '200', unit: 'tablets' },
            { name: 'Antibiotics', quantity: '150', unit: 'doses' }
          ]),
          status: 'Submitted',
          submittedAt: new Date(baseTime + 1 * 24 * 60 * 60 * 1000),
          createdById: userUsers[0].id,
          supervisorId: supervisorUsers[0].id,
          createdAt: new Date(baseTime + 1 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr2.id, 
          action: 'Create', 
          actorId: userUsers[0].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 1 * 24 * 60 * 60 * 1000)
        } 
      })

      // 3. SupervisorApproved - Awaiting manager review
      const tr3 = await prisma.transferRequest.create({
        data: {
          title: 'Equipment Transfer - Approved by Supervisor',
          purpose: 'Transfer medical equipment to new facility',
          fromLocation: 'Storage Facility B',
          toLocation: 'New Clinic',
          itemsJson: JSON.stringify([
            { name: 'X-Ray Machine', quantity: '1', unit: 'unit' },
            { name: 'Patient Beds', quantity: '10', unit: 'units' }
          ]),
          status: 'SupervisorApproved',
          submittedAt: new Date(baseTime + 2 * 24 * 60 * 60 * 1000),
          createdById: userUsers[1].id,
          supervisorId: supervisorUsers[0].id,
          managerId: managerUsers[0].id,
          createdAt: new Date(baseTime + 2 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr3.id, 
          action: 'Create', 
          actorId: userUsers[1].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 2 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr3.id,
          role: 'Supervisor',
          approverId: supervisorUsers[0].id,
          status: 'Approved',
          comment: 'Approved - all items verified and available',
          decidedAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr3.id, 
          action: 'Approve', 
          actorId: supervisorUsers[0].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorApproved',
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000)
        } 
      })

      // 4. SupervisorChangesRequested - User needs to make changes
      const tr4 = await prisma.transferRequest.create({
        data: {
          title: 'Supply Transfer - Changes Requested',
          purpose: 'Regular inventory transfer',
          fromLocation: 'Warehouse C',
          toLocation: 'Distribution Center',
          itemsJson: JSON.stringify([
            { name: 'Medical Gloves', quantity: '500', unit: 'boxes' }
          ]),
          status: 'SupervisorChangesRequested',
          submittedAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000),
          createdById: userUsers[1].id,
          supervisorId: supervisorUsers[1].id,
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr4.id, 
          action: 'Create', 
          actorId: userUsers[1].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr4.id,
          role: 'Supervisor',
          approverId: supervisorUsers[1].id,
          status: 'ChangesRequested',
          comment: 'Please provide more details about the transfer schedule and add supporting documentation',
          decidedAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr4.id,
          authorId: supervisorUsers[1].id,
          authorRole: 'Supervisor',
          body: 'Please provide more details about the transfer schedule and add supporting documentation',
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr4.id, 
          action: 'RequestChanges', 
          actorId: supervisorUsers[1].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorChangesRequested',
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000)
        } 
      })

      // 5. SupervisorRejected - Final state
      const tr5 = await prisma.transferRequest.create({
        data: {
          title: 'Transfer Request - Rejected by Supervisor',
          purpose: 'Request for specialty equipment',
          fromLocation: 'Main Hospital',
          toLocation: 'Satellite Clinic',
          itemsJson: JSON.stringify([
            { name: 'MRI Scanner', quantity: '1', unit: 'unit' }
          ]),
          status: 'SupervisorRejected',
          submittedAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
          completedAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
          createdById: userUsers[2].id,
          supervisorId: supervisorUsers[1].id,
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr5.id, 
          action: 'Create', 
          actorId: userUsers[2].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr5.id,
          role: 'Supervisor',
          approverId: supervisorUsers[1].id,
          status: 'Rejected',
          comment: 'Equipment is currently in use and cannot be transferred. Please submit a new request with alternative equipment.',
          decidedAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr5.id,
          authorId: supervisorUsers[1].id,
          authorRole: 'Supervisor',
          body: 'Equipment is currently in use and cannot be transferred. Please submit a new request with alternative equipment.',
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr5.id, 
          action: 'Reject', 
          actorId: supervisorUsers[1].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorRejected',
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000)
        } 
      })

      // 6. ManagerApproved - Final state (successfully completed)
      const tr6 = await prisma.transferRequest.create({
        data: {
          title: 'Successful Transfer - Approved by Manager',
          purpose: 'Quarterly inventory redistribution',
          fromLocation: 'Headquarters',
          toLocation: 'Regional Office',
          itemsJson: JSON.stringify([
            { name: 'Vaccines', quantity: '1000', unit: 'doses' },
            { name: 'Syringes', quantity: '2000', unit: 'units' }
          ]),
          status: 'ManagerApproved',
          submittedAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
          createdById: userUsers[2].id,
          supervisorId: supervisorUsers[2].id,
          managerId: managerUsers[0].id,
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr6.id, 
          action: 'Create', 
          actorId: userUsers[2].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr6.id,
          role: 'Supervisor',
          approverId: supervisorUsers[2].id,
          status: 'Approved',
          comment: 'Verified inventory availability',
          decidedAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr6.id,
          role: 'Manager',
          approverId: managerUsers[0].id,
          status: 'Approved',
          comment: 'Approved for transfer. Please coordinate with logistics team.',
          decidedAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr6.id,
          authorId: supervisorUsers[2].id,
          authorRole: 'Supervisor',
          body: 'Verified inventory availability',
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr6.id,
          authorId: managerUsers[0].id,
          authorRole: 'Manager',
          body: 'Approved for transfer. Please coordinate with logistics team.',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr6.id, 
          action: 'Approve', 
          actorId: supervisorUsers[2].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorApproved',
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr6.id, 
          action: 'Approve', 
          actorId: managerUsers[0].id, 
          fromStatus: 'SupervisorApproved',
          toStatus: 'ManagerApproved',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000)
        } 
      })

      // 7. ManagerChangesRequested - User needs to make changes
      const tr7 = await prisma.transferRequest.create({
        data: {
          title: 'Transfer Request - Manager Requested Changes',
          purpose: 'Bulk supply transfer',
          fromLocation: 'Distribution Hub',
          toLocation: 'Local Clinic',
          itemsJson: JSON.stringify([
            { name: 'Lab Equipment', quantity: '5', unit: 'sets' },
            { name: 'Testing Kits', quantity: '300', unit: 'kits' }
          ]),
          status: 'ManagerChangesRequested',
          submittedAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
          createdById: userUsers[3].id,
          supervisorId: supervisorUsers[2].id,
          managerId: managerUsers[1].id,
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr7.id, 
          action: 'Create', 
          actorId: userUsers[3].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr7.id,
          role: 'Supervisor',
          approverId: supervisorUsers[2].id,
          status: 'Approved',
          comment: 'Supervisor approved',
          decidedAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr7.id,
          role: 'Manager',
          approverId: managerUsers[1].id,
          status: 'ChangesRequested',
          comment: 'Please update the delivery date and add cost breakdown details',
          decidedAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr7.id,
          authorId: supervisorUsers[2].id,
          authorRole: 'Supervisor',
          body: 'Supervisor approved',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr7.id,
          authorId: managerUsers[1].id,
          authorRole: 'Manager',
          body: 'Please update the delivery date and add cost breakdown details',
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr7.id, 
          action: 'Approve', 
          actorId: supervisorUsers[2].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorApproved',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr7.id, 
          action: 'RequestChanges', 
          actorId: managerUsers[1].id, 
          fromStatus: 'SupervisorApproved',
          toStatus: 'ManagerChangesRequested',
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000)
        } 
      })

      // 8. ManagerRejected - Final state
      const tr8 = await prisma.transferRequest.create({
        data: {
          title: 'Transfer Request - Rejected by Manager',
          purpose: 'High-value equipment transfer',
          fromLocation: 'Research Facility',
          toLocation: 'Training Center',
          itemsJson: JSON.stringify([
            { name: 'Surgical Robot', quantity: '1', unit: 'unit' }
          ]),
          status: 'ManagerRejected',
          submittedAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000),
          createdById: userUsers[0].id,
          supervisorId: supervisorUsers[3].id,
          managerId: managerUsers[2].id,
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr8.id, 
          action: 'Create', 
          actorId: userUsers[0].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr8.id,
          role: 'Supervisor',
          approverId: supervisorUsers[3].id,
          status: 'Approved',
          comment: 'Supervisor approved',
          decidedAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr8.id,
          role: 'Manager',
          approverId: managerUsers[2].id,
          status: 'Rejected',
          comment: 'Budget constraints prevent this transfer at this time. Please resubmit with alternative equipment.',
          decidedAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr8.id,
          authorId: supervisorUsers[3].id,
          authorRole: 'Supervisor',
          body: 'Supervisor approved',
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr8.id,
          authorId: managerUsers[2].id,
          authorRole: 'Manager',
          body: 'Budget constraints prevent this transfer at this time. Please resubmit with alternative equipment.',
          createdAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr8.id, 
          action: 'Approve', 
          actorId: supervisorUsers[3].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorApproved',
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr8.id, 
          action: 'Reject', 
          actorId: managerUsers[2].id, 
          fromStatus: 'SupervisorApproved',
          toStatus: 'ManagerRejected',
          createdAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000)
        } 
      })

      // 9. Resubmitted after changes - Submitted again
      const tr9 = await prisma.transferRequest.create({
        data: {
          title: 'Resubmitted Transfer Request',
          purpose: 'Updated transfer request after supervisor feedback',
          fromLocation: 'Storage Unit 5',
          toLocation: 'Clinic Main',
          itemsJson: JSON.stringify([
            { name: 'Medicine A', quantity: '100', unit: 'boxes' },
            { name: 'Medicine B', quantity: '75', unit: 'boxes' }
          ]),
          status: 'Submitted',
          submittedAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000),
          createdById: userUsers[1].id,
          supervisorId: supervisorUsers[0].id,
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000), // Original creation
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr9.id, 
          action: 'Create', 
          actorId: userUsers[1].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 3 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr9.id,
          role: 'Supervisor',
          approverId: supervisorUsers[0].id,
          status: 'ChangesRequested',
          comment: 'Original request for changes',
          decidedAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr9.id,
          authorId: supervisorUsers[0].id,
          authorRole: 'Supervisor',
          body: 'Original request for changes',
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr9.id, 
          action: 'RequestChanges', 
          actorId: supervisorUsers[0].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorChangesRequested',
          createdAt: new Date(baseTime + 4 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr9.id, 
          action: 'Resubmit', 
          actorId: userUsers[1].id, 
          fromStatus: 'SupervisorChangesRequested',
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 9 * 24 * 60 * 60 * 1000)
        } 
      })

      // 10. Complex workflow - Multiple comments and interactions
      const tr10 = await prisma.transferRequest.create({
        data: {
          title: 'Complex Transfer Request with Multiple Comments',
          purpose: 'Multi-stage transfer with detailed documentation',
          fromLocation: 'Main Distribution Center',
          toLocation: 'Regional Warehouse',
          itemsJson: JSON.stringify([
            { name: 'Vaccines', quantity: '5000', unit: 'doses' },
            { name: 'Cooling Equipment', quantity: '10', unit: 'units' },
            { name: 'Transport Containers', quantity: '50', unit: 'boxes' }
          ]),
          status: 'ManagerApproved',
          submittedAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
          createdById: userUsers[3].id,
          supervisorId: supervisorUsers[3].id,
          managerId: managerUsers[3].id,
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr10.id, 
          action: 'Create', 
          actorId: userUsers[3].id, 
          toStatus: 'Submitted',
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr10.id,
          authorId: userUsers[3].id,
          authorRole: 'User',
          body: 'Initial request submitted. Please review urgent requirements.',
          createdAt: new Date(baseTime + 5 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr10.id,
          role: 'Supervisor',
          approverId: supervisorUsers[3].id,
          status: 'Approved',
          comment: 'Verified quantities and storage requirements. Approved for manager review.',
          decidedAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr10.id,
          authorId: supervisorUsers[3].id,
          authorRole: 'Supervisor',
          body: 'Verified quantities and storage requirements. Approved for manager review.',
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr10.id,
          authorId: managerUsers[3].id,
          authorRole: 'Manager',
          body: 'Approved. Logistics team notified. Transfer scheduled for next week.',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.approvalStep.create({
        data: {
          requestId: tr10.id,
          role: 'Manager',
          approverId: managerUsers[3].id,
          status: 'Approved',
          comment: 'Approved. Logistics team notified. Transfer scheduled for next week.',
          decidedAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.transferComment.create({
        data: {
          requestId: tr10.id,
          authorId: userUsers[3].id,
          authorRole: 'User',
          body: 'Thank you for the approval. Will coordinate with logistics team.',
          createdAt: new Date(baseTime + 8 * 24 * 60 * 60 * 1000),
        }
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr10.id, 
          action: 'Approve', 
          actorId: supervisorUsers[3].id, 
          fromStatus: 'Submitted',
          toStatus: 'SupervisorApproved',
          createdAt: new Date(baseTime + 6 * 24 * 60 * 60 * 1000)
        } 
      })
      await prisma.auditLog.create({ 
        data: { 
          entityType: 'TransferRequest', 
          entityId: tr10.id, 
          action: 'Approve', 
          actorId: managerUsers[3].id, 
          fromStatus: 'SupervisorApproved',
          toStatus: 'ManagerApproved',
          createdAt: new Date(baseTime + 7 * 24 * 60 * 60 * 1000)
        } 
      })

      console.log(`✅ Created 10 transfer requests covering all workflow states`)
    }
  } catch (e) {
    console.log('⚠️  Skipped seeding Transfer Requests (tables may not exist yet).', e)
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
