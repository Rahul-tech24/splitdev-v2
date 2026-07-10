'use server';

import prisma from '../lib/prisma';
import { verifySession } from '../lib/session';
import { revalidatePath } from 'next/cache';

export async function deleteExpense(expenseId: string, groupId: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: 'Unauthorized.' };

    // 1. Verify ownership: You can't delete someone else's receipt!
    const expense = await prisma.expense.findUnique({ 
      where: { id: expenseId } 
    });
    
    if (!expense) return { success: false, error: 'Expense not found.' };
    
    if (expense.paidById !== session.userId) {
      return { success: false, error: 'Security alert: You can only delete your own expenses.' };
    }

    // 2. Cascade Delete from PostgreSQL
    await prisma.expense.delete({ 
      where: { id: expenseId } 
    });

    // 3. Trigger a live UI refresh on the server
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return { success: false, error: 'Failed to delete expense.' };
  }
}
