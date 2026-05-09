import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

const MOCK_PROJECT: Project = {
  id: pid,
  name: "سیستم نمایش داده",
  description: "نمونه مدل سیستم‌مهندسی با متدولوژی Arcadia",
  ownerId: "user1",
  members: [{ userId: "user1", role: "Owner", joinedAt: NOW }],
  modelIds: [mid],
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_MODEL: Model = {
  id: mid,
  projectId: pid,
  name: "مدل سیستم v1",
  members: [],
  diagramIds: ["d1", "d2", "d3"],
  createdAt: NOW,
  updatedAt: NOW,
};

const MOCK_DIAGRAMS: Diagram[] = [
  {
    id: "d1", modelId: mid, name: "System Architecture Blank",
    view: "SA", type: "SAB",
    elementIds: ["e1", "e2", "e3"], connectionIds: ["c1"],
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "d2", modelId: mid, name: "Logical Architecture Blank",
    view: "LA", type: "LAB",
    elementIds: ["e4", "e5"], connectionIds: [],
    createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "d3", modelId: mid, name: "Physical Architecture Blank",
    view: "PA", type: "PAB",
    elementIds: [], connectionIds: [],
    createdAt: NOW, updatedAt: NOW,
  },
];

const MOCK_ELEMENTS: ArcadiaElement[] = [
  {
    id: "e1", modelId: mid, diagramId: "d1", kind: "SystemFunction",
    name: "Process Input", position: { x: 80, y: 120 }, size: { width: 180, height: 60 },
    realizationIds: [], properties: {}, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "e2", modelId: mid, diagramId: "d1", kind: "SystemFunction",
    name: "Generate Output", position: { x: 380, y: 120 }, size: { width: 180, height: 60 },
    realizationIds: [], properties: {}, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "e3", modelId: mid, diagramId: "d1", kind: "SystemExchangeItem",
    name: "Sensor Data", position: { x: 220, y: 280 }, size: { width: 160, height: 50 },
    realizationIds: [], properties: {}, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "e4", modelId: mid, diagramId: "d2", kind: "LogicalComponent",
    name: "Processing Unit", position: { x: 100, y: 100 }, size: { width: 200, height: 80 },
    realizationIds: ["e1"], properties: {}, createdAt: NOW, updatedAt: NOW,
  },
  {
    id: "e5", modelId: mid, diagramId: "d2", kind: "LogicalComponent",
    name: "Output Manager", position: { x: 420, y: 100 }, size: { width: 200, height: 80 },
    realizationIds: ["e2"], properties: {}, createdAt: NOW, updatedAt: NOW,
  },
];

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "c1", modelId: mid, diagramId: "d1",
    sourceId: "e1", targetId: "e2",
    kind: "SystemInterface", label: "Data Flow",
    exchangeItemIds: ["e3"], properties: {},
    createdAt: NOW, updatedAt: NOW,
  },
];

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

export const DEFAULT_CONNECTION_KIND: Record<DiagramType, ElementKind> = {
  OEBD: "OperationalInteraction", OAD: "OperationalInteraction",
  SAB: "SystemInterface",         SFCD: "SystemInterface",
  LAB: "LogicalInterface",        LDFD: "LogicalInterface",
  PAB: "PhysicalLink",            PDD: "PhysicalLink",
  EPBS: "RealizationLink",
};

export const DIAGRAM_VIEW: Record<DiagramType, ArcadiaView> = {
  OEBD: "OA", OAD: "OA",
  SAB: "SA",  SFCD: "SA",
  LAB: "LA",  LDFD: "LA",
  PAB: "PA",  PDD: "PA",
  EPBS: "EPBS",
};

// ----------------------------------------------------------------
// Model snapshot (for export / import)
// ----------------------------------------------------------------

export interface ModelSnapshot {
  version: "1.0";
  exportedAt: string;
  project: Project;
  models: Model[];
  diagrams: Diagram[];
  elements: ArcadiaElement[];
  connections: Connection[];
}

// ----------------------------------------------------------------
// Persisted slice — what gets saved to localStorage
// ----------------------------------------------------------------

interface PersistedState {
  project: Project;
  models: Model[];
  diagrams: Diagram[];
  elements: ArcadiaElement[];
  connections: Connection[];
  selectedDiagramId: string;
}

// ----------------------------------------------------------------
// Store interface
// ----------------------------------------------------------------

export interface EditorStore extends PersistedState {
  // UI-only (not persisted)
  selectedElementId: string | null;
  validationResults: ValidationResult[];
  validationVisible: boolean;

  // Selection
  selectDiagram: (id: string) => void;
  selectElement: (id: string | null) => void;

  // Element mutations
  addElement: (element: ArcadiaElement) => void;
  updateElementName: (id: string, name: string) => void;
  updateElementDescription: (id: string, description: string) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  deleteElement: (id: string) => void;

  // Connection mutations
  addConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;

