// ============================================================
// Domain Entities — Arcadia Web Modeling Tool
// ============================================================

// --- Access Control ---

export type AccessRole = "Owner" | "Editor" | "Viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: AccessRole;
  joinedAt: Date;
}

// --- Arcadia View Types ---

export type ArcadiaView = "OA" | "SA" | "LA" | "PA" | "EPBS";

export type DiagramType =
  | "OEBD"  // Operational Entity Breakdown Diagram
  | "OAD"   // Operational Activity Diagram
  | "SAB"   // System Architecture Blank
  | "SFCD"  // System Functional Chain Diagram
  | "LAB"   // Logical Architecture Blank
  | "LDFD"  // Logical Data Flow Diagram
  | "PAB"   // Physical Architecture Blank
  | "PDD"   // Physical Deployment Diagram
  | "EPBS"; // End Product Breakdown Structure

// --- Element Types ---

export type ElementKind =
  // OA
  | "OperationalEntity"
  | "OperationalActivity"
  | "OperationalInteraction"
  // SA
  | "SystemFunction"
  | "SystemExchangeItem"
  | "SystemInterface"
  | "FunctionalChain"
  // LA
  | "LogicalComponent"
  | "LogicalFunction"
  | "LogicalInterface"
  | "LogicalExchangeItem"
  // PA
  | "PhysicalComponent"
  | "PhysicalFunction"
  | "PhysicalInterface"
  | "PhysicalLink"
  | "PhysicalExchangeItem"
  | "PhysicalPort"
  // EPBS
  | "ConfigurationItem"
  // Shared
  | "ExchangePort"
  | "FunctionPort"
  | "RealizationLink";

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementSize {
  width: number;
  height: number;
}

export interface Element {
  id: string;
  modelId: string;
  diagramId: string;
  kind: ElementKind;
  name: string;
  description?: string;
  position: ElementPosition;
  size?: ElementSize;
  parentId?: string;        // for containment (e.g. function inside component)
  realizationIds: string[]; // IDs of elements this element realizes (cross-view traceability)
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Edge / Connection between elements
export interface Connection {
  id: string;
  modelId: string;
  diagramId: string;
  sourceId: string;
  targetId: string;
  kind: ElementKind; // e.g. "RealizationLink", "LogicalInterface"
  label?: string;
  exchangeItemIds: string[]; // references to ExchangeItem elements
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// --- Diagram ---

export interface Diagram {
  id: string;
  modelId: string;
  name: string;
  view: ArcadiaView;
  type: DiagramType;
  elementIds: string[];
  connectionIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Model ---

export interface Model {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  members: ProjectMember[];   // model-level access control
  diagramIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Project ---

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: ProjectMember[];
  modelIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Validation ---

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationResult {
  ruleId: string;
  severity: ValidationSeverity;
  message: string;
  elementId?: string;
  connectionId?: string;
}
