'use server';

import prisma from '../lib/prisma';
import { verifySession } from '../lib/session';
import { revalidatePath } from 'next/cache';

export async function createGroup(name: string) {
  try {
    // 1. The Bouncer: Check the cookie to see who is making this request
    const session = await verifySession();
    
    if (!session || !session.userId) {
      return { error: 'Unauthorized. Please log in.' };
    }

    if (!name || name.trim() === '') {
      return { error: 'Group name is required.' };
    }

    // 2. The Database Mutation: Create the group AND link the user in one move
    const group = await prisma.group.create({
      data: {
        name: name,
        // This is the "Invisible Wire" we talked about yesterday!
        // We don't push to an array. We use `connect` to draw a line in the Join Table.
        members: {
           connect: { id: session.userId }
        }
      }
    });

    // 3. Cache Invalidation: Tell Next.js to refresh the Dashboard instantly
    revalidatePath('/dashboard');

    return { success: true, groupId: group.id };

  } catch (error) {
    console.error('Create Group Error:', error);
    return { error: 'Failed to create group.' };
  }
}