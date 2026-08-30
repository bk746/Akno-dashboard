"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  MapPin,
  Sparkles,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ClientFormPreview } from "@/components/clients/client-form-preview";
import { ClientSectorPicker } from "@/components/clients/client-sector-picker";
import { ClientSourcePicker } from "@/components/clients/client-source-picker";
import { ClientStatusPicker } from "@/components/clients/client-status-picker";
import { NeuButton } from "@/components/ui/neu-form";
import {
  NeuFieldGroup,
  NeuInput,
  NeuLabel,
  NeuTextarea,
} from "@/components/ui/neu-form";
import {
  CLIENT_FORM_STEPS,
  clientToFormData,
  formDataToClientPayload,
  getClientFormProgress,
  getClientInitials,
  initialClientForm,
  validateClientFormStep,
  type ClientFormData,
  type ClientFormStepId,
} from "@/lib/client-form";
import {
  createClient,
  loadStoredClients,
  saveStoredClients,
  updateClient,
  type Client,
  type ClientStatus,
} from "@/lib/clients";
import { cn } from "@/lib/utils";

type ClientFormWizardProps = {
  mode: "create" | "edit";
  clientId?: number;
};

function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-akno-subtle">
        €
      </span>
      <NeuInput
        id={id}
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

function StepHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4 border-b border-akno-border pb-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-akno-primary-soft text-akno-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-akno-text">{title}</h2>
        <p className="mt-0.5 text-sm text-akno-muted">{description}</p>
      </div>
    </div>
  );
}

