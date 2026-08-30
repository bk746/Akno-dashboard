"use client";

import { FolderKanban, X } from "lucide-react";
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
import { loadStoredClients, type Client } from "@/lib/clients";
import {
  createProject,
  defaultPhases,
  generateProjectCode,
  priorityLabels,
  projectColors,
  statusLabels,
  updateProject,
  type Project,
  type ProjectInput,
  type ProjectPriority,
  type ProjectStatus,
} from "@/lib/projects";

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  editingProject?: Project | null;
  defaultStatus?: ProjectStatus;
  onSave: (projects: Project[]) => void;
};

const emptyForm = (status: ProjectStatus): ProjectInput => ({
  name: "",
  code: "",
  status,
  priority: "medium",
  color: projectColors[0],
  description: "",
  brief: "",
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  budgetHours: 40,
  budgetAmount: 0,
  hourlyRate: 75,
  team: [],
});

export function ProjectModal({
  open,
  onClose,
  projects,
  editingProject,
  defaultStatus = "brief",
  onSave,
}: ProjectModalProps) {
  const [form, setForm] = useState<ProjectInput>(emptyForm(defaultStatus));
  const [clients, setClients] = useState<Client[]>([]);
  const [teamInput, setTeamInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setClients(loadStoredClients());
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editingProject) {
      setForm({
        name: editingProject.name,
        code: editingProject.code,
        clientId: editingProject.clientId,
        quoteId: editingProject.quoteId,
        status: editingProject.status,
        priority: editingProject.priority,
        color: editingProject.color,
        description: editingProject.description,
        brief: editingProject.brief,
        startDate: editingProject.startDate,
        dueDate: editingProject.dueDate,
        budgetHours: editingProject.budgetHours,
        budgetAmount: editingProject.budgetAmount,
        hourlyRate: editingProject.hourlyRate,
        team: editingProject.team,
        notes: editingProject.notes,
        folder: editingProject.folder,
      });
      setTeamInput(editingProject.team.join(", "));
    } else {
      setForm({ ...emptyForm(defaultStatus), code: generateProjectCode(projects) });
      setTeamInput("");
    }

    setError(null);
  }, [open, editingProject, defaultStatus, projects]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Le nom du projet est requis.");
      return;
    }

    const team = teamInput
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);

    const payload = { ...form, team };

    if (editingProject) {
      onSave(updateProject(projects, editingProject.id, payload));
    } else {
      onSave([createProject(projects, payload), ...projects]);
    }

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
      <NeuCard className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban size={18} className="text-neu-accent-2" />
            <p className="font-bold text-neu-text">
              {editingProject ? "Modifier le projet" : "Nouveau projet"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NeuFieldGroup className="sm:col-span-2">
              <NeuLabel htmlFor="project-name" required>
                Nom du projet
              </NeuLabel>
              <NeuInput
                id="project-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ex. Refonte site e-commerce"
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-code">Code dossier</NeuLabel>
              <NeuInput
                id="project-code"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="AKNO-2026-001"
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-client">Client</NeuLabel>
              <NeuSelect
                id="project-client"
                value={form.clientId ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    clientId: event.target.value ? Number(event.target.value) : undefined,
                  }))
                }
              >
                <option value="">— Aucun client —</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-status">Statut</NeuLabel>
              <NeuSelect
                id="project-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as ProjectStatus,
                  }))
                }
              >
                {(Object.keys(statusLabels) as ProjectStatus[]).map((key) => (
                  <option key={key} value={key}>
                    {statusLabels[key]}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-priority">Priorité</NeuLabel>
              <NeuSelect
                id="project-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as ProjectPriority,
                  }))
                }
              >
                {(Object.keys(priorityLabels) as ProjectPriority[]).map((key) => (
                  <option key={key} value={key}>
                    {priorityLabels[key]}
                  </option>
                ))}
              </NeuSelect>
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-start">Date de début</NeuLabel>
              <NeuInput
                id="project-start"
                type="date"
                value={form.startDate ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startDate: event.target.value }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-due">Échéance</NeuLabel>
              <NeuInput
                id="project-due"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-budget-hours">Budget heures</NeuLabel>
              <NeuInput
                id="project-budget-hours"
                type="number"
                min={0}
                value={form.budgetHours ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    budgetHours: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-hourly-rate">Taux horaire (€)</NeuLabel>
              <NeuInput
                id="project-hourly-rate"
                type="number"
                min={0}
                value={form.hourlyRate ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    hourlyRate: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-budget-amount">Budget forfait (€)</NeuLabel>
              <NeuInput
                id="project-budget-amount"
                type="number"
                min={0}
                value={form.budgetAmount ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    budgetAmount: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel>Couleur</NeuLabel>
              <div className="flex flex-wrap gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, color }))}
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: form.color === color ? "#0a2540" : "transparent",
                    }}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
            </NeuFieldGroup>

            <NeuFieldGroup className="sm:col-span-2">
              <NeuLabel htmlFor="project-team">Équipe (séparés par virgule)</NeuLabel>
              <NeuInput
                id="project-team"
                value={teamInput}
                onChange={(event) => setTeamInput(event.target.value)}
                placeholder="Marie, Thomas, Alex…"
              />
            </NeuFieldGroup>

            <NeuFieldGroup className="sm:col-span-2">
              <NeuLabel htmlFor="project-folder-path">Chemin dossier local</NeuLabel>
              <NeuInput
                id="project-folder-path"
                value={form.folder?.localPath ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    folder: { ...current.folder, localPath: event.target.value },
                  }))
                }
                placeholder="/Users/…/Projets/AKNO-2026-001"
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-cloud-url">Lien cloud (Drive, Dropbox…)</NeuLabel>
              <NeuInput
                id="project-cloud-url"
                type="url"
                value={form.folder?.cloudUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    folder: { ...current.folder, cloudUrl: event.target.value },
                  }))
                }
                placeholder="https://drive.google.com/…"
              />
            </NeuFieldGroup>

            <NeuFieldGroup>
              <NeuLabel htmlFor="project-figma-url">Lien Figma</NeuLabel>
              <NeuInput
                id="project-figma-url"
                type="url"
                value={form.folder?.figmaUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    folder: { ...current.folder, figmaUrl: event.target.value },
                  }))
                }
                placeholder="https://figma.com/…"
              />
            </NeuFieldGroup>

            <NeuFieldGroup className="sm:col-span-2">
              <NeuLabel htmlFor="project-brief">Brief client</NeuLabel>
              <NeuTextarea
                id="project-brief"
                rows={3}
                value={form.brief ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, brief: event.target.value }))
                }
                placeholder="Contexte, objectifs, contraintes…"
              />
            </NeuFieldGroup>

            <NeuFieldGroup className="sm:col-span-2">
              <NeuLabel htmlFor="project-description">Description</NeuLabel>
              <NeuTextarea
                id="project-description"
                rows={2}
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Résumé du périmètre et livrables principaux"
              />
            </NeuFieldGroup>
          </div>

          {!editingProject && (
            <p className="text-xs text-neu-muted">
              {defaultPhases.length} phases seront créées automatiquement (kick-off → livraison).
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-neu-accent-3/10 px-3 py-2 text-xs text-neu-accent-3">
              {error}
            </p>
          )}

          <NeuButton type="submit" variant="primary" className="w-full">
            {editingProject ? "Enregistrer" : "Créer le projet"}
          </NeuButton>
        </form>
      </NeuCard>
    </div>
  );
}
