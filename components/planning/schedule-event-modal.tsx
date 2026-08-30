"use client";

import { X } from "lucide-react";
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
  createScheduleItem,
  deleteScheduleItem,
  minutesToTime,
  scheduleCategoryLabels,
  timeToMinutes,
  updateScheduleItem,
  type ScheduleCategory,
  type ScheduleItem,
  type ScheduleItemInput,
} from "@/lib/planner";
import { cn } from "@/lib/utils";

type ScheduleEventModalProps = {
  open: boolean;
  onClose: () => void;
  schedule: ScheduleItem[];
  defaultDate: string;
  defaultTime?: string;
  editingItem?: ScheduleItem | null;
  onSave: (schedule: ScheduleItem[]) => void;
};

const durationPresets = [
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
  { label: "1 h 30", minutes: 90 },
  { label: "2 h", minutes: 120 },
];

const emptyForm = (date: string, time = "09:00"): ScheduleItemInput => ({
  title: "",
  date,
  time,
  endTime: minutesToTime(timeToMinutes(time) + 60),
  notes: "",
  category: "client",
});

export function ScheduleEventModal({
  open,
  onClose,
  schedule,
  defaultDate,
  defaultTime = "09:00",
  editingItem,
  onSave,
}: ScheduleEventModalProps) {
  const [form, setForm] = useState<ScheduleItemInput>(emptyForm(defaultDate, defaultTime));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    if (editingItem) {
      setForm({
        title: editingItem.title,
        date: editingItem.date,
        time: editingItem.time,
        endTime: editingItem.endTime ?? "",
        notes: editingItem.notes ?? "",
        category: editingItem.category,
      });
    } else {
      setForm(emptyForm(defaultDate, defaultTime));
    }

    setError(null);
  }, [open, editingItem, defaultDate, defaultTime]);

  function applyDuration(minutes: number) {
    setForm((current) => ({
      ...current,
      endTime: minutesToTime(timeToMinutes(current.time) + minutes),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Donnez un titre au créneau.");
      return;
    }

    if (form.endTime && form.endTime <= form.time) {
      setError("L'heure de fin doit être après le début.");
      return;
    }

    const payload: ScheduleItemInput = {
      ...form,
      endTime: form.endTime || undefined,
    };

    if (editingItem) {
      onSave(updateScheduleItem(schedule, editingItem.id, payload));
    } else {
      onSave([...schedule, createScheduleItem(schedule, payload)]);
    }

    onClose();
  }

  function handleDelete() {
    if (!editingItem) return;
    onSave(deleteScheduleItem(schedule, editingItem.id));
    onClose();
  }

  return (
    <ModalOverlay open={open} onClose={onClose} panelClassName="max-w-lg">
      <NeuCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-neu-text">
              {editingItem ? "Modifier le créneau" : "Nouveau créneau"}
            </p>
            <p className="mt-0.5 text-xs text-neu-muted">
              Planifiez vos rendez-vous clients et tâches
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
            <NeuLabel htmlFor="event-title">Titre</NeuLabel>
            <NeuInput
              id="event-title"
              autoFocus
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Ex. Call client Dupont, Livraison site…"
            />
          </NeuFieldGroup>

          <div className="grid grid-cols-2 gap-3">
            <NeuFieldGroup>
              <NeuLabel htmlFor="event-date">Date</NeuLabel>
              <NeuInput
                id="event-date"
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, date: event.target.value }))
                }
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel htmlFor="event-category">Catégorie</NeuLabel>
              <NeuSelect
                id="event-category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ScheduleCategory,
                  }))
                }
              >
                {(Object.keys(scheduleCategoryLabels) as ScheduleCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {scheduleCategoryLabels[key]}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NeuFieldGroup>
              <NeuLabel htmlFor="event-start">Début</NeuLabel>
              <NeuInput
                id="event-start"
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm((current) => ({ ...current, time: event.target.value }))
                }
              />
            </NeuFieldGroup>
            <NeuFieldGroup>
              <NeuLabel htmlFor="event-end">Fin</NeuLabel>
              <NeuInput
                id="event-end"
                type="time"
                value={form.endTime ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endTime: event.target.value }))
                }
              />
            </NeuFieldGroup>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neu-muted">
              Durée rapide
            </p>
            <div className="flex flex-wrap gap-2">
              {durationPresets.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => applyDuration(preset.minutes)}
                  className={cn(
                    "rounded-full border border-akno-border px-3 py-1.5 text-xs font-semibold text-akno-text hover:bg-akno-bg",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <NeuFieldGroup>
            <NeuLabel htmlFor="event-notes">Notes (optionnel)</NeuLabel>
            <textarea
              id="event-notes"
              value={form.notes ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Lien visio, adresse, rappels…"
              rows={3}
              className="neu-inset-md neu-focus w-full resize-none rounded-[1.25rem] px-4 py-3 text-sm text-neu-text outline-none placeholder:text-neu-muted/60"
            />
          </NeuFieldGroup>

          {error && (
            <p className="rounded-xl bg-neu-accent-3/10 px-3 py-2 text-xs text-neu-accent-3">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {editingItem ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Supprimer le créneau « ${editingItem.title} » ?`,
                    )
                  ) {
                    handleDelete();
                  }
                }}
                className="text-sm font-semibold text-akno-danger hover:underline"
              >
                Supprimer
              </button>
            ) : (
              <span />
            )}
            <NeuButton type="submit" variant="primary" className="w-full sm:w-auto">
              {editingItem ? "Enregistrer" : "Ajouter au planning"}
            </NeuButton>
          </div>
        </form>
      </NeuCard>
    </ModalOverlay>
  );
}
