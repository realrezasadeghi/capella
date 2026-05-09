"use client";

import { create } from "zustand";
import type {
  Project,
  Model,
  Diagram,
  Element as ArcadiaElement,
  Connection,
  DiagramType,
  ElementKind,
  ArcadiaView,
  ValidationResult,
} from "@/domain/entities";
import { ValidationEngine } from "@/domain/services/ValidationEngine";

// ----------------------------------------------------------------
// Mock seed data
// ----------------------------------------------------------------

const NOW = new Date();
const pid = "p1";
const mid = "m1";

const mockProject: Project = {
  id: pid,
  name: "سیستم نمایش داده",
  description: "نمونه مدل سیستم‌مهندسی با متدولوژی Arcadia",
  ownerId: "user1",
  members: [{ userId: "user1", role: "Owner", joinedAt: NOW }],
  modelIds: [mid],
  createdAt: NOW,
  updatedAt: NOW,
};

const mockModel: Model = {
  id: mid,
  projectId: pid,
  name: "مدل سیستم v1",
  members: [],
  diagramIds: ["d1", "d2", "d3"],
  createdAt: NOW,
  updatedAt: NOW,
};

const mockDiagrams: Diagram[] = [
  {
    id: "d1",
    modelId: mid,
    name: "System Architecture Blank",
    view: "SA",
    type: "SAB",
    elementIds: ["e1", "e2", "e3"],
    connectionIds: ["c1"],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "d2",
    modelId: mid,
    name: "Logical Architecture Blank",
    view: "LA",
    type: "LAB",
    elementIds: ["e4", "e5"],
    connectionIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "d3",
    modelId: mid,
    name: "Physical Architecture Blank",
    view: "PA",
    type: "PAB",
    elementIds: [],
    connectionIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const mockElements: ArcadiaElement[] = [
  {
    id: "e1",
    modelId: mid,
    diagramId: "d1",
    kind: "SystemFunction",
    name: "Process Input",
    position: { x: 80, y: 120 },
    size: { width: 180, height: 60 },
    realizationIds: [],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "e2",
    modelId: mid,
    diagramId: "d1",
    kind: "SystemFunction",
    name: "Generate Output",
    position: { x: 380, y: 120 },
    size: { width: 180, height: 60 },
    realizationIds: [],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "e3",
    modelId: mid,
    diagramId: "d1",
    kind: "SystemExchangeItem",
    name: "Sensor Data",
    position: { x: 220, y: 280 },
    size: { width: 160, height: 50 },
    realizationIds: [],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "e4",
    modelId: mid,
    diagramId: "d2",
    kind: "LogicalComponent",
    name: "Processing Unit",
    position: { x: 100, y: 100 },
    size: { width: 200, height: 80 },
    realizationIds: ["e1"],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: "e5",
    modelId: mid,
    diagramId: "d2",
    kind: "LogicalComponent",
    name: "Output Manager",
    position: { x: 420, y: 100 },
    size: { width: 200, height: 80 },
    realizationIds: ["e2"],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
];

const mockConnections: Connection[] = [
  {
    id: "c1",
    modelId: mid,
    diagramId: "d1",
    sourceId: "e1",
    targetId: "e2",
    kind: "SystemInterface",
    label: "Data Flow",
    exchangeItemIds: ["e3"],
    properties: {},
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// ----------------------------------------------------------------
// Default connection kind per diagram type
// ----------------------------------------------------------------

export const DEFAULT_CONNECTION_KIND: Record<DiagramType, ElementKind> = {
  OEBD: "OperationalInteraction",
  OAD: "OperationalInteraction",
  SAB: "SystemInterface",
  SFCD: "SystemInterface",
  LAB: "LogicalInterface",
  LDFD: "LogicalInterface",
  PAB: "PhysicalLink",
  PDD: "PhysicalLink",
  EPBS: "RealizationLink",
};

// Diagram view mapping
export const DIAGRAM_VIEW: Record<DiagramType, ArcadiaView> = {
  OEBD: "OA",
  OAD: "OA",
  SAB: "SA",
  SFCD: "SA",
  LAB: "LA",
  LDFD: "LA",
  PAB: "PA",
  PDD: "PA",
  EPBS: "EPBS",
};

// ----------------------------------------------------------------
// Store interface
// ----------------------------------------------------------------

export interface EditorStore {
  project: Project;
  models: Model[];
  diagrams: Diagram[];
  elements: ArcadiaElement[];
  connections: Connection[];
  selectedDiagramId: string;
  selectedElementId: string | null;
  validationResults: ValidationResult[];
  validationVisible: boolean;

  // selection
  selectDiagram: (id: string) => void;
  selectElement: (id: string | null) => void;

  // element mutations
  addElement: (element: ArcadiaElement) => void;
  updateElementName: (id: string, name: string) => void;
  updateElementDescription: (id: string, description: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  deleteElement: (id: string) => void;

  // connection mutations
  addConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;

  // diagram mutations
  createDiagram: (modelId: string, name: string, type: DiagramType) => void;

  // validation
  runValidation: () => void;
  toggleValidationPanel: () => void;
}

// ----------------------------------------------------------------
// Zustand store
// ----------------------------------------------------------------

export const useEditorStore = create<EditorStore>((set, get) => ({
  project: mockProject,
  models: [mockModel],
  diagrams: mockDiagrams,
  elements: mockElements,
  connections: mockConnections,
  selectedDiagramId: "d1",
  selectedElementId: null,
  validationResults: [],
  validationVisible: false,

  // ---- Selection ----
  selectDiagram: (id) => set({ selectedDiagramId: id, selectedElementId: null }),
  selectElement: (id) => set({ selectedElementId: id }),

  // ---- Element mutations ----
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      diagrams: state.diagrams.map((d) =>
        d.id === element.diagramId
          ? { ...d, elementIds: [...d.elementIds, element.id], updatedAt: new Date() }
          : d
      ),
    })),

  updateElementName: (id, name) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, name, updatedAt: new Date() } : el
      ),
    })),

  updateElementDescription: (id, description) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, description, updatedAt: new Date() } : el
      ),
    })),

  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, position: { x, y }, updatedAt: new Date() } : el
      ),
    })),

  deleteElement: (id) =>
    set((state) => {
      const removedConnIds = new Set(
        state.connections
          .filter((c) => c.sourceId === id || c.targetId === id)
          .map((c) => c.id)
      );
      return {
        elements: state.elements.filter((el) => el.id !== id),
        connections: state.connections.filter(
          (c) => c.sourceId !== id && c.targetId !== id
        ),
        diagrams: state.diagrams.map((d) => ({
          ...d,
          elementIds: d.elementIds.filter((eid) => eid !== id),
          connectionIds: d.connectionIds.filter((cid) => !removedConnIds.has(cid)),
        })),
        selectedElementId: null,
      };
    }),

  // ---- Connection mutations ----
  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, connection],
      diagrams: state.diagrams.map((d) =>
        d.id === connection.diagramId
          ? {
              ...d,
              connectionIds: [...d.connectionIds, connection.id],
              updatedAt: new Date(),
            }
          : d
      ),
    })),

  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      diagrams: state.diagrams.map((d) => ({
        ...d,
        connectionIds: d.connectionIds.filter((cid) => cid !== id),
      })),
    })),

  // ---- Diagram mutations ----
  createDiagram: (modelId, name, type) => {
    const diagram: Diagram = {
      id: crypto.randomUUID(),
      modelId,
      name,
      view: DIAGRAM_VIEW[type],
      type,
      elementIds: [],
      connectionIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      diagrams: [...state.diagrams, diagram],
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, diagramIds: [...m.diagramIds, diagram.id] }
          : m
      ),
      selectedDiagramId: diagram.id,
      selectedElementId: null,
    }));
  },

  // ---- Validation ----
  runValidation: () => {
    const state = get();
    const results = ValidationEngine.validateModel({
      diagrams: state.diagrams,
      allElements: state.elements,
      allConnections: state.connections,
    });
    set({ validationResults: results, validationVisible: true });
  },

  toggleValidationPanel: () =>
    set((state) => ({ validationVisible: !state.validationVisible })),
}));
