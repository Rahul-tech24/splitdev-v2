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

export async function inviteMember(groupId: string, targetEmail: string) {
  try {
    // GATE 1: Is the caller signed in?
    const session = await verifySession();
    if (!session) {
      return { success: false, error: 'You must be logged in to invite members.' };
    }

    // Clean up the input email (lowercase and strip whitespace)
    const cleanEmail = targetEmail.trim().toLowerCase();

    // GATE 2: Is the caller actually a member of this group?
    // We also include the current members list here so we can use it in Gate 4!
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            id: session.userId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!group) {
      return { success: false, error: 'Group not found or you do not have permission to invite users.' };
    }

    // GATE 3: Does the friend exist in our database?
    const targetUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!targetUser) {
      return { 
        success: false, 
        error: `No SplitDev user found with email "${cleanEmail}". Ask them to register first!` 
      };
    }

    // GATE 4: Is the friend ALREADY in the group?
    const isAlreadyMember = group.members.some((member) => member.id === targetUser.id);
    if (isAlreadyMember) {
      return { success: false, error: `${targetUser.name} is already a member of this group.` };
    }

    // ALL GATES CLEARED: Plug in the wire!
    await prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: {
            id: targetUser.id,
          },
        },
      },
    });

    // Destroy the old photograph of the Group Arena so the new member appears instantly
    revalidatePath(`/groups/${groupId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to invite member:', error);
    return { success: false, error: 'An unexpected error occurred while adding the member.' };
  }
}

export async function createExpense(groupId: string, description: string, amount: number) {
  try {
    // GATE 1: Is the caller signed in?
    const session = await verifySession();
    if (!session) {
      return { success: false, error: 'You must be logged in to add an expense.' };
    }

    // GATE 2: Is the data clean and legit? (Check in memory before hitting DB!)
    const cleanDescription = description.trim();
    if (!cleanDescription) {
      return { success: false, error: 'Please enter a description for the expense.' };
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Please enter a valid amount greater than $0.' };
    }

    // GATE 3: Does the group exist AND is the caller a member?
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        members: {
          some: {
            id: session.userId,
          },
        },
      },
    });

    if (!group) {
      return { success: false, error: 'Group not found or you do not have permission to add expenses to it.' };
    }

    // ALL GATES CLEARED: Plug in the dual wires and create the receipt!
    await prisma.expense.create({
      data: {
        description: cleanDescription,
        amount: Number(amount.toFixed(2)), // Enforce 2 decimal places max
        group: {
          connect: { id: groupId }, // Wire 1: Connect to the Group
        },
        paidBy: {
          connect: { id: session.userId }, // Wire 2: Connect to the User who paid
        },
      },
    });

    // Ripped up the old cache photograph so the new receipt instantly appears on screen
    revalidatePath(`/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to create expense:', error);
    return { success: false, error: 'An unexpected error occurred while saving the expense.' };
  }
}