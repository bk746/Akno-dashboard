"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExpenseModal } from "@/components/finances/expense-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { KpiCard } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import {
  buildExpenseCategories,
  buildMonthlyFinance,
  deleteTransaction,
  formatMoney,
  formatTransactionDate,
  getFinanceSummary,
  getOccasionalExpenses,
  getRecentTransactions,
  getRecurringExpenses,
  invoicesToIncomeTransactions,
  loadStoredTransactions,
  mergeFinanceEntries,
  saveStoredTransactions,
  type Transaction,
} from "@/lib/finances";
import { loadStoredInvoices, type Invoice } from "@/lib/invoices";
import Link from "next/link";

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    setTransactions(loadStoredTransactions());
    setInvoices(loadStoredInvoices());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredTransactions(transactions);
  }, [transactions, ready]);

  const mergedTransactions = useMemo(
    () => mergeFinanceEntries(transactions, invoices),
    [transactions, invoices],
  );

  const summary = useMemo(
    () => getFinanceSummary(mergedTransactions),
    [mergedTransactions],
  );
  const monthlyFinance = useMemo(
    () => buildMonthlyFinance(mergedTransactions),
    [mergedTransactions],
  );
  const expenseCategories = useMemo(
    () => buildExpenseCategories(mergedTransactions),
    [mergedTransactions],
  );
  const recentTransactions = useMemo(
    () => getRecentTransactions(mergedTransactions),
    [mergedTransactions],
  );
  const invoiceIncomes = useMemo(
    () => invoicesToIncomeTransactions(invoices),
    [invoices],
  );
  const recurringExpenses = useMemo(
    () => getRecurringExpenses(transactions),
    [transactions],
  );
  const occasionalExpenses = useMemo(
    () => getOccasionalExpenses(transactions),
    [transactions],
  );

  function renderExpenseRows(items: Transaction[]) {
    return [...items]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((tx) => (
        <tr key={tx.id} className="border-b border-neu-text/5">
          <td className="py-3 pr-4 font-medium text-neu-text">{tx.label}</td>
          <td className="py-3 pr-4 text-neu-muted">{tx.category}</td>
          <td className="py-3 pr-4 text-neu-muted">
            {tx.frequency === "recurring"
              ? `Depuis ${formatTransactionDate(tx.date)}`
              : formatTransactionDate(tx.date)}
          </td>
          <td className="py-3 pr-4 text-right font-bold text-neu-accent-3">
            {formatMoney(tx.amount)}
            {tx.frequency === "recurring" && (
              <span className="block text-[10px] font-normal text-neu-muted">/ mois</span>
            )}
          </td>
          <td className="py-3 text-right">
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => openEditModal(tx)}
                className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted hover:text-neu-accent-2"
                aria-label={`Modifier ${tx.label}`}
              >
                <Pencil size={14} />
              </button>
              <DeleteButton
                label={tx.label}
                onConfirm={() =>
                  setTransactions((current) => deleteTransaction(current, tx.id))
                }
              />
            </div>
          </td>
        </tr>
      ));
  }

  function openCreateModal() {
    setEditingTransaction(null);
    setModalOpen(true);
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setModalOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Finances"
        description="Revenus (factures payées) et dépenses — synchronisé avec le dashboard"
        action={
          <NeuButton variant="primary" className="gap-2" onClick={openCreateModal}>
            <Plus size={16} />
            Ajouter une dépense
          </NeuButton>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenus (mois)"
          value={formatMoney(summary.moisRevenus)}
          icon={<ArrowUpRight size={18} />}
        />
        <KpiCard
          label="Dépenses (mois)"
          value={formatMoney(summary.moisDepenses)}
          icon={<ArrowDownRight size={18} />}
        />
        <KpiCard
          label="Bénéfice (mois)"
          value={formatMoney(summary.moisBenefice)}
          icon={<ArrowUpRight size={18} />}
        />
        <KpiCard
          label="Abonnements / mois"
          value={formatMoney(summary.moisDepensesRecurrentes)}
          icon={<ArrowDownRight size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <NeuCard className="xl:col-span-8">
          <p className="mb-6 text-sm font-bold text-neu-text">Revenus & Dépenses</p>
          {monthlyFinance.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyFinance}
                  barGap={6}
                  barCategoryGap="40%"
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  <Bar
                    dataKey="revenus"
                    fill="#3b72c4"
                    radius={[6, 6, 0, 0]}
                    name="Revenus"
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="depenses"
                    fill="#d44a7a"
                    radius={[6, 6, 0, 0]}
                    name="Dépenses"
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-16 text-center text-sm text-neu-muted">
              Ajoutez votre première dépense pour voir le graphique.
            </p>
          )}
        </NeuCard>

        <NeuCard className="xl:col-span-4">
          <p className="mb-4 text-sm font-bold text-neu-text">Répartition dépenses (mois)</p>
          {expenseCategories.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {expenseCategories.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-2">
                {expenseCategories.map((cat) => (
                  <li key={cat.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-neu-text">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: cat.color }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-semibold text-neu-muted">
                      {formatMoney(cat.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-16 text-center text-sm text-neu-muted">
              Aucune dépense ce mois-ci.
            </p>
          )}
        </NeuCard>

        <NeuCard className="xl:col-span-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neu-text">Abonnements mensuels</p>
              <p className="mt-1 text-xs text-neu-muted">
                Comptabilisés automatiquement chaque mois
              </p>
            </div>
            <span className="text-xs font-semibold text-neu-accent-2">
              {formatMoney(summary.moisDepensesRecurrentes)}/mois
            </span>
          </div>
          <div className="overflow-x-auto">
            {recurringExpenses.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                    <th className="pb-3 pr-4 font-semibold">Libellé</th>
                    <th className="pb-3 pr-4 font-semibold">Catégorie</th>
                    <th className="pb-3 pr-4 font-semibold">Depuis</th>
                    <th className="pb-3 pr-4 text-right font-semibold">Montant</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>{renderExpenseRows(recurringExpenses)}</tbody>
              </table>
            ) : (
              <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-10 text-center text-sm text-neu-muted">
                Aucun abonnement. Ajoutez Figma, hébergement, outils… en « Mensuelle ».
              </p>
            )}
          </div>
        </NeuCard>

        <NeuCard className="xl:col-span-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neu-text">Dépenses occasionnelles</p>
              <p className="mt-1 text-xs text-neu-muted">
                Achats ponctuels, pubs, frais ponctuels…
              </p>
            </div>
            <span className="text-xs font-semibold text-neu-muted">
              {formatMoney(summary.moisDepensesOccasionnelles)} ce mois
            </span>
          </div>
          <div className="overflow-x-auto">
            {occasionalExpenses.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                    <th className="pb-3 pr-4 font-semibold">Libellé</th>
                    <th className="pb-3 pr-4 font-semibold">Catégorie</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 pr-4 text-right font-semibold">Montant</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>{renderExpenseRows(occasionalExpenses)}</tbody>
              </table>
            ) : (
              <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-10 text-center text-sm text-neu-muted">
                Aucune dépense ponctuelle ce mois-ci.
              </p>
            )}
          </div>
        </NeuCard>

        <NeuCard className="xl:col-span-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-neu-text">Revenus</p>
              <p className="mt-1 text-xs text-neu-muted">
                Synchronisés automatiquement depuis les factures payées
              </p>
            </div>
            <Link
              href="/factures"
              className="text-xs font-semibold text-neu-accent-2 hover:underline"
            >
              Gérer les factures →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {invoiceIncomes.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                    <th className="pb-3 pr-4 font-semibold">Libellé</th>
                    <th className="pb-3 pr-4 font-semibold">Type</th>
                    <th className="pb-3 pr-4 font-semibold">Date encaissement</th>
                    <th className="pb-3 text-right font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceIncomes.map((tx) => (
                    <tr key={tx.id} className="border-b border-neu-text/5">
                      <td className="py-3 pr-4 font-medium text-neu-text">{tx.label}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-neu-accent-2/15 px-2 py-0.5 text-[10px] font-semibold text-neu-accent-2">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-neu-muted">
                        {formatTransactionDate(tx.date)}
                      </td>
                      <td className="py-3 text-right font-bold text-neu-accent-2">
                        +{formatMoney(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="rounded-xl border border-dashed border-neu-text/10 px-4 py-12 text-center text-sm text-neu-muted">
                Aucun revenu pour l&apos;instant. Créez une facture et marquez-la comme payée
                pour l&apos;voir ici et dans le dashboard.
              </p>
            )}
          </div>
        </NeuCard>

        {recentTransactions.some(
          (tx) => tx.type === "income" && tx.source !== "invoice",
        ) && (
          <NeuCard className="xl:col-span-12">
            <p className="mb-4 text-sm font-bold text-neu-text">Autres revenus</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neu-text/10 text-xs uppercase tracking-wider text-neu-muted">
                    <th className="pb-3 pr-4 font-semibold">Libellé</th>
                    <th className="pb-3 pr-4 font-semibold">Catégorie</th>
                    <th className="pb-3 pr-4 font-semibold">Date</th>
                    <th className="pb-3 text-right font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions
                    .filter((tx) => tx.type === "income" && tx.source !== "invoice")
                    .map((tx) => (
                      <tr key={tx.id} className="border-b border-neu-text/5">
                        <td className="py-3 pr-4 font-medium text-neu-text">{tx.label}</td>
                        <td className="py-3 pr-4 text-neu-muted">{tx.category}</td>
                        <td className="py-3 pr-4 text-neu-muted">
                          {formatTransactionDate(tx.date)}
                        </td>
                        <td className="py-3 text-right font-bold text-neu-accent-2">
                          +{formatMoney(tx.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </NeuCard>
        )}
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        transactions={transactions}
        editingTransaction={editingTransaction}
        onSave={setTransactions}
      />
    </>
  );
}
