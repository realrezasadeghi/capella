import { create } from "zustand";
import { persist } from "zustand/middleware";

// ================================================================
// Types
// ================================================================

export interface ProjectModel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  diagramCount: number;
  elementCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProject {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  color: string; // accent color for card
  icon: string;  // emoji icon
  modelIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ================================================================
// Helpers
// ================================================================

const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const PROJECT_ICONS = ["⚙️", "🚀", "🛡️", "🔬", "🏗️", "💡", "🎯", "🔭"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ================================================================
// Store
// ================================================================

interface ProjectState {
  projects: UserProject[];
  models: ProjectModel[];

  // Project CRUD
  createProject: (
    ownerId: string,
    name: string,
    description?: string
  ) => UserProject;
  updateProject: (id: string, name: string, description?: string) => void;
  deleteProject: (id: string) => void;

  // Model CRUD
  createModel: (
    projectId: string,
    name: string,
    description?: string
  ) => ProjectModel;
  updateModel: (id: string, name: string, description?: string) => void;
  deleteModel: (id: string) => void;
  updateModelStats: (id: string, diagramCount: number, elementCount: number) => void;

  // Selectors
  getProjectsByOwner: (ownerId: string) => UserProject[];
  getModelsByProject: (projectId: string) => ProjectModel[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      models: [],

      // ---- Projects ----

      createProject: (ownerId, name, description) => {
        const project: UserProject = {
          id: crypto.randomUUID(),
          ownerId,
          name: name.trim(),
          description: description?.trim(),
          color: randomFrom(PROJECT_COLORS),
          icon: randomFrom(PROJECT_ICONS),
          modelIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ projects: [...s.projects, project] }));
        return project;
      },

      updateProject: (id, name, description) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, name: name.trim(), description: description?.trim(), updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          models: s.models.filter((m) => m.projectId !== id),
        })),

      // ---- Models ----

      createModel: (projectId, name, description) => {
        const model: ProjectModel = {
          id: crypto.randomUUID(),
          projectId,
          name: name.trim(),
          description: description?.trim(),
          diagramCount: 0,
          elementCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({
          models: [...s.models, model],
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, modelIds: [...p.modelIds, model.id], updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        return model;
      },

      updateModel: (id, name, description) =>
        set((s) => ({
          models: s.models.map((m) =>
            m.id === id
              ? { ...m, name: name.trim(), description: description?.trim(), updatedAt: new Date().toISOString() }
              : m
          ),
        })),

      deleteModel: (id) => {
        const model = get().models.find((m) => m.id === id);
        set((s) => ({
          models: s.models.filter((m) => m.id !== id),
          projects: model
            ? s.projects.map((p) =>
                p.id === model.projectId
                  ? { ...p, modelIds: p.modelIds.filter((mid) => mid !== id) }
                  : p
              )
            : s.projects,
        }));
      },

      updateModelStats: (id, diagramCount, elementCount) =>
        set((s) => ({
          models: s.models.map((m) =>
            m.id === id ? { ...m, diagramCount, elementCount, updatedAt: new Date().toISOString() } : m
          ),
        })),

      // ---- Selectors ----

      getProjectsByOwner: (ownerId) =>
        get().projects.filter((p) => p.ownerId === ownerId),

      getModelsByProject: (projectId) =>
        get().models.filter((m) => m.projectId === projectId),
    }),
    {
      name: "noqte_projects_v1",
    }
  )
);