export function ClientFormWizard({ mode, clientId }: ClientFormWizardProps) {
  const [form, setForm] = useState<ClientFormData>(initialClientForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loaded, setLoaded] = useState(mode === "create");
  const [clientMissing, setClientMissing] = useState(false);
  const [savedClient, setSavedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !clientId) return;

    const found = loadStoredClients().find((item) => item.id === clientId);
    if (found) {
      setForm(clientToFormData(found));
    } else {
      setClientMissing(true);
    }
    setLoaded(true);
  }, [mode, clientId]);

  const currentStep = CLIENT_FORM_STEPS[stepIndex];
  const isLastStep = stepIndex === CLIENT_FORM_STEPS.length - 1;
  const progress = getClientFormProgress(form, stepIndex);

  const initials = useMemo(
    () => getClientInitials(form.firstName, form.lastName),
    [form.firstName, form.lastName],
  );

  if (mode === "edit" && !loaded) {
    return (
      <div className="akno-card flex min-h-[320px] items-center justify-center">
        <p className="text-sm text-akno-muted">Chargement du dossier client…</p>
      </div>
    );
  }

  function update(field: keyof ClientFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function goToStep(index: number) {
    if (mode === "create" && index > stepIndex) return;
    setStepIndex(index);
    setErrors({});
  }

  function handleNext() {
    const stepErrors = validateClientFormStep(currentStep.id, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      setErrors({});
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const stepErrors = validateClientFormStep(currentStep.id, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    const payload = formDataToClientPayload(form);
    const existing = loadStoredClients();

    if (mode === "edit" && clientId) {
      const next = updateClient(existing, clientId, payload);
      saveStoredClients(next);
      const updated = next.find((item) => item.id === clientId) ?? null;
      setSavedClient(updated);
    } else {
      const client = createClient(existing, payload);
      saveStoredClients([client, ...existing]);
      setSavedClient(client);
    }

    setSubmitted(true);
  }

  if (clientMissing) {
    return (
      <div className="akno-card mx-auto max-w-lg py-16 text-center">
        <p className="text-sm font-medium text-akno-text">Client introuvable</p>
        <Link href="/clients" className="mt-6 inline-block">
          <NeuButton variant="secondary">Retour à mes clients</NeuButton>
        </Link>
      </div>
    );
  }

  if (submitted && savedClient) {
    return (
      <div className="akno-card mx-auto max-w-xl overflow-hidden">
        <div className="bg-gradient-to-br from-akno-primary to-[#5851ea] px-8 py-10 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Client onboardé" : "Profil mis à jour"}
          </h2>
          <p className="mt-2 text-sm text-white/85">
            {savedClient.name} · {savedClient.company}
          </p>
        </div>
        <div className="space-y-4 p-8">
          <ClientFormPreview form={form} initials={initials} compact />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/clients">
              <NeuButton variant="secondary" className="w-full sm:w-auto">
                Voir mes clients
              </NeuButton>
            </Link>
            {mode === "create" ? (
              <>
                <Link href="/devis/nouveau">
                  <NeuButton variant="primary" className="w-full gap-2 sm:w-auto">
                    <FileText size={16} />
                    Créer un devis
                  </NeuButton>
                </Link>
                <NeuButton
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setForm(initialClientForm);
                    setStepIndex(0);
                    setSubmitted(false);
                    setSavedClient(null);
                  }}
                >
                  Ajouter un autre client
                </NeuButton>
              </>
            ) : (
              <NeuButton variant="primary" onClick={() => setSubmitted(false)}>
                Continuer l&apos;édition
              </NeuButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep.id as ClientFormStepId) {
      case "contact":
        return (
          <>
            <StepHeader
              icon={<User size={20} />}
              title="Contact principal"
              description="Identifiez le décideur avec qui vous travaillez au quotidien."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NeuFieldGroup>
                <NeuLabel htmlFor="firstName" required>
                  Prénom
                </NeuLabel>
                <NeuInput
                  id="firstName"
                  autoFocus
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="Sophie"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-akno-danger">{errors.firstName}</p>
                )}
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="lastName" required>
                  Nom
                </NeuLabel>
                <NeuInput
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Martin"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-akno-danger">{errors.lastName}</p>
                )}
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="email" required>
                  Email professionnel
                </NeuLabel>
                <NeuInput
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="sophie@entreprise.fr"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-akno-danger">{errors.email}</p>
                )}
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="phone" required>
                  Téléphone
                </NeuLabel>
                <NeuInput
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-akno-danger">{errors.phone}</p>
                )}
              </NeuFieldGroup>
              <NeuFieldGroup className="sm:col-span-2">
                <NeuLabel htmlFor="jobTitle">Fonction / rôle</NeuLabel>
                <NeuInput
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                  placeholder="Directrice marketing, Gérant, CEO…"
                />
              </NeuFieldGroup>
            </div>
          </>
        );

      case "organization":
        return (
          <>
            <StepHeader
              icon={<Building2 size={20} />}
              title="Organisation"
              description="Structure légale et secteur d'activité du compte client."
            />
            <div className="space-y-6">
              <NeuFieldGroup>
                <NeuLabel htmlFor="company" required>
                  Raison sociale
                </NeuLabel>
                <NeuInput
                  id="company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Martin & Co SAS"
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-akno-danger">{errors.company}</p>
                )}
              </NeuFieldGroup>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NeuFieldGroup>
                  <NeuLabel htmlFor="siret">SIRET</NeuLabel>
                  <NeuInput
                    id="siret"
                    value={form.siret}
                    onChange={(e) => update("siret", e.target.value)}
                    placeholder="123 456 789 00012"
                  />
                </NeuFieldGroup>
                <NeuFieldGroup>
                  <NeuLabel htmlFor="website">Site web</NeuLabel>
                  <NeuInput
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://www.entreprise.fr"
                  />
                </NeuFieldGroup>
              </div>

              <div>
                <NeuLabel>Secteur d&apos;activité</NeuLabel>
                <p className="mb-3 text-xs text-akno-muted">
                  Sélectionnez le segment le plus proche de l&apos;activité client.
                </p>
                <ClientSectorPicker
                  value={form.sector}
                  onChange={(value) => update("sector", value)}
                />
              </div>
            </div>
          </>
        );

      case "location":
        return (
          <>
            <StepHeader
              icon={<MapPin size={20} />}
              title="Localisation"
              description="Adresse du siège et notes internes pour votre équipe."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <NeuFieldGroup className="sm:col-span-2">
                <NeuLabel htmlFor="address">Adresse</NeuLabel>
                <NeuInput
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="12 rue de la Paix"
                />
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="postalCode">Code postal</NeuLabel>
                <NeuInput
                  id="postalCode"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  placeholder="75002"
                />
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="city">Ville</NeuLabel>
                <NeuInput
                  id="city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Paris"
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="sm:col-span-2">
                <NeuLabel htmlFor="country">Pays</NeuLabel>
                <NeuInput
                  id="country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="France"
                />
              </NeuFieldGroup>
              <NeuFieldGroup className="sm:col-span-2">
                <NeuLabel htmlFor="notes">Notes internes</NeuLabel>
                <NeuTextarea
                  id="notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Contexte commercial, besoins identifiés, interlocuteurs secondaires, prochaines étapes…"
                />
                <p className="mt-1.5 text-[11px] text-akno-subtle">
                  Visible uniquement par votre équipe — jamais partagé avec le client.
                </p>
              </NeuFieldGroup>
            </div>
          </>
        );

      case "commercial":
        return (
          <>
            <StepHeader
              icon={<TrendingUp size={20} />}
              title="Contrat & revenus"
              description="Qualifiez le compte et fixez les montants commerciaux."
            />
            <div className="space-y-6">
              <div>
                <NeuLabel>Statut du compte</NeuLabel>
                <p className="mb-3 text-xs text-akno-muted">
                  Où en est ce client dans votre pipeline ?
                </p>
                <ClientStatusPicker
                  value={form.status}
                  onChange={(value) => update("status", value as ClientStatus)}
                />
              </div>

              <div>
                <NeuLabel>Source d&apos;acquisition</NeuLabel>
                <p className="mb-3 text-xs text-akno-muted">
                  Comment ce client est-il entré dans votre portefeuille ?
                </p>
                <ClientSourcePicker
                  value={form.source}
                  onChange={(value) => update("source", value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NeuFieldGroup>
                  <NeuLabel htmlFor="monthlySubscription">Abonnement mensuel HT</NeuLabel>
                  <MoneyInput
                    id="monthlySubscription"
                    value={form.monthlySubscription}
                    onChange={(v) => update("monthlySubscription", v)}
                    placeholder="150"
                  />
                  <p className="mt-1.5 text-[11px] text-akno-subtle">
                    MRR comptabilisé dans le dashboard.
                  </p>
                </NeuFieldGroup>
                <NeuFieldGroup>
                  <NeuLabel htmlFor="estimatedRevenue">CA estimé total</NeuLabel>
                  <MoneyInput
                    id="estimatedRevenue"
                    value={form.estimatedRevenue}
                    onChange={(v) => update("estimatedRevenue", v)}
                    placeholder="10000"
                  />
                </NeuFieldGroup>
                <NeuFieldGroup className="sm:col-span-2">
                  <NeuLabel htmlFor="startDate">Date de début de collaboration</NeuLabel>
                  <NeuInput
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </NeuFieldGroup>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm font-medium text-akno-muted transition-colors hover:text-akno-primary"
        >
          <ArrowLeft size={16} />
          Retour à mes clients
        </Link>
        <div className="flex items-center gap-2 text-xs text-akno-subtle">
          <Sparkles size={14} className="text-akno-primary" />
          {mode === "create" ? "Onboarding client" : "Fiche client"}
          <span className="text-akno-border">·</span>
          Étape {stepIndex + 1}/{CLIENT_FORM_STEPS.length}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-akno-text">Complétion du dossier</span>
          <span className="font-bold text-akno-primary">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-akno-border">
          <div
            className="h-full rounded-full bg-akno-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-8 hidden lg:grid lg:grid-cols-4 lg:gap-3">
        {CLIENT_FORM_STEPS.map((step, index) => {
          const done = index < stepIndex;
          const active = index === stepIndex;
          const clickable = mode === "edit" || index <= stepIndex;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && goToStep(index)}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                active && "border-akno-primary bg-akno-primary-soft",
                done && !active && "border-akno-border bg-akno-surface",
                !active && !done && "border-akno-border bg-akno-surface opacity-60",
                clickable && !active && "hover:border-akno-primary/40",
                !clickable && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  active && "bg-akno-primary text-white",
                  done && !active && "bg-emerald-100 text-emerald-700",
                  !active && !done && "bg-akno-bg text-akno-subtle",
                )}
              >
                {done && !active ? <Check size={14} /> : index + 1}
              </span>
              <span>
                <span className="block text-sm font-bold text-akno-text">{step.label}</span>
                <span className="block text-[11px] text-akno-muted">{step.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="akno-card p-6 sm:p-8">{renderStepContent()}</div>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <NeuButton
              type="button"
              variant="secondary"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Précédent
            </NeuButton>

            {!isLastStep ? (
              <NeuButton type="button" variant="primary" onClick={handleNext} className="gap-2">
                Continuer
                <ArrowRight size={16} />
              </NeuButton>
            ) : (
              <NeuButton type="submit" variant="primary" className="gap-2">
                <Briefcase size={16} />
                {mode === "create" ? "Créer le client" : "Enregistrer le dossier"}
              </NeuButton>
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-akno-subtle">
                Aperçu CRM
              </p>
              <ClientFormPreview form={form} initials={initials} />
            </div>

            <div className="akno-card-flat p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-akno-subtle">
                Checklist
              </p>
              <ul className="space-y-2 text-xs">
                {[
                  { ok: form.firstName && form.lastName && form.email, label: "Contact renseigné" },
                  { ok: form.company, label: "Organisation identifiée" },
                  { ok: form.city || form.address, label: "Localisation ajoutée" },
                  {
                    ok: form.monthlySubscription || form.estimatedRevenue,
                    label: "Données commerciales",
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full",
                        item.ok ? "bg-emerald-100 text-emerald-600" : "bg-akno-bg text-akno-subtle",
                      )}
                    >
                      {item.ok ? <Check size={10} strokeWidth={3} /> : null}
                    </span>
                    <span className={item.ok ? "text-akno-text" : "text-akno-muted"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
