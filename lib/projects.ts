import { AKNO_STORAGE_KEYS, readStorage, writeStorage } from "@/lib/persistence";

export type ProjectStatus =
  | "brief"
  | "discovery"
  | "design"
  | "production"
  | "review"
  | "delivery"
  | "pause"
  | "archive";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type DeliverableStatus = "todo" | "in-progress" | "done";

export type ProjectPhase = {
  id: number;
  name: string;
  completed: boolean;
  dueDate?: string;
};

export type TimeEntry = {
  id: number;
  date: string;
  hours: number;
  description: string;
  member?: string;
};

export type ProjectDeliverable = {
  id: number;
  name: string;
  status: DeliverableStatus;
  dueDate?: string;
};

export type ProjectFolder = {
  localPath?: string;
  cloudUrl?: string;
  briefUrl?: string;
  assetsUrl?: string;
  figmaUrl?: string;
};

export type Project = {
  id: number;
  name: string;
  code: string;
  clientId?: number;
  quoteId?: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  color: string;
  description?: string;
  brief?: string;
  startDate?: string;
  dueDate?: string;
  budgetHours?: number;
  budgetAmount?: number;
  hourlyRate?: number;
  team: string[];
  phases: ProjectPhase[];
  timeEntries: TimeEntry[];
  deliverables: ProjectDeliverable[];
  folder: ProjectFolder;
  notes?: string;
  activeTimerStartedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt" | "timeEntries" | "phases" | "deliverables" | "folder" | "team"
> & {
  timeEntries?: TimeEntry[];
  phases?: ProjectPhase[];
  deliverables?: ProjectDeliverable[];
  folder?: Partial<ProjectFolder>;
  team?: string[];
};

export const PROJECTS_STORAGE_KEY = AKNO_STORAGE_KEYS.projects;

export const kanbanStatuses: ProjectStatus[] = [
  "brief",
  "discovery",
  "design",
  "production",
  "review",
  "delivery",
];

export const statusLabels: Record<ProjectStatus, string> = {
  brief: "Brief",
  discovery: "Discovery",
  design: "Design",
  production: "Production",
  review: "Revue client",
  delivery: "Livraison",
  pause: "En pause",
  archive: "Archivé",
};

export const statusStyles: Record<ProjectStatus, string> = {
  brief: "bg-violet-100 text-violet-700",
  discovery: "bg-blue-100 text-blue-700",
  design: "bg-fuchsia-100 text-fuchsia-700",
  production: "bg-amber-100 text-amber-700",
  review: "bg-orange-100 text-orange-700",
  delivery: "bg-emerald-100 text-emerald-700",
  pause: "bg-slate-100 text-slate-600",
  archive: "bg-neutral-100 text-neutral-500",
};

export const statusColumnColors: Record<ProjectStatus, string> = {
  brief: "border-violet-200 bg-violet-50/50",
  discovery: "border-blue-200 bg-blue-50/50",
  design: "border-fuchsia-200 bg-fuchsia-50/50",
  production: "border-amber-200 bg-amber-50/50",
  review: "border-orange-200 bg-orange-50/50",
  delivery: "border-emerald-200 bg-emerald-50/50",
  pause: "border-slate-200 bg-slate-50/50",
  archive: "border-neutral-200 bg-neutral-50/50",
};

export const priorityLabels: Record<ProjectPriority, string> = {
  low: "Basse",
  medium: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

export const priorityStyles: Record<ProjectPriority, string> = {
  low: "text-neu-muted",
  medium: "text-neu-accent-2",
  high: "text-orange-600",
  urgent: "text-neu-accent-3",
};

export const defaultPhases: Omit<ProjectPhase, "id">[] = [
  { name: "Kick-off & brief", completed: false },
  { name: "Discovery & cadrage", completed: false },
  { name: "Conception & maquettes", completed: false },
  { name: "Production", completed: false },
  { name: "Revue & retours", completed: false },
  { name: "Livraison & clôture", completed: false },
];

export const projectColors = [
  "#635bff",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#ef4444",
  "#64748b",
];

export function loadStoredProjects(): Project[] {
  const parsed = readStorage<Project[]>(PROJECTS_STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveStoredProjects(projects: Project[]) {
  writeStorage(PROJECTS_STORAGE_KEY, projects);
}

export function nextProjectId(projects: Project[]) {
  return projects.reduce((max, project) => Math.max(max, project.id), 0) + 1;
}

export function nextSubId<T extends { id: number }>(items: T[]) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function generateProjectCode(projects: Project[]): string {
  const year = new Date().getFullYear();
  const count = projects.filter((p) => p.code.startsWith(`AKNO-${year}`)).length + 1;
  return `AKNO-${year}-${String(count).padStart(3, "0")}`;
}

export function createProject(projects: Project[], input: ProjectInput): Project {
  const now = new Date().toISOString();
  const phases =
    input.phases ??
    defaultPhases.map((phase, index) => ({ ...phase, id: index + 1 }));

  return {
    id: nextProjectId(projects),
    ...input,
    code: input.code || generateProjectCode(projects),
    team: input.team ?? [],
    phases,
    timeEntries: input.timeEntries ?? [],
    deliverables: input.deliverables ?? [],
    folder: {
      localPath: input.folder?.localPath,
      cloudUrl: input.folder?.cloudUrl,
      briefUrl: input.folder?.briefUrl,
      assetsUrl: input.folder?.assetsUrl,
      figmaUrl: input.folder?.figmaUrl,
    },
    activeTimerStartedAt: input.activeTimerStartedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateProject(
  projects: Project[],
  id: number,
  input: Partial<ProjectInput>,
): Project[] {
  return projects.map((project) => {
    if (project.id !== id) return project;
    return {
      ...project,
      ...input,
      folder: input.folder ? { ...project.folder, ...input.folder } : project.folder,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function deleteProject(projects: Project[], id: number): Project[] {
  return projects.filter((project) => project.id !== id);
}

export function getTotalHours(project: Project): number {
  return project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
}

export function getHoursThisWeek(projects: Project[]): number {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  return projects.reduce((total, project) => {
    return (
      total +
      project.timeEntries
        .filter((entry) => entry.date >= weekStartStr)
        .reduce((sum, entry) => sum + entry.hours, 0)
    );
  }, 0);
}

export function getBudgetUsed(project: Project): number {
  const hours = getTotalHours(project);
  const rate = project.hourlyRate ?? 0;
  return hours * rate;
}

export function getPhaseProgress(project: Project): number {
  if (project.phases.length === 0) return 0;
  const completed = project.phases.filter((phase) => phase.completed).length;
  return Math.round((completed / project.phases.length) * 100);
}

export function getDeliverableProgress(project: Project): number {
  if (project.deliverables.length === 0) return 0;
  const done = project.deliverables.filter((d) => d.status === "done").length;
  return Math.round((done / project.deliverables.length) * 100);
}

export function getActiveProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.status !== "archive" && p.status !== "pause");
}

export function getUpcomingDeadlines(projects: Project[], withinDays = 7): Project[] {
  const today = new Date().toISOString().slice(0, 10);
  const limit = new Date();
  limit.setDate(limit.getDate() + withinDays);
  const limitStr = limit.toISOString().slice(0, 10);

  return projects
    .filter(
      (p) =>
        p.dueDate &&
        p.dueDate >= today &&
        p.dueDate <= limitStr &&
        p.status !== "archive",
    )
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
}

export function getDaysUntilDue(dueDate?: string): number | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function formatProjectBudget(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatProjectDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getRunningTimerHours(project: Project): number {
  if (!project.activeTimerStartedAt) return 0;
  const started = new Date(project.activeTimerStartedAt).getTime();
  return (Date.now() - started) / (1000 * 60 * 60);
}

export function addTimeEntry(
  projects: Project[],
  projectId: number,
  entry: Omit<TimeEntry, "id">,
): Project[] {
  return projects.map((project) => {
    if (project.id !== projectId) return project;
    return {
      ...project,
      timeEntries: [
        { ...entry, id: nextSubId(project.timeEntries) },
        ...project.timeEntries,
      ],
      activeTimerStartedAt: null,
      updatedAt: new Date().toISOString(),
    };
  });
}

export function toggleTimer(
  projects: Project[],
  projectId: number,
): Project[] {
  return projects.map((project) => {
    if (project.id !== projectId) return project;

    if (project.activeTimerStartedAt) {
      const hours = getRunningTimerHours(project);
      const rounded = Math.round(hours * 100) / 100;
      return {
        ...project,
        timeEntries:
          rounded > 0
            ? [
                {
                  id: nextSubId(project.timeEntries),
                  date: new Date().toISOString().slice(0, 10),
                  hours: rounded,
                  description: "Session chronométrée",
                },
                ...project.timeEntries,
              ]
            : project.timeEntries,
        activeTimerStartedAt: null,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...project,
      activeTimerStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function moveProjectStatus(
  projects: Project[],
  projectId: number,
  status: ProjectStatus,
): Project[] {
  return updateProject(projects, projectId, { status });
}
