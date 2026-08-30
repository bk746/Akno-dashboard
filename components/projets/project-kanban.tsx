"use client";

import Link from "next/link";
import { Calendar, Clock, GripVertical, User } from "lucide-react";
import { motion } from "framer-motion";
import {
  formatHours,
  formatProjectDate,
  getDaysUntilDue,
  getPhaseProgress,
  getTotalHours,
  kanbanStatuses,
  priorityLabels,
  priorityStyles,
  statusColumnColors,
  statusLabels,
  type Project,
  type ProjectStatus,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

type ProjectKanbanProps = {
  projects: Project[];
  clients: Map<number, string>;
  onMove: (projectId: number, status: ProjectStatus) => void;
  onEdit: (project: Project) => void;
};

function ProjectCard({
  project,
  clientName,
  onEdit,
}: {
  project: Project;
  clientName?: string;
  onEdit: (project: Project) => void;
}) {
  const totalHours = getTotalHours(project);
  const progress = getPhaseProgress(project);
  const daysLeft = getDaysUntilDue(project.dueDate);
  const isUrgent = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-neu-text/8 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div
          className="h-1.5 w-8 shrink-0 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Modifier"
        >
          <GripVertical size={14} className="text-neu-muted" />
        </button>
      </div>

      <Link href={`/projets/${project.id}`} className="block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
          {project.code}
        </p>
        <p className="mt-0.5 font-semibold leading-snug text-neu-text">{project.name}</p>

        {clientName && (
          <p className="mt-1 flex items-center gap-1 text-xs text-neu-muted">
            <User size={11} />
            {clientName}
          </p>
        )}

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] text-neu-muted">
            <span>Avancement</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neu-text/8">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
          <span className={cn("font-semibold", priorityStyles[project.priority])}>
            {priorityLabels[project.priority]}
          </span>
          <span className="flex items-center gap-0.5 text-neu-muted">
            <Clock size={10} />
            {formatHours(totalHours)}
            {project.budgetHours ? ` / ${project.budgetHours}h` : ""}
          </span>
          {project.dueDate && (
            <span
              className={cn(
                "flex items-center gap-0.5",
                isUrgent ? "font-semibold text-neu-accent-3" : "text-neu-muted",
              )}
            >
              <Calendar size={10} />
              {formatProjectDate(project.dueDate)}
            </span>
          )}
        </div>

        {project.team.length > 0 && (
          <div className="mt-2 flex -space-x-1">
            {project.team.slice(0, 3).map((member) => (
              <span
                key={member}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neu-text/10 text-[9px] font-bold text-neu-text"
                title={member}
              >
                {member.slice(0, 2).toUpperCase()}
              </span>
            ))}
            {project.team.length > 3 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-neu-text/10 text-[9px] font-bold text-neu-muted">
                +{project.team.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

export function ProjectKanban({
  projects,
  clients,
  onMove,
  onEdit,
}: ProjectKanbanProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {kanbanStatuses.map((status) => {
          const columnProjects = projects.filter((p) => p.status === status);

          return (
            <div
              key={status}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-2xl border p-3",
                statusColumnColors[status],
              )}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const projectId = Number(event.dataTransfer.getData("projectId"));
                if (projectId) onMove(projectId, status);
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-bold text-neu-text">{statusLabels[status]}</p>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-neu-muted">
                  {columnProjects.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("projectId", String(project.id));
                    }}
                  >
                    <ProjectCard
                      project={project}
                      clientName={
                        project.clientId ? clients.get(project.clientId) : undefined
                      }
                      onEdit={onEdit}
                    />
                  </div>
                ))}

                {columnProjects.length === 0 && (
                  <div className="rounded-xl border border-dashed border-neu-text/10 py-8 text-center text-[10px] text-neu-muted">
                    Glissez un projet ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
