"use client";

import { Receipt, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { NeuCard } from "@/components/ui/neu-card";
import {
  NeuButton,
  NeuFieldGroup,
  NeuInput,
  NeuLabel,
  NeuSelect,
} from "@/components/ui/neu-form";
import {
  createTransaction,
  expenseCategoryOptions,
  expenseFrequencyLabels,
  updateTransaction,
  type ExpenseFrequency,
  type Transaction,
  type TransactionInput,
} from "@/lib/finances";
import { getCurrentMonthKey } from "@/lib/month-filter";
import { cn } from "@/lib/utils";

type ExpenseModalProps = {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  editingTransaction?: Transaction | null;
  onSave: (transactions: Transaction[]) => void;
};

const emptyForm = (): TransactionInput => ({
  label: "",
  amount: 0,
  type: "expense",
  category: expenseCategoryOptions[0],
  date: new Date().toISOString().slice(0, 10),
  frequency: "occasional",
});

export function ExpenseModal({
  open,
  onClose,
  transactions,
  editingTransaction,
  onSave,
}: ExpenseModalProps) {
  const [form, setForm] = useState<TransactionInput>(emptyForm());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (editingTransaction) {
      setForm({
        label: editingTransaction.label,
        amount: editingTransaction.amount,
        type: editingTransaction.type,
        category: editingTransaction.category,
        date: editingTransaction.date,
        frequency: editingTransaction.frequency ?? "occasional",
      });
    } else {
      setForm(emptyForm());
    }

    setError(null);
  }, [open, editingTransaction]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.label.trim()) {
      setError("Donnez un libellé à la dépense.");
      return;
    }

    if (form.amount <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }

    if (!form.date) {
      setError("Choisissez une date.");
      return;
    }

    if (editingTransaction) {
      onSave(updateTransaction(transactions, editingTransaction.id, form));
    } else {
      onSave([createTransaction(transactions, form), ...transactions]);
    }

    onClose();
  }

  const isRecurring = form.frequency === "recurring";

  return (
    <ModalOverlay open={open} onClose={onClose} panelClassName="max-w-md">
      <NeuCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-neu-accent-3" />
            <p className="font-bold text-neu-text">
              {editingTransaction ? "Modifier la dépense" : "Nouvelle dépense"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-flat flex h-9 w-9 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuFieldGroup>
            <NeuLabel>Type de dépense</NeuLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["occasional", "recurring"] as ExpenseFrequency[]).map((frequency) => (
                <button
                  key={frequency}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, frequency }))}
                  className={cn(
                    "rounded-xl px-3 py-3 text-left text-xs font-semibold transition-colors",
                    form.frequency === frequency
                      ? "bg-neu-accent-2 text-white"
                      : "neu-flat text-neu-muted hover:text-neu-text",
                  )}
                >
                  {expenseFrequencyLabels[frequency]}
                  <span className="mt-1 block font-normal opacity-80">
                    {frequency === "occasional"
                      ? "Une seule fois"
                      : "Comptée chaque mois"}
                  </span>
                </button>
              ))}
            </div>
          </NeuFieldGroup>

          <NeuFieldGroup>
            <NeuLabel htmlFor="expense-label">Libellé</NeuLabel>
            <NeuInput
              id="expense-label"
              value={form.label}
              onChange={(event) =>
                setForm((current) => ({ ...current, label: event.target.value }))
              }
              placeholder={
                isRecurring
                  ? "Ex. Figma, Notion, Hébergement OVH…"
                  : "Ex. Pub Google, Achat matériel…"
              }
            />
          </NeuFieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <NeuFieldGroup>
              <NeuLabel htmlFor="expense-amount">
                {isRecurring ? "Montant / mois (€)" : "Montant (€)"}
              </NeuLabel>
              <NeuInput
                id="expense-amount"
                type="number"
                min={0}
                step={0.01}
                value={form.amount || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="expense-date">
                {isRecurring ? "Depuis le" : "Date"}
              </NeuLabel>
              <NeuInput
                id="expense-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
              />
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel htmlFor="expense-category">Catégorie</NeuLabel>
            <NeuSelect
              id="expense-category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
            >
              {expenseCategoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </NeuSelect>
          </NeuFieldGroup>

          {error && (
            <p className="rounded-xl bg-neu-accent-3/10 px-3 py-2 text-xs text-neu-accent-3">
              {error}
            </p>
          )}

          <NeuButton type="submit" variant="primary" className="w-full">
            {editingTransaction ? "Enregistrer" : "Ajouter la dépense"}
          </NeuButton>
        </form>

        <p className="mt-3 text-center text-[10px] text-neu-muted">
          {isRecurring
            ? "Les abonnements sont automatiquement comptés chaque mois dans Finances et le dashboard."
            : `Mois en cours : ${getCurrentMonthKey().slice(5, 7)}/${getCurrentMonthKey().slice(0, 4)}`}
        </p>
      </NeuCard>
    </ModalOverlay>
  );
}
