"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useProspects } from "@/components/prospects/prospects-context";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { NeuCard } from "@/components/ui/neu-card";
import {
  NeuButton,
  NeuFieldGroup,
  NeuInput,
  NeuLabel,
  NeuSelect,
  NeuTextarea,
} from "@/components/ui/neu-form";
import {
  boardConfig,
  contactStepOptions,
  normalizeWebsite,
  prospectBoards,
  type ContactStep,
  type NewProspectInput,
  type ProspectBoard,
} from "@/lib/prospects";
import { cn } from "@/lib/utils";

type AddProspectModalProps = {
  open: boolean;
  onClose: () => void;
  defaultBoard?: ProspectBoard;
};

type FormState = {
  board: ProspectBoard;
  firstName: string;
  lastName: string;
  company: string;
  website: string;
  contactStep: ContactStep;
  email: string;
  phone: string;
  notes: string;
};

function buildInitialForm(defaultBoard: ProspectBoard): FormState {
  return {
    board: defaultBoard,
    firstName: "",
    lastName: "",
    company: "",
    website: "",
    contactStep: "none",
    email: "",
    phone: "",
    notes: "",
  };
}

export function AddProspectModal({
  open,
  onClose,
  defaultBoard = "keryan",
}: AddProspectModalProps) {
  const { addProspect } = useProspects();
  const [form, setForm] = useState<FormState>(() => buildInitialForm(defaultBoard));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(defaultBoard));
    setError(null);
  }, [open, defaultBoard]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.company.trim()) {
      setError("Le nom de l'entreprise est obligatoire.");
      return;
    }

    const input: NewProspectInput = {
      board: form.board,
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
      website: form.website ? normalizeWebsite(form.website) : undefined,
      contactStep: form.contactStep,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
    };

    addProspect(input);
    onClose();
  }

  return (
    <ModalOverlay open={open} onClose={onClose} panelClassName="max-w-lg">
      <NeuCard className="p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neu-text">Ajouter un prospect</h2>
            <p className="mt-1 text-sm text-neu-muted">
              Choisissez la page (Keryan, Louise ou Prospection IA).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="neu-flat flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neu-muted"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <NeuFieldGroup>
            <NeuLabel htmlFor="board" required>
              Page
            </NeuLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {prospectBoards.map((board) => {
                const config = boardConfig[board];
                const selected = form.board === board;

                return (
                  <button
                    key={board}
                    type="button"
                    onClick={() => updateField("board", board)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-[1.25rem] border-2 p-3 text-left transition-all duration-200",
                      selected
                        ? board === "ia"
                          ? "border-violet-500 bg-violet-50"
                          : "border-neu-accent-2 bg-neu-accent-2/12"
                        : "neu-cell border-transparent hover:border-neu-text/10",
                    )}
                  >
                    <p className="text-sm font-bold text-neu-text">{config.label}</p>
                    <p className="mt-0.5 text-[11px] text-neu-muted">{config.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel htmlFor="firstName">Prénom (optionnel)</NeuLabel>
              <NeuInput
                id="firstName"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Jean"
                autoFocus
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="lastName">Nom (optionnel)</NeuLabel>
              <NeuInput
                id="lastName"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Dupont"
              />
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel htmlFor="company" required>
              Entreprise
            </NeuLabel>
            <NeuInput
              id="company"
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
              placeholder="Dupont Électricité"
            />
          </NeuFieldGroup>

          <NeuFieldGroup>
            <NeuLabel htmlFor="website">Lien site web</NeuLabel>
            <NeuInput
              id="website"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://exemple.fr"
            />
          </NeuFieldGroup>

          <NeuFieldGroup>
            <NeuLabel htmlFor="contactStep" required>
              Étape de contact
            </NeuLabel>
            <NeuSelect
              id="contactStep"
              value={form.contactStep}
              onChange={(e) => updateField("contactStep", e.target.value as ContactStep)}
            >
              {contactStepOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NeuSelect>
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel htmlFor="email">Email</NeuLabel>
              <NeuInput
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="contact@entreprise.fr"
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="phone">Téléphone</NeuLabel>
              <NeuInput
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
              />
            </NeuFieldGroup>
          </div>

          <NeuFieldGroup>
            <NeuLabel htmlFor="notes">Notes</NeuLabel>
            <NeuTextarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Infos utiles sur le prospect…"
            />
          </NeuFieldGroup>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <NeuButton type="button" variant="secondary" onClick={onClose}>
              Annuler
            </NeuButton>
            <NeuButton type="submit" variant="primary">
              Ajouter le prospect
            </NeuButton>
          </div>
        </form>
      </NeuCard>
    </ModalOverlay>
  );
}
