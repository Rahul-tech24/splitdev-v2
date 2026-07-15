type User = { id: string; name: string };
type ExpenseShare = { userId: string; amountOwed: number };
type Expense = {
  id: string;
  amount: number;
  paidById: string;
  paidBy: User;
  shares?: ExpenseShare[]; // Now expecting the specific math!
};

export function calculateSettlements(members: User[], expenses: Expense[]) {
  // 1. Initialize balances map to $0 for everyone in the group
  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m.id] = 0));

  // 2. Calculate accurate Net Balances using the new Exact Shares
  for (const expense of expenses) {
    // The person who paid gets the FULL amount added to their credit balance
    if (balances[expense.paidById] !== undefined) {
      balances[expense.paidById] += expense.amount;
    }

    // If the expense has specific shares mapped out, subtract exactly what they owe
    if (expense.shares && expense.shares.length > 0) {
      for (const share of expense.shares) {
        if (balances[share.userId] !== undefined) {
          balances[share.userId] -= share.amountOwed;
        }
      }
    } else {
      // FALLBACK (Just in case you have old database data from before today's migration)
      const equalShare = expense.amount / members.length;
      members.forEach((m) => {
        balances[m.id] -= equalShare;
      });
    }
  }

  // --- THE GREEDY ALGORITHM ---
  const debtors: { id: string; name: string; amount: number }[] = [];
  const creditors: { id: string; name: string; amount: number }[] = [];

  const nameMap: Record<string, string> = {};
  members.forEach(m => nameMap[m.id] = m.name);

  // 3. Separate into Debtors (-) and Creditors (+)
  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < -0.01) { 
      debtors.push({ id: userId, name: nameMap[userId], amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ id: userId, name: nameMap[userId], amount: balance });
    }
  }

  // 4. Sort arrays (largest debts/credits first to minimize total transactions)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: { from: string; fromId: string; to: string; toId: string; amount: number }[] = [];

  let i = 0; // Debtors pointer
  let j = 0; // Creditors pointer

  // 5. Dual-Pointer loop to annihilate debts
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The settlement amount is the minimum of what the debtor owes and what the creditor is owed
    const amount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(amount * 100) / 100;

    settlements.push({
      from: debtor.name,
      fromId: debtor.id,
      to: creditor.name,
      toId: creditor.id,
      amount: roundedAmount,
    });

    // Deduct the settled amount
    debtor.amount -= roundedAmount;
    creditor.amount -= roundedAmount;

    // Move pointers if a person's balance hits $0
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}