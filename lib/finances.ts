import { formatShortMonth, getCurrentMonthKey } from "@/lib/month-filter";
import type { Invoice } from "@/lib/invoices";
import { getInvoiceClientName } from "@/lib/invoices";

export type RevenueChartPoint = {
  month: string;
  monthKey: string;
  ca: number;
};

export function buildRevenueChart(invoices: Invoice[]): RevenueChartPoint[] {
  const monthKeys = getLastNMonthKeys(8);
  const paidInvoices = invoices.filter((invoice) => invoice.status === "payee");

  return monthKeys.map((monthKey) => ({
    monthKey,
    month: formatShortMonth(monthKey),
    ca: paidInvoices
      .filter((invoice) => getInvoiceIncomeDate(invoice).slice(0, 7) === monthKey)
      .reduce((sum, invoice) => sum + invoice.amount, 0),
  }));
}

export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "invoice";
export type ExpenseFrequency = "occasional" | "recurring";

export type Transaction = {
  id: number;
  label: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  frequency?: ExpenseFrequency;
  source?: TransactionSource;
  sourceId?: number;
};

export type TransactionInput = {
  label: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  frequency?: ExpenseFrequency;
};

export type MonthlyFinancePoint = {
  month: string;
  monthKey: string;
  revenus: number;
  depenses: number;
};

export type ExpenseCategoryPoint = {
  name: string;
  value: number;
  color: string;
};

import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export const FINANCES_STORAGE_KEY = AKNO_STORAGE_KEYS.finances;

export const expenseFrequencyLabels: Record<ExpenseFrequency, string> = {
  occasional: "Occasionnelle",
  recurring: "Mensuelle (abonnement)",
};

export const expenseCategoryOptions = [
  "Outils & logiciels",
  "Marketing",
  "Hébergement",
  "Freelance",
  "Déplacements",
  "Administratif",
  "Autre",
] as const;

const categoryColors: Record<string, string> = {
  "Outils & logiciels": "#3b72c4",
  Marketing: "#555baa",
  Hébergement: "#6b8fd4",
  Freelance: "#d44a7a",
  Déplacements: "#e07a4a",
  Administratif: "#8b9cb5",
  Autre: "#94a3b8",
};

