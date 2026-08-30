"use client";

import {
  AlertTriangle,
  Clock,
  FolderKanban,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProjectKanban } from "@/components/projets/project-kanban";
import { ProjectListView } from "@/components/projets/project-list-view";
import { ProjectModal } from "@/components/projets/project-modal";
import { KpiCard } from "@/components/ui/kpi-card";
import { MotionFilterButton } from "@/components/ui/motion-primitives";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { loadStoredClients } from "@/lib/clients";
import {
  formatHours,
  formatProjectBudget,
  getActiveProjects,
  getHoursThisWeek,
  getTotalHours,
  getUpcomingDeadlines,
  loadStoredProjects,
  moveProjectStatus,
  saveStoredProjects,
  statusLabels,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { matchesProjectSearch } from "@/lib/search";

type ViewMode = "kanban" | "list";
type StatusFilter = ProjectStatus | "all" | "active";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "active", label: "En cours" },
  { id: "all", label: "Tous" },
  { id: "pause", label: "Pause" },
  { id: "archive", label: "Archivés" },
];

export default function ProjetsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewMode>("kanban");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    setProjects(loadStoredProjects());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredProjects(projects);
  }, [projects, ready]);

  const clients = useMemo(() => {
    const list = loadStoredClients();
    return new Map(list.map((client) => [client.id, client.company || client.name]));
  }, [projects]);

  const activeProjects = getActiveProjects(projects);
  const hoursThisWeek = getHoursThisWeek(projects);
  const upcoming = getUpcomingDeadlines(projects, 7);
  const totalBudgetUsed = activeProjects.reduce((sum, p) => {
    const hours = getTotalHours(p);
    return sum + hours * (p.hourlyRate ?? 0);
  }, 0);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (!matchesProjectSearch(project, search, clients)) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "active") {
        return project.status !== "archive" && project.status !== "pause";
      }
      return project.status === statusFilter;
    });
  }, [projects, search, statusFilter, clients]);

  function openCreateModal() {
    setEditingProject(null);
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setModalOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Projets"
        description="Pilotage studio — kanban, timing, dossiers et livrables en un seul endroit"
        action={
          <NeuButton variant="primary" className="gap-2" onClick={openCreateModal}>
            <Plus size={16} />
            Nouveau projet
          </NeuButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          variant="compact"
          label="Projets actifs"
          value={String(activeProjects.length)}
          subValue={`${projects.filter((p) => p.status === "delivery").length} en livraison`}
          icon={<FolderKanban size={18} />}
        />
        <KpiCard
          variant="compact"
          label="Heures cette semaine"
          value={formatHours(hoursThisWeek)}
          icon={<Clock size={18} />}
        />
        <KpiCard
          variant="compact"
          label="Budget consommé"
          value={totalBudgetUsed > 0 ? formatProjectBudget(totalBudgetUsed) : "—"}
          subValue="projets actifs"
          icon={<Clock size={18} />}
        />
        <KpiCard
          variant="compact"
          label="Échéances 7 jours"
          value={String(upcoming.length)}
          subValue={upcoming[0]?.name}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <NeuCard className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Projet, code dossier, client, équipe…"
            className="w-full lg:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-neu-text/8 p-0.5">
              <button
                type="button"
                onClick={() => setView("kanban")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "kanban"
                    ? "bg-akno-primary/10 text-akno-primary"
                    : "text-neu-muted hover:text-neu-text"
                }`}
              >
                <LayoutGrid size={14} />
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "list"
                    ? "bg-akno-primary/10 text-akno-primary"
                    : "text-neu-muted hover:text-neu-text"
                }`}
              >
                <List size={14} />
                Liste
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map(({ id, label }) => (
            <MotionFilterButton
              key={id}
              active={statusFilter === id}
              onClick={() => setStatusFilter(id)}
            >
              {label}
              {id === "active" && ` (${activeProjects.length})`}
              {id !== "all" && id !== "active" && (
                <> ({projects.filter((p) => p.status === id).length})</>
              )}
            </MotionFilterButton>
          ))}
        </div>

        <p className="mt-3 text-xs text-neu-muted">
          {filteredProjects.length} projet{filteredProjects.length !== 1 ? "s" : ""} affiché
          {filteredProjects.length !== 1 ? "s" : ""}
          {search.trim() ? ` · « ${search.trim()} »` : ""}
        </p>
      </NeuCard>

      {filteredProjects.length === 0 ? (
        <NeuCard className="py-16 text-center">
          <FolderKanban size={40} className="mx-auto mb-4 text-neu-muted/40" />
          <p className="text-sm font-medium text-neu-text">Aucun projet trouvé</p>
          <p className="mt-2 text-sm text-neu-muted">
            {search.trim()
              ? "Modifiez votre recherche ou créez un nouveau projet."
              : "Créez votre premier dossier projet pour démarrer le suivi studio."}
          </p>
          {!search.trim() && (
            <NeuButton variant="primary" className="mt-6 gap-2" onClick={openCreateModal}>
              <Plus size={16} />
              Créer un projet
            </NeuButton>
          )}
        </NeuCard>
      ) : view === "kanban" && statusFilter === "active" ? (
        <ProjectKanban
          projects={filteredProjects}
          clients={clients}
          onMove={(projectId, status) =>
            setProjects((current) => moveProjectStatus(current, projectId, status))
          }
          onEdit={openEditModal}
        />
      ) : (
        <ProjectListView
          projects={filteredProjects}
          clients={clients}
          onEdit={openEditModal}
        />
      )}

      {view === "kanban" && statusFilter !== "active" && filteredProjects.length > 0 && (
        <p className="mt-4 text-center text-xs text-neu-muted">
          Le kanban affiche les projets actifs. Passez en vue liste pour les filtres{" "}
          {statusFilter === "pause"
            ? statusLabels.pause.toLowerCase()
            : statusFilter === "archive"
              ? "archivés"
              : "sélectionnés"}
          .
        </p>
      )}

      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        projects={projects}
        editingProject={editingProject}
        onSave={setProjects}
      />
    </>
  );
}
