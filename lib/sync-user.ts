import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function syncUser() {
  const user = await currentUser()
  
  if (!user) return null

  try {
    // Check if user exists in database
    const existingUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (existingUser) {
      // Update existing user with latest info
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          profileimage: user.imageUrl,
        },
      })
      console.log('User updated in database:', updatedUser.id)
      return updatedUser
    } else {
      // Create new user in database
      const newUser = await db.user.create({
        data: {
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          profileimage: user.imageUrl,
        },
      })
      console.log('User created in database:', newUser.id)
      return newUser
    }
  } catch (error) {
    console.error('Error syncing user:', error)
    
    // If it's a unique constraint error, try to find the existing user
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      try {
        const existingUser = await db.user.findUnique({
          where: { id: user.id }
        })
        return existingUser
      } catch (findError) {
        console.error('Error finding existing user:', findError)
        return null
      }
    }
    
    return null
  }
}
