export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function calculateSettlements(
  members: { id: string; name: string }[],
  expenses: { amount: number; paidById: string }[]
): Transaction[] {
  if (members.length === 0 || expenses.length === 0) return [];

  // 1. Calculate Total Spend and Fair Share per person
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fairShare = totalSpend / members.length;

  // 2. Build a Net Balance map for every member
  const balances: Record<string, { name: string; amount: number }> = {};
  
  members.forEach((m) => {
    balances[m.id] = { name: m.name, amount: 0 };
  });

  // Add what each person paid
  expenses.forEach((e) => {
    if (balances[e.paidById]) {
      balances[e.paidById].amount += e.amount;
    }
  });

  // Subtract their fair share to get the final Net Balance
  Object.values(balances).forEach((b) => {
    b.amount -= fairShare;
  });

  // 3. Separate into Debtors (owes money) and Creditors (is owed money)
  const debtors = Object.values(balances)
    .filter((b) => b.amount < -0.01) // Less than -1 cent
    .sort((a, b) => a.amount - b.amount); // Ascending: Biggest debtor (-$150) at index 0

  const creditors = Object.values(balances)
    .filter((b) => b.amount > 0.01) // Greater than +1 cent
    .sort((a, b) => b.amount - a.amount); // Descending: Biggest creditor (+$200) at index 0

  // 4. The Greedy Two-Pointer Settlement Loop
  const transactions: Transaction[] = [];
  let i = 0; // Debtor pointer
  let j = 0; // Creditor pointer

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // How much does the debtor owe? (make it positive for math)
    const debtAmount = Math.abs(debtor.amount);
    const creditAmount = creditor.amount;

    // The settled amount is the MINIMUM of the two piles
    const settledAmount = Math.min(debtAmount, creditAmount);

    if (settledAmount > 0.01) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(settledAmount.toFixed(2)),
      });
    }

    // Adjust the remaining balances
    debtor.amount += settledAmount;
    creditor.amount -= settledAmount;

    // If the debtor is fully settled (balance reached $0), move to the next debtor
    if (Math.abs(debtor.amount) < 0.01) {
      i++;
    }

    // If the creditor is fully paid out (balance reached $0), move to the next creditor
    if (creditor.amount < 0.01) {
      j++;
    }
  }

  return transactions;
}