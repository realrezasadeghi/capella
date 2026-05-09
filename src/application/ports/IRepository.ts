import type {
  Project,
  Model,
  Diagram,
  Element as ArcadiaElement,
  Connection,
} from "@/domain/entities";

// ----------------------------------------------------------------
// Repository Port interfaces — implemented by infrastructure layer
// ----------------------------------------------------------------

export interface IProjectRepository {
  getProject(id: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
}

export interface IModelRepository {
  getModel(id: string): Promise<Model | null>;
  listByProject(projectId: string): Promise<Model[]>;
  saveModel(model: Model): Promise<void>;
  deleteModel(id: string): Promise<void>;
}

export interface IDiagramRepository {
  getDiagram(id: string): Promise<Diagram | null>;
  listByModel(modelId: string): Promise<Diagram[]>;
  saveDiagram(diagram: Diagram): Promise<void>;
  deleteDiagram(id: string): Promise<void>;
}

export interface IElementRepository {
  getElement(id: string): Promise<ArcadiaElement | null>;
  listByDiagram(diagramId: string): Promise<ArcadiaElement[]>;
  saveElement(element: ArcadiaElement): Promise<void>;
  deleteElement(id: string): Promise<void>;
}

export interface IConnectionRepository {
  getConnection(id: string): Promise<Connection | null>;
  listByDiagram(diagramId: string): Promise<Connection[]>;
  saveConnection(connection: Connection): Promise<void>;
  deleteConnection(id: string): Promise<void>;
}
