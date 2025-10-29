import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: {
      username: 'admin'
    },
    include: {
      role: true
    }
  })

  if (!user) {
    console.log('❌ User "admin" not found!')
    return
  }

  console.log('✅ User found:')
  console.log('  Username:', user.username)
  console.log('  Email:', user.email)
  console.log('  Email Verified:', user.emailVerified ? user.emailVerified.toISOString() : 'NULL')
  console.log('  Is Active:', user.isActive)
  console.log('  Role:', user.role?.name)
  console.log('  Has Password Hash:', !!user.passwordHash)
  
  // Test password
  const testPassword = 'password123'
  const isValid = await bcrypt.compare(testPassword, user.passwordHash)
  console.log('  Password match:', isValid ? '✅ YES' : '❌ NO')
  
  // Check what the auth will see
  console.log('\n🔍 Auth Check Results:')
  console.log('  User exists:', '✅ YES')
  console.log('  Email verified:', user.emailVerified ? '✅ YES' : '❌ NO (BLOCKING LOGIN)')
  console.log('  Is active:', user.isActive ? '✅ YES' : '❌ NO (BLOCKING LOGIN)')
  console.log('  Password valid:', isValid ? '✅ YES' : '❌ NO (BLOCKING LOGIN)')
  
  if (!user.emailVerified) {
    console.log('\n⚠️  FIX: User email is not verified! This is why login is failing.')
    console.log('   Updating user to set emailVerified...')
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })
    console.log('   ✅ Fixed! Email verified set to:', new Date().toISOString())
  }
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

