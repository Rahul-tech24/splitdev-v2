'use server';

import prisma from '../lib/prisma';
import { verifySession } from '../lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- ZOD SCHEMA (Now handling exact mathematical shares!) ---
const ExpenseSchema = z.object({
  groupId: z.string().uuid("Invalid group ID format"),
  description: z.string()
    .min(2, "Description must be at least 2 characters")
    .max(50, "Description is too long (max 50 chars)"),
  amount: z.number()
    .positive("Amount must be greater than $0")
    .max(100000, "Amount exceeds maximum allowed ($100,000)"),
  // NEW: An array of exact shares instead of just user IDs
  shares: z.array(z.object({
    userId: z.string(),
    amountOwed: z.number().nonnegative()
  })).min(1, "You must select at least one person to split with")
});

export async function createGroup(name: string) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) return { error: 'Unauthorized. Please log in.' };
    if (!name || name.trim() === '') return { error: 'Group name is required.' };

    const group = await prisma.group.create({
      data: { name: name, members: { connect: { id: session.userId } } }
    });

    revalidatePath('/dashboard');
    return { success: true, groupId: group.id };
  } catch (error) {
    console.error('Create Group Error:', error);
    return { error: 'Failed to create group.' };
  }
}

// UPDATE: The signature now takes `shares` instead of `selectedMembers`
export async function createExpense(groupId: string, description: string, amount: number, shares: { userId: string, amountOwed: number }[]) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    // GATE 2: ZOD VALIDATION
    const validation = ExpenseSchema.safeParse({ groupId, description, amount, shares });
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const safeData = validation.data;

    // MATH VALIDATION: Ensure the exact shares perfectly add up to the total receipt amount
    const totalShares = safeData.shares.reduce((sum, share) => sum + share.amountOwed, 0);
    
    // We use Math.abs to avoid weird JavaScript floating-point decimal bugs (e.g. 0.1 + 0.2 = 0.300000004)
    if (Math.abs(totalShares - safeData.amount) > 0.01) {
      return { success: false, error: 'The individual shares do not add up to the total amount.' };
    }

    const group = await prisma.group.findFirst({
      where: { id: safeData.groupId, members: { some: { id: session.userId } } },
    });

    if (!group) return { success: false, error: 'Group not found or unauthorized.' };

    // DATABASE: Create the expense AND the specific EXACT shares in one atomic transaction
    await prisma.expense.create({
      data: {
        description: safeData.description,
        amount: safeData.amount,
        group: { connect: { id: safeData.groupId } },
        paidBy: { connect: { id: session.userId } },
        shares: {
          create: safeData.shares.map((share) => ({
            amountOwed: share.amountOwed,
            user: { connect: { id: share.userId } }
          }))
        }
      },
    });

    revalidatePath(`/groups/${safeData.groupId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to create expense:', error);
    return { success: false, error: 'An unexpected error occurred.' };
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

