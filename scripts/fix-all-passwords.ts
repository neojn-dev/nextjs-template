import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAllPasswords() {
  console.log('🔧 Fixing all user passwords...')
  
  // Hash the password once
  const passwordHash = await bcrypt.hash('password123', 12)
  
  // Get all users
  const users = await prisma.user.findMany()
  
  console.log(`\n📋 Found ${users.length} users to update`)
  
  // Update all users
  for (const user of users) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { 
        passwordHash,
        emailVerified: user.emailVerified || new Date(),
        isActive: true
      }
    })
    
    // Verify password
    const isValid = await bcrypt.compare('password123', updated.passwordHash)
    
    console.log(`  ${isValid ? '✅' : '❌'} ${updated.username} (${updated.email}) - ${updated.emailVerified ? 'Verified' : 'Not Verified'}`)
  }
  
  console.log('\n✅ All user passwords updated!')
  console.log('   All users can now login with: password123')
}

fixAllPasswords()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