export function loadStoredTransactions(): Transaction[] {
  const parsed = readStorage<Transaction[]>(FINANCES_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredTransactions(transactions: Transaction[]) {
  writeStorage(FINANCES_STORAGE_KEY, transactions);
}

export function createTransaction(
  existing: Transaction[],
  input: TransactionInput,
): Transaction {
  return {
    id: existing.reduce((max, tx) => Math.max(max, tx.id), 0) + 1,
    label: input.label.trim(),
    amount: Math.max(0, input.amount),
    type: input.type,
    category: input.category,
    date: input.date,
    frequency: input.type === "expense" ? input.frequency ?? "occasional" : undefined,
  };
}

export function updateTransaction(
  existing: Transaction[],
  id: number,
  input: TransactionInput,
): Transaction[] {
  return existing.map((tx) =>
    tx.id === id
      ? {
          ...tx,
          label: input.label.trim(),
          amount: Math.max(0, input.amount),
          type: input.type,
          category: input.category,
          date: input.date,
          frequency: input.type === "expense" ? input.frequency ?? "occasional" : undefined,
        }
      : tx,
  );
}

export function deleteTransaction(existing: Transaction[], id: number) {
  return existing.filter((tx) => tx.id !== id);
}

const INVOICE_TX_ID_OFFSET = 1_000_000;

export function getInvoiceIncomeDate(invoice: Invoice) {
  return invoice.paidDate ?? invoice.date;
}

export function invoicesToIncomeTransactions(invoices: Invoice[]): Transaction[] {
  return invoices
    .filter((invoice) => invoice.status === "payee")
    .map((invoice) => ({
      id: INVOICE_TX_ID_OFFSET + invoice.id,
      label: `Facture ${invoice.number} — ${getInvoiceClientName(invoice)}`,
      amount: invoice.amount,
      type: "income" as const,
      category: invoice.kind === "acompte" ? "Acompte client" : "Solde client",
      date: getInvoiceIncomeDate(invoice),
      source: "invoice" as const,
      sourceId: invoice.id,
    }));
}

export function mergeFinanceEntries(
  manualTransactions: Transaction[],
  invoices: Invoice[],
): Transaction[] {
  const manualOnly = manualTransactions.filter((tx) => tx.source !== "invoice");

  return [...invoicesToIncomeTransactions(invoices), ...manualOnly];
}

export function isManualTransaction(transaction: Transaction) {
  return transaction.source !== "invoice";
}

export function getManualTransactions(transactions: Transaction[]) {
  return transactions.filter(isManualTransaction);
}

export function getExpenseFrequency(transaction: Transaction): ExpenseFrequency {
  return transaction.frequency ?? "occasional";
}

export function isRecurringExpense(transaction: Transaction) {
  return transaction.type === "expense" && getExpenseFrequency(transaction) === "recurring";
}

export function getExpenseAmountForMonth(transaction: Transaction, monthKey: string) {
  if (transaction.type !== "expense") return 0;

  if (getExpenseFrequency(transaction) === "occasional") {
    return transaction.date.slice(0, 7) === monthKey ? transaction.amount : 0;
  }

  return transaction.date.slice(0, 7) <= monthKey ? transaction.amount : 0;
}

function getLastNMonthKeys(count: number, from = getCurrentMonthKey()) {
  const [year, month] = from.split("-").map(Number);
  const keys: string[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    keys.push(getCurrentMonthKey(new Date(year, month - 1 - index, 1)));
  }

  return keys;
}

function sumIncomeForMonth(transactions: Transaction[], monthKey: string) {
  return transactions.reduce((sum, tx) => {
    if (tx.type !== "income") return sum;
    return tx.date.slice(0, 7) === monthKey ? sum + tx.amount : sum;
  }, 0);
}

function sumExpensesForMonth(transactions: Transaction[], monthKey: string) {
  return transactions.reduce(
    (sum, tx) => sum + getExpenseAmountForMonth(tx, monthKey),
    0,
  );
}

export function buildMonthlyFinance(transactions: Transaction[]): MonthlyFinancePoint[] {
  const monthKeys = getLastNMonthKeys(6);

  return monthKeys.map((monthKey) => ({
    monthKey,
    month: formatShortMonth(monthKey),
    revenus: sumIncomeForMonth(transactions, monthKey),
    depenses: sumExpensesForMonth(transactions, monthKey),
  }));
}

export type FinanceChartPoint = {
  label: string;
  revenus: number;
  depenses: number;
};

function sumIncomeForDate(transactions: Transaction[], date: string) {
  return transactions.reduce(
    (sum, tx) => (tx.type === "income" && tx.date === date ? sum + tx.amount : sum),
    0,
  );
}

function sumExpensesForDate(transactions: Transaction[], date: string) {
  const monthKey = date.slice(0, 7);
  return transactions.reduce((sum, tx) => {
    if (tx.type !== "expense") return sum;
    if (getExpenseFrequency(tx) === "occasional") {
      return tx.date === date ? sum + tx.amount : sum;
    }
    return tx.date.slice(0, 7) <= monthKey ? sum + tx.amount / 30 : sum;
  }, 0);
}

function getLastNDates(count: number) {
  const dates: string[] = [];
  const today = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    dates.push(date.toISOString().slice(0, 10));
  }

  return dates;
}

function getWeekStartKey(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy.toISOString().slice(0, 10);
}

export function buildFinanceChartByPeriod(
  transactions: Transaction[],
  period: "day" | "week" | "month" | "total",
): FinanceChartPoint[] {
  if (period === "day") {
    return getLastNDates(7).map((date) => ({
      label: new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
      }),
      revenus: sumIncomeForDate(transactions, date),
      depenses: sumExpensesForDate(transactions, date),
    }));
  }

  if (period === "week") {
    const weekStarts: string[] = [];
    const today = new Date();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index * 7);
      weekStarts.push(getWeekStartKey(date));
    }

    return weekStarts.map((weekStart) => {
      const start = new Date(`${weekStart}T12:00:00`);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endKey = end.toISOString().slice(0, 10);

      let revenus = 0;
      let depenses = 0;

      for (const tx of transactions) {
        if (tx.date < weekStart || tx.date > endKey) continue;
        if (tx.type === "income") revenus += tx.amount;
        else depenses += tx.amount;
      }

      return {
        label: new Date(`${weekStart}T12:00:00`).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        revenus,
        depenses,
      };
    });
  }

  const monthCount = period === "total" ? 12 : 8;
  const monthKeys = getLastNMonthKeys(monthCount);

  return monthKeys.map((monthKey) => ({
    label: formatShortMonth(monthKey),
    revenus: sumIncomeForMonth(transactions, monthKey),
    depenses: sumExpensesForMonth(transactions, monthKey),
  }));
}

