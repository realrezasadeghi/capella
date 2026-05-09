/**
 * InMemoryRepository — infrastructure layer
 *
 * پیاده‌سازی همه پورت‌های IRepository با ذخیره‌سازی در حافظه.
 * مناسب برای تست یونیت، استفاده server-side، و prototype.
 */

import type {
  Project,
  Model,
  Diagram,
  Element as ArcadiaElement,
  Connection,
} from "@/domain/entities";
import type {
  IProjectRepository,
  IModelRepository,
  IDiagramRepository,
  IElementRepository,
  IConnectionRepository,
} from "@/application/ports/IRepository";

// ----------------------------------------------------------------
// Project
// ----------------------------------------------------------------

export class InMemoryProjectRepository implements IProjectRepository {
  private store = new Map<string, Project>();

  async getProject(id: string): Promise<Project | null> {
    return this.store.get(id) ?? null;
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.store.values());
  }

  async saveProject(project: Project): Promise<void> {
    this.store.set(project.id, { ...project });
  }

  async deleteProject(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ----------------------------------------------------------------
// Model
// ----------------------------------------------------------------

export class InMemoryModelRepository implements IModelRepository {
  private store = new Map<string, Model>();

  async getModel(id: string): Promise<Model | null> {
    return this.store.get(id) ?? null;
  }

  async listByProject(projectId: string): Promise<Model[]> {
    return Array.from(this.store.values()).filter(
      (m) => m.projectId === projectId
    );
  }

  async saveModel(model: Model): Promise<void> {
    this.store.set(model.id, { ...model });
  }

  async deleteModel(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ----------------------------------------------------------------
// Diagram
// ----------------------------------------------------------------

export class InMemoryDiagramRepository implements IDiagramRepository {
  private store = new Map<string, Diagram>();

  async getDiagram(id: string): Promise<Diagram | null> {
    return this.store.get(id) ?? null;
  }

  async listByModel(modelId: string): Promise<Diagram[]> {
    return Array.from(this.store.values()).filter(
      (d) => d.modelId === modelId
    );
  }

  async saveDiagram(diagram: Diagram): Promise<void> {
    this.store.set(diagram.id, { ...diagram });
  }

  async deleteDiagram(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ----------------------------------------------------------------
// Element
// ----------------------------------------------------------------

export class InMemoryElementRepository implements IElementRepository {
  private store = new Map<string, ArcadiaElement>();

  async getElement(id: string): Promise<ArcadiaElement | null> {
    return this.store.get(id) ?? null;
  }

  async listByDiagram(diagramId: string): Promise<ArcadiaElement[]> {
    return Array.from(this.store.values()).filter(
      (e) => e.diagramId === diagramId
    );
  }

  async saveElement(element: ArcadiaElement): Promise<void> {
    this.store.set(element.id, { ...element });
  }

  async deleteElement(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ----------------------------------------------------------------
// Connection
// ----------------------------------------------------------------

export class InMemoryConnectionRepository implements IConnectionRepository {
  private store = new Map<string, Connection>();

  async getConnection(id: string): Promise<Connection | null> {
    return this.store.get(id) ?? null;
  }

  async listByDiagram(diagramId: string): Promise<Connection[]> {
    return Array.from(this.store.values()).filter(
      (c) => c.diagramId === diagramId
    );
  }

  async saveConnection(connection: Connection): Promise<void> {
    this.store.set(connection.id, { ...connection });
  }

  async deleteConnection(id: string): Promise<void> {
    this.store.delete(id);
  }
}

// ----------------------------------------------------------------
// Factory — create a fully wired set of repositories
// ----------------------------------------------------------------

export interface RepositorySet {
  projects: IProjectRepository;
  models: IModelRepository;
  diagrams: IDiagramRepository;
  elements: IElementRepository;
  connections: IConnectionRepository;
}

export function createInMemoryRepositories(): RepositorySet {
  return {
    projects: new InMemoryProjectRepository(),
    models: new InMemoryModelRepository(),
    diagrams: new InMemoryDiagramRepository(),
    elements: new InMemoryElementRepository(),
    connections: new InMemoryConnectionRepository(),
  };
}
