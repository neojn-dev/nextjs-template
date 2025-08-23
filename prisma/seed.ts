import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.masterData.deleteMany()
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

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 12)
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin', // Special admin role
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: 'manager',
        email: 'manager@example.com',
        passwordHash,
        role: 'user', // Default user role
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        username: 'analyst',
        email: 'analyst@example.com',
        passwordHash,
        role: 'user', // Default user role
        emailVerified: new Date(),
      },
    }),
  ])

  console.log(`✅ Created ${users.length} test users`)

  // Create sample Teachers
  const teachers = []
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users)
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
      userId: user.id,
    }
    teachers.push(teacher)
  }

  const createdTeachers = await prisma.teacher.createMany({
    data: teachers,
  })
  console.log(`✅ Created ${createdTeachers.count} Teacher records`)

  // Create sample Doctors
  const doctors = []
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users)
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
      userId: user.id,
    }
    doctors.push(doctor)
  }

  const createdDoctors = await prisma.doctor.createMany({
    data: doctors,
  })
  console.log(`✅ Created ${createdDoctors.count} Doctor records`)

  // Create sample Engineers
  const engineers = []
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users)
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
      userId: user.id,
    }
    engineers.push(engineer)
  }

  const createdEngineers = await prisma.engineer.createMany({
    data: engineers,
  })
  console.log(`✅ Created ${createdEngineers.count} Engineer records`)

  // Create sample Lawyers
  const lawyers = []
  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users)
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
      userId: user.id,
    }
    lawyers.push(lawyer)
  }

  const createdLawyers = await prisma.lawyer.createMany({
    data: lawyers,
  })
  console.log(`✅ Created ${createdLawyers.count} Lawyer records`)

  // Create some sample uploads
  const uploads = [
    {
      filename: 'sample-document.pdf',
      originalName: 'Sample Document.pdf',
      mimeType: 'application/pdf',
      size: 1024000,
      path: '/uploads/sample-document.pdf',
      userId: users[0].id,
    },
    {
      filename: 'profile-image.jpg',
      originalName: 'Profile Image.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      path: '/uploads/profile-image.jpg',
      userId: users[1].id,
    },
    {
      filename: 'data-export.csv',
      originalName: 'Data Export.csv',
      mimeType: 'text/csv',
      size: 256000,
      path: '/uploads/data-export.csv',
      userId: users[2].id,
    },
  ]

  const createdUploads = await prisma.upload.createMany({
    data: uploads,
  })

  console.log(`✅ Created ${createdUploads.count} upload records`)



  // Create comprehensive Master Data entries with realistic field combinations
  const masterDataEntries = []
  
  // Define realistic form field templates
  const fieldTemplates = [
    {
      title: "User Registration Form - Full Name",
      description: "Complete name input with validation for user registration",
      category: "Basic",
      fieldType: "input",
      textField: "John Doe",
      placeholder: "Enter your full name",
      helpText: "Please enter your first and last name",
      isRequired: true,
      minLength: 2,
      maxLength: 100,
      pattern: "^[a-zA-Z\\s]+$",
    },
    {
      title: "Contact Form - Email Address",
      description: "Email input with proper validation and formatting",
      category: "Basic", 
      fieldType: "email",
      emailField: "user@example.com",
      placeholder: "your.email@domain.com",
      helpText: "We'll never share your email with anyone else",
      isRequired: true,
      pattern: "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    },
    {
      title: "Profile Setup - Phone Number",
      description: "Phone number input with international format support",
      category: "Basic",
      fieldType: "tel",
      phoneField: "+1-555-123-4567",
      placeholder: "+1-XXX-XXX-XXXX",
      helpText: "Include country code for international numbers",
      pattern: "^\\+?[1-9]\\d{1,14}$",
    },
    {
      title: "Website Settings - Homepage URL",
      description: "URL input for website or social media links",
      category: "Basic",
      fieldType: "url",
      urlField: "https://www.example.com",
      placeholder: "https://your-website.com",
      helpText: "Must include http:// or https://",
    },
    {
      title: "Product Search - Keywords",
      description: "Search input for product catalog filtering",
      category: "Advanced",
      fieldType: "search",
      searchField: "laptop computers",
      placeholder: "Search products...",
      helpText: "Use keywords to find products quickly",
    },
    {
      title: "Blog Post - Content Body",
      description: "Rich text editor for blog post content creation",
      category: "Advanced",
      fieldType: "textarea",
      textareaField: "Write your blog post content here...",
      richTextField: "<p>This is a <strong>rich text</strong> editor with <em>formatting</em> options.</p>",
      placeholder: "Start writing your post...",
      helpText: "Use the toolbar to format your text",
      minLength: 100,
      maxLength: 5000,
    },
    {
      title: "E-commerce - Product Price",
      description: "Price input with currency formatting and validation",
      category: "Basic",
      fieldType: "number",
      numberField: 299.99,
      placeholder: "0.00",
      helpText: "Enter price in USD",
      minValue: 0.01,
      maxValue: 99999.99,
      step: 0.01,
    },
    {
      title: "Inventory - Stock Quantity",
      description: "Integer input for product stock management",
      category: "Basic",
      fieldType: "number",
      integerField: 150,
      placeholder: "0",
      helpText: "Current stock count",
      minValue: 0,
      maxValue: 10000,
    },
    {
      title: "User Preferences - Age Range",
      description: "Slider for selecting age range in user profiles",
      category: "Advanced",
      fieldType: "range",
      rangeField: 25,
      sliderValue: 25,
      minValue: 18,
      maxValue: 100,
      helpText: "Select your age range",
    },
    {
      title: "Event Planning - Event Date",
      description: "Date picker for scheduling events and appointments",
      category: "Basic",
      fieldType: "date",
      dateField: new Date('2024-12-25'),
      helpText: "Select the event date",
      isRequired: true,
    },
    {
      title: "Appointment Booking - Time Slot",
      description: "Time picker for appointment scheduling",
      category: "Basic",
      fieldType: "time",
      timeField: "14:30",
      helpText: "Select your preferred time",
      isRequired: true,
    },
    {
      title: "Meeting Setup - Date and Time",
      description: "Combined date and time picker for meeting scheduling",
      category: "Advanced",
      fieldType: "datetime-local",
      dateTimeField: new Date('2024-12-25T14:30:00'),
      helpText: "Choose meeting date and time",
      isRequired: true,
    },
    {
      title: "Subscription - Plan Selection",
      description: "Radio buttons for subscription plan selection",
      category: "Basic",
      fieldType: "radio",
      radioSelection: "Premium Plan",
      helpText: "Choose your subscription plan",
      isRequired: true,
    },
    {
      title: "Survey - Multiple Interests",
      description: "Checkbox group for selecting multiple interests",
      category: "Advanced",
      fieldType: "checkbox",
      checkboxGroup: JSON.stringify(["Technology", "Sports", "Music"]),
      helpText: "Select all that apply",
    },
    {
      title: "Settings - Email Notifications",
      description: "Toggle switch for enabling/disabling notifications",
      category: "Basic",
      fieldType: "switch",
      switchField: true,
      helpText: "Enable email notifications",
    },
    {
      title: "Theme Customization - Primary Color",
      description: "Color picker for theme customization",
      category: "Specialized",
      fieldType: "color",
      colorField: "#3B82F6",
      helpText: "Choose your primary theme color",
    },
    {
      title: "Product Review - Rating",
      description: "Star rating system for product reviews",
      category: "Advanced",
      fieldType: "rating",
      ratingField: 4.5,
      minValue: 1,
      maxValue: 5,
      helpText: "Rate this product",
    },
    {
      title: "Content Management - Tags",
      description: "Tag input for content categorization",
      category: "Advanced",
      fieldType: "tags",
      tagsField: JSON.stringify(["javascript", "react", "frontend"]),
      helpText: "Add relevant tags",
    },
    {
      title: "Location Selector - Country",
      description: "Dropdown for country selection with search",
      category: "Basic",
      fieldType: "select",
      singleSelect: "United States",
      helpText: "Select your country",
      isRequired: true,
    },
    {
      title: "Skills Assessment - Programming Languages",
      description: "Multi-select for programming language skills",
      category: "Advanced",
      fieldType: "select",
      multiSelect: JSON.stringify(["JavaScript", "Python", "Java", "C++"]),
      multiple: true,
      helpText: "Select all languages you know",
    }
  ]

  for (let i = 0; i < 100; i++) {
    const user = faker.helpers.arrayElement(users)
    const template = fieldTemplates[i] || fieldTemplates[i % fieldTemplates.length]
    
    const masterData = {
      title: template.title,
      description: template.description,
      category: template.category,
      isActive: faker.datatype.boolean(0.8), // 80% chance of being active
      sortOrder: i + 1,
      fieldType: template.fieldType,
      
      // Text fields
      textField: template.textField || faker.lorem.words(2),
      emailField: template.emailField || faker.internet.email(),
      phoneField: template.phoneField || faker.phone.number().substring(0, 20),
      urlField: template.urlField || faker.internet.url(),
      searchField: template.searchField || faker.lorem.word(),
      textareaField: template.textareaField || faker.lorem.paragraph(),
      richTextField: template.richTextField || faker.lorem.paragraphs(2),
      
      // Numeric fields
      numberField: template.numberField || faker.number.float({ min: 1, max: 1000, multipleOf: 0.01 }),
      integerField: template.integerField || faker.number.int({ min: 1, max: 1000 }),
      rangeField: template.rangeField || faker.number.int({ min: 0, max: 100 }),
      sliderValue: template.sliderValue || faker.number.float({ min: 0, max: 100 }),
      
      // Date fields
      dateField: template.dateField || faker.date.future(),
      timeField: template.timeField || faker.date.recent().toTimeString().slice(0, 5),
      dateTimeField: template.dateTimeField || faker.date.future(),
      monthField: faker.date.future().toISOString().slice(0, 7),
      weekField: `2024-W${faker.number.int({ min: 1, max: 52 }).toString().padStart(2, '0')}`,
      
      // Selection fields
      singleSelect: template.singleSelect || faker.helpers.arrayElement(['Option A', 'Option B', 'Option C']),
      multiSelect: template.multiSelect || JSON.stringify(faker.helpers.arrayElements(['Choice 1', 'Choice 2', 'Choice 3'], { min: 1, max: 2 })),
      radioSelection: template.radioSelection || faker.helpers.arrayElement(['Radio A', 'Radio B', 'Radio C']),
      checkboxGroup: template.checkboxGroup || JSON.stringify(faker.helpers.arrayElements(['Check 1', 'Check 2', 'Check 3'], { min: 1, max: 2 })),
      
      // Boolean fields
      switchField: template.switchField !== undefined ? template.switchField : faker.datatype.boolean(),
      checkboxField: faker.datatype.boolean(),
      
      // Special fields
      colorField: template.colorField || faker.internet.color(),
      ratingField: template.ratingField || faker.number.float({ min: 1, max: 5, multipleOf: 0.5 }),
      tagsField: template.tagsField || JSON.stringify(faker.helpers.arrayElements(['tag1', 'tag2', 'tag3', 'tag4'], { min: 1, max: 3 })),
      
      userId: user.id,
    }
    masterDataEntries.push(masterData)
  }

  const createdMasterData = await prisma.masterData.createMany({
    data: masterDataEntries,
  })

  console.log(`✅ Created ${createdMasterData.count} Master Data records`)

  console.log('🎉 Database seeded successfully!')
  console.log('\n📋 Test accounts:')
  console.log('  Admin: admin / password123 (admin role)')
  console.log('  Manager: manager / password123 (user role)')
  console.log('  Analyst: analyst / password123 (user role)')
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
