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
} from "@/domain/entities";

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

  selectDiagram: (id: string) => void;
  selectElement: (id: string | null) => void;
  addElement: (element: ArcadiaElement) => void;
  addConnection: (connection: Connection) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  deleteElement: (id: string) => void;
  deleteConnection: (id: string) => void;
}

// ----------------------------------------------------------------
// Zustand store
// ----------------------------------------------------------------

export const useEditorStore = create<EditorStore>((set) => ({
  project: mockProject,
  models: [mockModel],
  diagrams: mockDiagrams,
  elements: mockElements,
  connections: mockConnections,
  selectedDiagramId: "d1",
  selectedElementId: null,

  selectDiagram: (id) => set({ selectedDiagramId: id, selectedElementId: null }),
  selectElement: (id) => set({ selectedElementId: id }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      diagrams: state.diagrams.map((d) =>
        d.id === element.diagramId
          ? {
              ...d,
              elementIds: [...d.elementIds, element.id],
              updatedAt: new Date(),
            }
          : d
      ),
    })),

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

  updateElementPosition: (id, x, y) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, position: { x, y }, updatedAt: new Date() }
          : el
      ),
    })),

  deleteElement: (id) =>
    set((state) => {
      const removedConns = state.connections.filter(
        (c) => c.sourceId === id || c.targetId === id
      );
      const removedConnIds = new Set(removedConns.map((c) => c.id));
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

  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      diagrams: state.diagrams.map((d) => ({
        ...d,
        connectionIds: d.connectionIds.filter((cid) => cid !== id),
      })),
    })),
}));
