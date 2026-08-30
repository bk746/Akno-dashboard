"use client";

import { Minus, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GoalModal } from "@/components/objectifs/goal-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { MotionFilterButton } from "@/components/ui/motion-primitives";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar, ProgressRing } from "@/components/ui/progress-ring";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import {
  formatGoalProgress,
  formatGoalValue,
  getGoalProgressPercent,
  getGoalsByPeriod,
  goalPeriodLabels,
  loadStoredGoals,
  saveStoredGoals,
  updateGoalCurrent,
  type Goal,
  type GoalPeriod,
} from "@/lib/goals";

const periods: { id: GoalPeriod; label: string }[] = [
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
];

export default function ObjectifsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ready, setReady] = useState(false);
  const [period, setPeriod] = useState<GoalPeriod>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    setGoals(loadStoredGoals());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredGoals(goals);
  }, [goals, ready]);

  const periodGoals = getGoalsByPeriod(goals, period);
  const mainGoal = periodGoals[0];

  function openCreateModal() {
    setEditingGoal(null);
    setModalOpen(true);
  }

  function openEditModal(goal: Goal) {
    setEditingGoal(goal);
    setModalOpen(true);
  }

  function deleteGoal(id: number) {
    setGoals((current) => current.filter((goal) => goal.id !== id));
  }

  function adjustCurrent(id: number, delta: number) {
    setGoals((current) =>
      updateGoalCurrent(
        current,
        id,
        (current.find((goal) => goal.id === id)?.current ?? 0) + delta,
      ),
    );
  }

  return (
    <>
      <PageHeader
        title="Objectifs"
        description="Créez et suivez vos objectifs semaine, mois et année"
        action={
          <NeuButton variant="primary" className="gap-2" onClick={openCreateModal}>
            <Plus size={16} />
            Nouvel objectif
          </NeuButton>
        }
      />

      <div className="mb-8 flex gap-2">
        {periods.map(({ id, label }) => (
          <MotionFilterButton
            key={id}
            active={period === id}
            onClick={() => setPeriod(id)}
          >
            {label} ({getGoalsByPeriod(goals, id).length})
          </MotionFilterButton>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {periodGoals.length === 0 ? (
          <NeuCard className="xl:col-span-12 py-16 text-center">
            <p className="text-sm font-medium text-neu-text">
              Aucun objectif pour {goalPeriodLabels[period].toLowerCase()}
            </p>
            <p className="mt-2 text-sm text-neu-muted">
              Ex. : chiffre d&apos;affaires, devis signés, appels prospection…
            </p>
            <NeuButton variant="primary" className="mt-6 gap-2" onClick={openCreateModal}>
              <Plus size={16} />
              Créer un objectif
            </NeuButton>
          </NeuCard>
        ) : (
          <>
            {mainGoal && (
              <NeuCard className="flex flex-col items-center justify-center xl:col-span-4">
                <ProgressRing
                  value={mainGoal.current}
                  max={mainGoal.target}
                  size={120}
                  stroke={9}
                  label={mainGoal.label}
                  sublabel={formatGoalProgress(
                    mainGoal.current,
                    mainGoal.target,
                    mainGoal.unit,
                  )}
                />
                <p className="mt-4 text-center text-xs text-neu-muted">
                  Objectif principal — {goalPeriodLabels[period].toLowerCase()}
                </p>
              </NeuCard>
            )}

            <NeuCard className="xl:col-span-8">
              <p className="mb-6 text-sm font-bold text-neu-text">Vos objectifs</p>
              <div className="space-y-5">
                {periodGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-neu-text/8 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <p className="text-xs text-neu-muted">
                        {formatGoalProgress(goal.current, goal.target, goal.unit)} ·{" "}
                        {getGoalProgressPercent(goal.current, goal.target)} %
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(goal)}
                          className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted hover:text-neu-accent-2"
                          aria-label={`Modifier ${goal.label}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <DeleteButton
                          label={`l'objectif ${goal.label}`}
                          onConfirm={() => deleteGoal(goal.id)}
                        />
                      </div>
                    </div>

                    <ProgressBar
                      label={goal.label}
                      current={goal.current}
                      target={goal.target}
                      unit={goal.unit}
                    />

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustCurrent(goal.id, -1)}
                        className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted"
                        aria-label="Diminuer"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={goal.current}
                        onChange={(event) =>
                          setGoals((current) =>
                            updateGoalCurrent(
                              current,
                              goal.id,
                              Math.max(0, Number(event.target.value) || 0),
                            ),
                          )
                        }
                        className="neu-inset w-24 rounded-xl px-3 py-2 text-center text-sm font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => adjustCurrent(goal.id, 1)}
                        className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted"
                        aria-label="Augmenter"
                      >
                        <Plus size={14} />
                      </button>
                      <span className="text-xs text-neu-muted">
                        sur {formatGoalValue(goal.target, goal.unit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>

            <NeuCard className="xl:col-span-12">
              <p className="mb-4 text-sm font-bold text-neu-text">Récapitulatif</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {periodGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="neu-inset rounded-2xl p-4 text-center"
                  >
                    <p className="text-3xl font-bold text-neu-accent-2">
                      {getGoalProgressPercent(goal.current, goal.target)}%
                    </p>
                    <p className="mt-1 text-xs font-semibold text-neu-text">
                      {goal.label}
                    </p>
                    <p className="text-[10px] text-neu-muted">
                      {formatGoalProgress(goal.current, goal.target, goal.unit)}
                    </p>
                  </div>
                ))}
              </div>
            </NeuCard>
          </>
        )}
      </div>

      <GoalModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGoal(null);
        }}
        goals={goals}
        defaultPeriod={period}
        editingGoal={editingGoal}
        onSave={setGoals}
      />
    </>
  );
}