function sumBenefitForMonth(transactions: Transaction[], monthKey: string) {
  return sumIncomeForMonth(transactions, monthKey) - sumExpensesForMonth(transactions, monthKey);
}

export function getMonthOverMonthGrowth(transactions: Transaction[]) {
  const currentMonth = getCurrentMonthKey();
  const [year, month] = currentMonth.split("-").map(Number);
  const previousMonth = getCurrentMonthKey(new Date(year, month - 2, 1));

  const current = sumBenefitForMonth(transactions, currentMonth);
  const previous = sumBenefitForMonth(transactions, previousMonth);

  if (previous === 0) return null;

  return {
    percent: ((current - previous) / Math.abs(previous)) * 100,
    delta: current - previous,
    current,
    previous,
  };
}

export function buildExpenseCategories(
  transactions: Transaction[],
  monthKey = getCurrentMonthKey(),
): ExpenseCategoryPoint[] {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    const amount = getExpenseAmountForMonth(tx, monthKey);
    if (amount <= 0) continue;
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + amount);
  }

  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] ?? "#94a3b8",
    }));
}

export function getRecentTransactions(transactions: Transaction[], limit = 20) {
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .slice(0, limit);
}

function countMonthsFromStart(startMonthKey: string, untilMonthKey: string) {
  if (startMonthKey > untilMonthKey) return 0;

  const [startYear, startMonth] = startMonthKey.split("-").map(Number);
  const [untilYear, untilMonth] = untilMonthKey.split("-").map(Number);

  return (untilYear - startYear) * 12 + (untilMonth - startMonth) + 1;
}

export function getFinanceSummary(transactions: Transaction[] = []) {
  const currentMonth = getCurrentMonthKey();

  let totalRevenus = 0;
  let totalDepenses = 0;
  let moisRevenus = 0;
  let moisDepenses = 0;
  let moisDepensesOccasionnelles = 0;
  let moisDepensesRecurrentes = 0;

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalRevenus += tx.amount;
      if (tx.date.slice(0, 7) === currentMonth) moisRevenus += tx.amount;
      continue;
    }

    if (getExpenseFrequency(tx) === "occasional") {
      totalDepenses += tx.amount;
      if (tx.date.slice(0, 7) === currentMonth) {
        moisDepenses += tx.amount;
        moisDepensesOccasionnelles += tx.amount;
      }
      continue;
    }

    const activeMonths = countMonthsFromStart(tx.date.slice(0, 7), currentMonth);
    totalDepenses += tx.amount * activeMonths;

    const currentAmount = getExpenseAmountForMonth(tx, currentMonth);
    moisDepenses += currentAmount;
    moisDepensesRecurrentes += currentAmount;
  }

  return {
    totalRevenus,
    totalDepenses,
    benefice: totalRevenus - totalDepenses,
    moisRevenus,
    moisDepenses,
    moisDepensesOccasionnelles,
    moisDepensesRecurrentes,
    moisBenefice: moisRevenus - moisDepenses,
  };
}

export function getRecurringExpenses(transactions: Transaction[]) {
  return transactions.filter(isRecurringExpense);
}

export function getOccasionalExpenses(transactions: Transaction[]) {
  return transactions.filter(
    (tx) => tx.type === "expense" && getExpenseFrequency(tx) === "occasional",
  );
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTransactionDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
