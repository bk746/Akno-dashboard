"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Pencil } from "lucide-react";
import {
  formatHours,
  formatProjectBudget,
  formatProjectDate,
  getBudgetUsed,
  getDaysUntilDue,
  getPhaseProgress,
  getTotalHours,
  priorityLabels,
  priorityStyles,
  statusLabels,
  statusStyles,
  type Project,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

type ProjectListViewProps = {
  projects: Project[];
  clients: Map<number, string>;
  onEdit: (project: Project) => void;
};

export function ProjectListView({ projects, clients, onEdit }: ProjectListViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neu-text/8">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neu-text/8 bg-neu-text/[0.02] text-[11px] font-semibold uppercase tracking-wider text-neu-muted">
            <th className="py-3 pl-6 pr-4">Projet</th>
            <th className="hidden py-3 pr-4 md:table-cell">Client</th>
            <th className="hidden py-3 pr-4 lg:table-cell">Statut</th>
            <th className="hidden py-3 pr-4 sm:table-cell">Timing</th>
            <th className="py-3 pr-4">Avancement</th>
            <th className="hidden py-3 pr-4 xl:table-cell">Budget</th>
            <th className="py-3 pr-6 pl-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const totalHours = getTotalHours(project);
            const progress = getPhaseProgress(project);
            const budgetUsed = getBudgetUsed(project);
            const daysLeft = getDaysUntilDue(project.dueDate);
            const clientName = project.clientId
              ? clients.get(project.clientId)
              : undefined;

            return (
              <tr
                key={project.id}
                className="group border-b border-neu-text/5 last:border-0 hover:bg-neu-text/[0.02]"
              >
                <td className="py-4 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
                        {project.code}
                      </p>
                      <Link
                        href={`/projets/${project.id}`}
                        className="truncate font-semibold text-neu-text hover:text-neu-accent-2"
                      >
                        {project.name}
                      </Link>
                      <p className={cn("text-[10px] font-semibold", priorityStyles[project.priority])}>
                        {priorityLabels[project.priority]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pr-4 md:table-cell">
                  <span className="text-sm text-neu-muted">{clientName ?? "—"}</span>
                </td>
                <td className="hidden py-4 pr-4 lg:table-cell">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      statusStyles[project.status],
                    )}
                  >
                    {statusLabels[project.status]}
                  </span>
                </td>
                <td className="hidden py-4 pr-4 sm:table-cell">
                  <div className="space-y-1 text-xs text-neu-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatHours(totalHours)}
                      {project.budgetHours ? ` / ${project.budgetHours}h` : ""}
                    </span>
                    {project.dueDate && (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
                            ? "font-semibold text-neu-accent-3"
                            : "",
                        )}
                      >
                        <Calendar size={12} />
                        {formatProjectDate(project.dueDate)}
                        {daysLeft !== null && daysLeft >= 0 && (
                          <span className="text-[10px]">({daysLeft}j)</span>
                        )}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <div className="min-w-[100px]">
                    <div className="mb-1 flex justify-between text-[10px] text-neu-muted">
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neu-text/8">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: project.color }}
                      />
                    </div>
                  </div>
                </td>
                <td className="hidden py-4 pr-4 xl:table-cell">
                  <div className="text-xs">
                    {budgetUsed > 0 && (
                      <p className="font-semibold text-neu-text">
                        {formatProjectBudget(budgetUsed)}
                      </p>
                    )}
                    {project.budgetAmount ? (
                      <p className="text-neu-muted">
                        / {formatProjectBudget(project.budgetAmount)}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="py-4 pr-6 pl-2 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted hover:text-neu-accent-2"
                      aria-label={`Modifier ${project.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <Link
                      href={`/projets/${project.id}`}
                      className="neu-flat flex h-8 w-8 items-center justify-center rounded-lg text-neu-muted hover:text-neu-accent-2"
                      aria-label={`Ouvrir ${project.name}`}
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
