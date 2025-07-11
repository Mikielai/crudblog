import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function syncUserUpsert() {
  const user = await currentUser()
  
  if (!user) return null

  try {
    // Use upsert to either create or update the user
    const syncedUser = await db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        profileimage: user.imageUrl,
      },
      update: {
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        profileimage: user.imageUrl,
      },
    })
    
    console.log('User synced via upsert:', syncedUser.id)
    return syncedUser
  } catch (error) {
    console.error('Error syncing user via upsert:', error)
    return null
  }
}
