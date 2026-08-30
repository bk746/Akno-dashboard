"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  ExternalLink,
  FolderOpen,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NeuButton, NeuFieldGroup, NeuInput, NeuLabel, NeuTextarea } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { ProgressBar } from "@/components/ui/progress-ring";
import { loadStoredClients, type Client } from "@/lib/clients";
import {
  addTimeEntry,
  formatHours,
  formatProjectBudget,
  formatProjectDate,
  getBudgetUsed,
  getDaysUntilDue,
  getDeliverableProgress,
  getPhaseProgress,
  getRunningTimerHours,
  getTotalHours,
  nextSubId,
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
  toggleTimer,
  updateProject,
  type DeliverableStatus,
  type Project,
  type ProjectDeliverable,
  type ProjectPhase,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

type Tab = "overview" | "timing" | "dossier" | "deliverables";

type ProjectDetailViewProps = {
  projectId: number;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  onEdit: () => void;
};

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "timing", label: "Timing" },
  { id: "dossier", label: "Dossier" },
  { id: "deliverables", label: "Livrables" },
];

const deliverableStatusLabels: Record<DeliverableStatus, string> = {
  todo: "À faire",
  "in-progress": "En cours",
  done: "Terminé",
};

export function ProjectDetailView({
  projectId,
  projects,
  onProjectsChange,
  onEdit,
}: ProjectDetailViewProps) {
  const project = projects.find((item) => item.id === projectId);
  const [tab, setTab] = useState<Tab>("overview");
  const [clients, setClients] = useState<Client[]>([]);
  const [timerTick, setTimerTick] = useState(0);
  const [timeForm, setTimeForm] = useState({ hours: "", description: "", member: "" });
  const [deliverableName, setDeliverableName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setClients(loadStoredClients());
  }, []);

  useEffect(() => {
    if (project?.notes !== undefined) setNotes(project.notes);
  }, [project?.notes, project?.id]);

  useEffect(() => {
    if (!project?.activeTimerStartedAt) return;
    const interval = window.setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, [project?.activeTimerStartedAt]);

  const client = useMemo(
    () => clients.find((item) => item.id === project?.clientId),
    [clients, project?.clientId],
  );

  if (!project) {
    return (
      <NeuCard className="py-16 text-center">
        <p className="text-sm font-medium text-neu-text">Projet introuvable</p>
        <Link href="/projets" className="mt-4 inline-block text-sm text-neu-accent-2">
          Retour aux projets
        </Link>
      </NeuCard>
    );
  }

  const p = project;

  const totalHours = getTotalHours(p);
  const runningHours = p.activeTimerStartedAt ? getRunningTimerHours(p) : 0;
  const displayHours = totalHours + runningHours;
  const budgetUsed = getBudgetUsed(p);
  const phaseProgress = getPhaseProgress(p);
  const deliverableProgress = getDeliverableProgress(p);
  const daysLeft = getDaysUntilDue(p.dueDate);
  void timerTick;

  function patchProject(input: Parameters<typeof updateProject>[2]) {
    onProjectsChange(updateProject(projects, p.id, input));
  }

  function togglePhase(phaseId: number) {
    const phases = p.phases.map((phase) =>
      phase.id === phaseId ? { ...phase, completed: !phase.completed } : phase,
    );
    patchProject({ phases });
  }

  function addDeliverable() {
    if (!deliverableName.trim()) return;
    const deliverables: ProjectDeliverable[] = [
      {
        id: nextSubId(p.deliverables),
        name: deliverableName.trim(),
        status: "todo",
      },
      ...p.deliverables,
    ];
    patchProject({ deliverables });
    setDeliverableName("");
  }

  function updateDeliverable(id: number, status: DeliverableStatus) {
    const deliverables = p.deliverables.map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    patchProject({ deliverables });
  }

  function removeDeliverable(id: number) {
    patchProject({
      deliverables: p.deliverables.filter((item) => item.id !== id),
    });
  }

  function handleAddTime(event: React.FormEvent) {
    event.preventDefault();
    const hours = Number(timeForm.hours);
    if (!hours || hours <= 0) return;

    onProjectsChange(
      addTimeEntry(projects, p.id, {
        date: new Date().toISOString().slice(0, 10),
        hours,
        description: timeForm.description || "Saisie manuelle",
        member: timeForm.member || undefined,
      }),
    );
    setTimeForm({ hours: "", description: "", member: "" });
  }

  function saveNotes() {
    patchProject({ notes });
  }

  const folderLinks = [
    { label: "Cloud", url: p.folder.cloudUrl, icon: ExternalLink },
    { label: "Brief", url: p.folder.briefUrl, icon: ExternalLink },
    { label: "Assets", url: p.folder.assetsUrl, icon: ExternalLink },
    { label: "Figma", url: p.folder.figmaUrl, icon: ExternalLink },
  ].filter((link) => link.url);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/projets"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neu-muted hover:text-neu-accent-2"
        >
          <ArrowLeft size={14} />
          Retour aux projets
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="mt-1 h-12 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neu-muted">
                {p.code}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-akno-text">
                {p.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    statusStyles[p.status],
                  )}
                >
                  {statusLabels[p.status]}
                </span>
                <span className={cn("text-xs font-semibold", priorityStyles[p.priority])}>
                  Priorité {priorityLabels[p.priority].toLowerCase()}
                </span>
                {client && (
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs text-neu-accent-2 hover:underline"
                  >
                    {client.company || client.name}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <NeuButton
              variant="secondary"
              className="gap-2"
              onClick={() => onProjectsChange(toggleTimer(projects, p.id))}
            >
              {p.activeTimerStartedAt ? (
                <>
                  <Pause size={14} />
                  Stop {formatHours(runningHours)}
                </>
              ) : (
                <>
                  <Play size={14} />
                  Démarrer chrono
                </>
              )}
            </NeuButton>
            <NeuButton variant="primary" onClick={onEdit}>
              Modifier
            </NeuButton>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Heures consommées",
            value: formatHours(displayHours),
            sub: p.budgetHours ? `/ ${p.budgetHours}h budget` : undefined,
          },
          {
            label: "Avancement phases",
            value: `${phaseProgress}%`,
            sub: `${p.phases.filter((phase) => phase.completed).length}/${p.phases.length} phases`,
          },
          {
            label: "Budget consommé",
            value: budgetUsed > 0 ? formatProjectBudget(budgetUsed) : "—",
            sub: p.budgetAmount
              ? `/ ${formatProjectBudget(p.budgetAmount)} forfait`
              : undefined,
          },
          {
            label: "Échéance",
            value: p.dueDate ? formatProjectDate(p.dueDate) : "—",
            sub:
              daysLeft !== null
                ? daysLeft < 0
                  ? "En retard"
                  : daysLeft === 0
                    ? "Aujourd'hui"
                    : `J-${daysLeft}`
                : undefined,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="neu-inset-sm rounded-2xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
              {kpi.label}
            </p>
            <p className="mt-1 text-xl font-bold text-neu-text">{kpi.value}</p>
            {kpi.sub && <p className="mt-0.5 text-xs text-neu-muted">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-neu-text/8 pb-px">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === id
                ? "border-akno-primary text-akno-primary"
                : "border-transparent text-neu-muted hover:text-neu-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <NeuCard className="xl:col-span-7">
            <p className="mb-4 text-sm font-bold text-neu-text">Phases du projet</p>
            <div className="space-y-3">
              {p.phases.map((phase: ProjectPhase, index) => (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => togglePhase(phase.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    phase.completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-neu-text/8 hover:bg-neu-text/[0.02]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      phase.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-neu-text/8 text-neu-muted",
                    )}
                  >
                    {phase.completed ? <Check size={14} /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        phase.completed ? "text-neu-muted line-through" : "text-neu-text",
                      )}
                    >
                      {phase.name}
                    </p>
                    {phase.dueDate && (
                      <p className="text-[10px] text-neu-muted">
                        {formatProjectDate(phase.dueDate)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </NeuCard>

          <div className="space-y-6 xl:col-span-5">
            <NeuCard>
              <p className="mb-3 text-sm font-bold text-neu-text">Brief & description</p>
              {p.brief ? (
                <p className="whitespace-pre-wrap text-sm text-neu-text">{p.brief}</p>
              ) : (
                <p className="text-sm text-neu-muted">Aucun brief renseigné.</p>
              )}
              {p.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-neu-muted">
                  {p.description}
                </p>
              )}
            </NeuCard>

            <NeuCard>
              <p className="mb-3 text-sm font-bold text-neu-text">Équipe</p>
              {p.team.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {p.team.map((member) => (
                    <span
                      key={member}
                      className="rounded-full bg-neu-text/8 px-3 py-1.5 text-xs font-semibold text-neu-text"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neu-muted">Aucun membre assigné.</p>
              )}
            </NeuCard>

            <NeuCard>
              <p className="mb-3 text-sm font-bold text-neu-text">Notes internes</p>
              <NeuTextarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Comptes-rendus, décisions, points d'attention…"
              />
              <NeuButton variant="secondary" className="mt-3 w-full" onClick={saveNotes}>
                Enregistrer les notes
              </NeuButton>
            </NeuCard>
          </div>
        </div>
      )}

      {tab === "timing" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <NeuCard className="xl:col-span-5">
            <p className="mb-4 text-sm font-bold text-neu-text">Ajouter du temps</p>
            <form onSubmit={handleAddTime} className="space-y-3">
              <NeuFieldGroup>
                <NeuLabel htmlFor="time-hours">Heures</NeuLabel>
                <NeuInput
                  id="time-hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={timeForm.hours}
                  onChange={(event) =>
                    setTimeForm((current) => ({ ...current, hours: event.target.value }))
                  }
                  placeholder="2.5"
                />
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="time-desc">Description</NeuLabel>
                <NeuInput
                  id="time-desc"
                  value={timeForm.description}
                  onChange={(event) =>
                    setTimeForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Maquettes homepage, intégration…"
                />
              </NeuFieldGroup>
              <NeuFieldGroup>
                <NeuLabel htmlFor="time-member">Membre</NeuLabel>
                <NeuInput
                  id="time-member"
                  value={timeForm.member}
                  onChange={(event) =>
                    setTimeForm((current) => ({ ...current, member: event.target.value }))
                  }
                  placeholder="Marie"
                />
              </NeuFieldGroup>
              <NeuButton type="submit" variant="primary" className="w-full gap-2">
                <Plus size={14} />
                Enregistrer
              </NeuButton>
            </form>

            <div className="mt-6 rounded-xl border border-neu-text/8 p-4">
              <ProgressBar
                label="Consommation budget heures"
                current={Math.round(displayHours * 10) / 10}
                target={p.budgetHours ?? 0}
                unit="h"
              />
            </div>
          </NeuCard>

          <NeuCard className="xl:col-span-7">
            <p className="mb-4 text-sm font-bold text-neu-text">
              Journal de temps ({p.timeEntries.length})
            </p>
            {p.timeEntries.length === 0 ? (
              <p className="py-8 text-center text-sm text-neu-muted">
                Aucune entrée. Utilisez le chrono ou saisissez manuellement.
              </p>
            ) : (
              <div className="space-y-2">
                {p.timeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-xl border border-neu-text/8 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-neu-text">{entry.description}</p>
                      <p className="text-xs text-neu-muted">
                        {formatProjectDate(entry.date)}
                        {entry.member ? ` · ${entry.member}` : ""}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-neu-accent-2">
                      <Clock size={13} />
                      {formatHours(entry.hours)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </NeuCard>
        </div>
      )}

      {tab === "dossier" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NeuCard>
            <div className="mb-4 flex items-center gap-2">
              <FolderOpen size={18} className="text-neu-accent-2" />
              <p className="text-sm font-bold text-neu-text">Dossier projet</p>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                  Code dossier
                </dt>
                <dd className="mt-1 font-mono font-semibold text-neu-text">{p.code}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                  Chemin local
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-neu-text">
                  {p.folder.localPath || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                  Dates
                </dt>
                <dd className="mt-1 flex items-center gap-4 text-neu-text">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-neu-muted" />
                    Début {formatProjectDate(p.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-neu-muted" />
                    Fin {formatProjectDate(p.dueDate)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                  Taux horaire
                </dt>
                <dd className="mt-1 text-neu-text">
                  {p.hourlyRate ? `${p.hourlyRate} €/h` : "—"}
                </dd>
              </div>
            </dl>
          </NeuCard>

          <NeuCard>
            <p className="mb-4 text-sm font-bold text-neu-text">Liens & ressources</p>
            {folderLinks.length === 0 ? (
              <p className="text-sm text-neu-muted">
                Aucun lien configuré. Modifiez le projet pour ajouter Drive, Figma, etc.
              </p>
            ) : (
              <div className="space-y-2">
                {folderLinks.map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-neu-text/8 px-4 py-3 text-sm font-medium text-neu-accent-2 hover:bg-neu-text/[0.02]"
                  >
                    {label}
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            )}
          </NeuCard>
        </div>
      )}

      {tab === "deliverables" && (
        <NeuCard>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-neu-text">Livrables</p>
              <p className="text-xs text-neu-muted">{deliverableProgress}% complétés</p>
            </div>
            <div className="flex gap-2">
              <NeuInput
                value={deliverableName}
                onChange={(event) => setDeliverableName(event.target.value)}
                placeholder="Nouveau livrable…"
                className="min-w-[200px]"
              />
              <NeuButton variant="primary" className="gap-1 shrink-0" onClick={addDeliverable}>
                <Plus size={14} />
                Ajouter
              </NeuButton>
            </div>
          </div>

          {p.deliverables.length === 0 ? (
            <p className="py-8 text-center text-sm text-neu-muted">
              Ajoutez vos livrables : maquettes, développement, documentation…
            </p>
          ) : (
            <div className="space-y-2">
              {p.deliverables.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neu-text/8 px-4 py-3"
                >
                  <p className="text-sm font-medium text-neu-text">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateDeliverable(item.id, event.target.value as DeliverableStatus)
                      }
                      className="neu-inset rounded-lg px-2 py-1 text-xs"
                    >
                      {(Object.keys(deliverableStatusLabels) as DeliverableStatus[]).map(
                        (status) => (
                          <option key={status} value={status}>
                            {deliverableStatusLabels[status]}
                          </option>
                        ),
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeDeliverable(item.id)}
                      className="text-neu-muted hover:text-neu-accent-3"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeuCard>
      )}
    </>
  );
}
