import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixAdminPassword() {
  console.log('🔧 Fixing admin user password...')
  
  // Hash the password
  const passwordHash = await bcrypt.hash('password123', 12)
  
  // Update admin user
  const user = await prisma.user.update({
    where: { username: 'admin' },
    data: { 
      passwordHash,
      emailVerified: new Date(),
      isActive: true
    }
  })
  
  console.log('✅ Admin password updated!')
  console.log('  Username:', user.username)
  console.log('  Email:', user.email)
  console.log('  Email Verified:', user.emailVerified ? user.emailVerified.toISOString() : 'NULL')
  console.log('  Is Active:', user.isActive)
  
  // Verify it works
  const isValid = await bcrypt.compare('password123', user.passwordHash)
  console.log('  Password verification:', isValid ? '✅ PASS' : '❌ FAIL')
  
  console.log('\n✅ Admin user is now ready to login!')
  console.log('   Username: admin')
  console.log('   Password: password123')
}

fixAdminPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

