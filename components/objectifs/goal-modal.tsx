"use client";

import { Target, X } from "lucide-react";
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
  createGoal,
  goalPeriodLabels,
  goalUnitOptions,
  updateGoal,
  type Goal,
  type GoalInput,
  type GoalPeriod,
} from "@/lib/goals";

type GoalModalProps = {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  defaultPeriod: GoalPeriod;
  editingGoal?: Goal | null;
  onSave: (goals: Goal[]) => void;
};

const emptyForm = (period: GoalPeriod): GoalInput => ({
  label: "",
  current: 0,
  target: 100,
  unit: "€",
  period,
});

export function GoalModal({
  open,
  onClose,
  goals,
  defaultPeriod,
  editingGoal,
  onSave,
}: GoalModalProps) {
  const [form, setForm] = useState<GoalInput>(emptyForm(defaultPeriod));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (editingGoal) {
      setForm({
        label: editingGoal.label,
        current: editingGoal.current,
        target: editingGoal.target,
        unit: editingGoal.unit,
        period: editingGoal.period,
      });
    } else {
      setForm(emptyForm(defaultPeriod));
    }

    setError(null);
  }, [open, editingGoal, defaultPeriod]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.label.trim()) {
      setError("Donnez un nom à l'objectif.");
      return;
    }

    if (form.target <= 0) {
      setError("La cible doit être supérieure à 0.");
      return;
    }

    if (editingGoal) {
      onSave(updateGoal(goals, editingGoal.id, form));
    } else {
      onSave([createGoal(goals, form), ...goals]);
    }

    onClose();
  }

  return (
    <ModalOverlay open={open} onClose={onClose} panelClassName="max-w-md">
      <NeuCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-neu-accent-2" />
            <p className="font-bold text-neu-text">
              {editingGoal ? "Modifier l'objectif" : "Nouvel objectif"}
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
            <NeuLabel htmlFor="goal-label">Nom de l&apos;objectif</NeuLabel>
            <NeuInput
              id="goal-label"
              value={form.label}
              onChange={(event) =>
                setForm((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="Ex. Chiffre d'affaires, Devis signés…"
            />
          </NeuFieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <NeuFieldGroup>
              <NeuLabel htmlFor="goal-period">Période</NeuLabel>
              <NeuSelect
                id="goal-period"
                value={form.period}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    period: event.target.value as GoalPeriod,
                  }))
                }
              >
                {(Object.keys(goalPeriodLabels) as GoalPeriod[]).map((key) => (
                  <option key={key} value={key}>
                    {goalPeriodLabels[key]}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="goal-unit">Unité</NeuLabel>
              <NeuSelect
                id="goal-unit"
                value={form.unit}
                onChange={(event) =>
                  setForm((current) => ({ ...current, unit: event.target.value }))
                }
              >
                {goalUnitOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NeuFieldGroup>
              <NeuLabel htmlFor="goal-current">Actuel</NeuLabel>
              <NeuInput
                id="goal-current"
                type="number"
                min={0}
                value={form.current || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    current: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="goal-target">Cible</NeuLabel>
              <NeuInput
                id="goal-target"
                type="number"
                min={1}
                value={form.target || ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    target: Math.max(1, Number(event.target.value) || 1),
                  }))
                }
              />
            </NeuFieldGroup>
          </div>

          {error && (
            <p className="rounded-xl bg-neu-accent-3/10 px-3 py-2 text-xs text-neu-accent-3">
              {error}
            </p>
          )}

          <NeuButton type="submit" variant="primary" className="w-full">
            {editingGoal ? "Enregistrer" : "Créer l'objectif"}
          </NeuButton>
        </form>
      </NeuCard>
    </ModalOverlay>
  );
}
