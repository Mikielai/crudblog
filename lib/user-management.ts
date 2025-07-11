'use server'

import { db } from "@/lib/db";
import { createClerkClient } from "@clerk/nextjs/server";

export async function syncSpecificUser(userId: string) {
  try {
    console.log('Syncing user:', userId);
    
    // Get user details from Clerk
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(userId);
    
    if (!clerkUser) {
      return { success: false, message: 'User not found in Clerk' };
    }
    
    // Check if user exists in database
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      console.log('User already exists in database');
      return { success: true, message: 'User already exists', user: existingUser };
    }
    
    // Check if user exists by email
    const userByEmail = await db.user.findUnique({
      where: { email: clerkUser.emailAddresses[0]?.emailAddress || '' }
    });
    
    if (userByEmail) {
      console.log('User exists with different ID, cannot create duplicate');
      return { success: false, message: 'User with this email already exists with different ID' };
    }
    
    // Create new user
    const newUser = await db.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        profileimage: clerkUser.imageUrl || '',
      }
    });
    
    console.log('User created successfully:', newUser.id);
    return { success: true, message: 'User created successfully', user: newUser };
    
  } catch (error) {
    console.error('Error syncing user:', error);
    return { success: false, message: `Error syncing user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      include: {
        posts: true
      }
    });
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, message: 'Error fetching users' };
  }
}
