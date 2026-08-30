"use client";

import { use, useEffect, useState } from "react";
import { ProjectDetailView } from "@/components/projets/project-detail-view";
import { ProjectModal } from "@/components/projets/project-modal";
import {
  loadStoredProjects,
  saveStoredProjects,
  type Project,
} from "@/lib/projects";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const projectId = Number(id);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setProjects(loadStoredProjects());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStoredProjects(projects);
  }, [projects, ready]);

  const editingProject = projects.find((p) => p.id === projectId) ?? null;

  return (
    <>
      <ProjectDetailView
        projectId={projectId}
        projects={projects}
        onProjectsChange={setProjects}
        onEdit={() => setModalOpen(true)}
      />

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        projects={projects}
        editingProject={editingProject}
        onSave={setProjects}
      />
    </>
  );
}