  // Diagram mutations
  createDiagram: (modelId: string, name: string, type: DiagramType) => void;

  // Validation
  runValidation: () => void;
  toggleValidationPanel: () => void;

  // Persistence
  loadModel: (snapshot: ModelSnapshot) => void;
  resetToMock: () => void;
}

// ----------------------------------------------------------------
// Safe localStorage wrapper (handles SSR + quota errors)
// ----------------------------------------------------------------

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
});

// ----------------------------------------------------------------
// Zustand store with persist middleware
// ----------------------------------------------------------------

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      // ---- Persisted state ----
      project: MOCK_PROJECT,
      models: [MOCK_MODEL],
      diagrams: MOCK_DIAGRAMS,
      elements: MOCK_ELEMENTS,
      connections: MOCK_CONNECTIONS,
      selectedDiagramId: "d1",

      // ---- UI state (not persisted) ----
      selectedElementId: null,
      validationResults: [],
      validationVisible: false,

      // ---- Selection ----
      selectDiagram: (id) =>
        set({ selectedDiagramId: id, selectedElementId: null }),

      selectElement: (id) => set({ selectedElementId: id }),

      // ---- Element mutations ----
      addElement: (element) =>
        set((s) => ({
          elements: [...s.elements, element],
          diagrams: s.diagrams.map((d) =>
            d.id === element.diagramId
              ? { ...d, elementIds: [...d.elementIds, element.id], updatedAt: new Date() }
              : d
          ),
        })),

      updateElementName: (id, name) =>
        set((s) => ({
          elements: s.elements.map((el) =>
            el.id === id ? { ...el, name, updatedAt: new Date() } : el
          ),
        })),

      updateElementDescription: (id, description) =>
        set((s) => ({
          elements: s.elements.map((el) =>
            el.id === id ? { ...el, description, updatedAt: new Date() } : el
          ),
        })),

      updateElementPosition: (id, x, y) =>
        set((s) => ({
          elements: s.elements.map((el) =>
            el.id === id ? { ...el, position: { x, y }, updatedAt: new Date() } : el
          ),
        })),

      deleteElement: (id) =>
        set((s) => {
          const removedConnIds = new Set(
            s.connections
              .filter((c) => c.sourceId === id || c.targetId === id)
              .map((c) => c.id)
          );
          return {
            elements: s.elements.filter((el) => el.id !== id),
            connections: s.connections.filter(
              (c) => c.sourceId !== id && c.targetId !== id
            ),
            diagrams: s.diagrams.map((d) => ({
              ...d,
              elementIds: d.elementIds.filter((eid) => eid !== id),
              connectionIds: d.connectionIds.filter((cid) => !removedConnIds.has(cid)),
            })),
            selectedElementId: null,
          };
        }),

      // ---- Connection mutations ----
      addConnection: (connection) =>
        set((s) => ({
          connections: [...s.connections, connection],
          diagrams: s.diagrams.map((d) =>
            d.id === connection.diagramId
              ? { ...d, connectionIds: [...d.connectionIds, connection.id], updatedAt: new Date() }
              : d
          ),
        })),

      deleteConnection: (id) =>
        set((s) => ({
          connections: s.connections.filter((c) => c.id !== id),
          diagrams: s.diagrams.map((d) => ({
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
        set((s) => ({
          diagrams: [...s.diagrams, diagram],
          models: s.models.map((m) =>
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
        const s = get();
        const results = ValidationEngine.validateModel({
          diagrams: s.diagrams,
          allElements: s.elements,
          allConnections: s.connections,
        });
        set({ validationResults: results, validationVisible: true });
      },

      toggleValidationPanel: () =>
        set((s) => ({ validationVisible: !s.validationVisible })),

      // ---- Persistence ----
      loadModel: (snapshot) => {
        set({
          project: snapshot.project,
          models: snapshot.models,
          diagrams: snapshot.diagrams,
          elements: snapshot.elements,
          connections: snapshot.connections,
          selectedDiagramId: snapshot.diagrams[0]?.id ?? "",
          selectedElementId: null,
          validationResults: [],
          validationVisible: false,
        });
      },

      resetToMock: () => {
        set({
          project: MOCK_PROJECT,
          models: [MOCK_MODEL],
          diagrams: MOCK_DIAGRAMS,
          elements: MOCK_ELEMENTS,
          connections: MOCK_CONNECTIONS,
          selectedDiagramId: "d1",
          selectedElementId: null,
          validationResults: [],
          validationVisible: false,
        });
      },
    }),
    {
      name: "arcadia-editor-v1",
      storage: safeStorage,
      // Only persist model data — UI state resets on reload
      partialize: (s): PersistedState => ({
        project: s.project,
        models: s.models,
        diagrams: s.diagrams,
        elements: s.elements,
        connections: s.connections,
        selectedDiagramId: s.selectedDiagramId,
      }),
    }
  )
);
