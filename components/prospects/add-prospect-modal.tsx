"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
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
  contactStepOptions,
  createProspect,
  normalizeWebsite,
  pipelineConfig,
  type ContactStep,
  type NewProspectInput,
  type Prospect,
  type ProspectPipeline,
} from "@/lib/prospects";
import { cn } from "@/lib/utils";

type AddProspectModalProps = {
  open: boolean;
  onClose: () => void;
  prospects: Prospect[];
  onAdd: (prospect: Prospect) => void;
};

type FormState = {
  pipeline: ProspectPipeline;
  firstName: string;
  lastName: string;
  company: string;
  website: string;
  contactStep: ContactStep;
  email: string;
  phone: string;
  notes: string;
};

const initialForm: FormState = {
  pipeline: "sur-mesure",
  firstName: "",
  lastName: "",
  company: "",
  website: "",
  contactStep: "none",
  email: "",
  phone: "",
  notes: "",
};

export function AddProspectModal({
  open,
  onClose,
  prospects,
  onAdd,
}: AddProspectModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.company.trim()) {
      setError("Prénom, nom et entreprise sont obligatoires.");
      return;
    }

    const input: NewProspectInput = {
      pipeline: form.pipeline,
      firstName: form.firstName,
      lastName: form.lastName,
      company: form.company,
      website: form.website ? normalizeWebsite(form.website) : undefined,
      contactStep: form.contactStep,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
    };

    const prospect = createProspect(prospects, input);
    onAdd(prospect);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-neu-text/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fermer"
      />

      <NeuCard className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neu-text">Ajouter un prospect</h2>
            <p className="mt-1 text-sm text-neu-muted">
              Choisissez pour qui et où vous en êtes dans la prospection.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuFieldGroup>
            <NeuLabel htmlFor="pipeline" required>
              Pour qui ?
            </NeuLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["sur-mesure", "templates"] as ProspectPipeline[]).map((pipeline) => {
                const config = pipelineConfig[pipeline];
                const selected = form.pipeline === pipeline;

                return (
                  <button
                    key={pipeline}
                    type="button"
                    onClick={() => updateField("pipeline", pipeline)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-[1.25rem] border-2 p-4 text-left transition-all duration-200",
                      selected
                        ? "border-neu-accent-2 bg-neu-accent-2/12 shadow-[inset_0_0_0_1px_rgba(59,114,196,0.15)]"
                        : "neu-cell border-transparent hover:border-neu-text/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          selected ? "text-neu-accent-2" : "text-neu-text",
                        )}
                      >
                        {config.owner}
                      </p>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          selected
                            ? "border-neu-accent-2 bg-neu-accent-2"
                            : "border-neu-muted/30 bg-transparent",
                        )}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        selected ? "font-medium text-neu-accent-2/80" : "text-neu-muted",
                      )}
                    >
                      {config.label}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[11px]",
                        selected ? "text-neu-accent-2/70" : "text-neu-muted/80",
                      )}
                    >
                      {config.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </NeuFieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup>
              <NeuLabel htmlFor="firstName" required>
                Prénom
              </NeuLabel>
              <NeuInput
                id="firstName"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Jean"
                autoFocus
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="lastName" required>
                Nom
              </NeuLabel>
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
              type="url"
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
              onChange={(e) =>
                updateField("contactStep", e.target.value as ContactStep)
              }
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
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
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
    </div>
  );
}
