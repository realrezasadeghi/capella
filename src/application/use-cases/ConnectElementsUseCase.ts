import type {
  Connection,
  ElementKind,
  DiagramType,
} from "@/domain/entities";
import type {
  IElementRepository,
  IDiagramRepository,
  IConnectionRepository,
} from "@/application/ports/IRepository";
import { ValidationEngine } from "@/domain/services/ValidationEngine";

// ----------------------------------------------------------------
// Default connection kind per diagram type
// ----------------------------------------------------------------

const DEFAULT_KIND: Record<DiagramType, ElementKind> = {
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
// Input DTO
// ----------------------------------------------------------------

export interface ConnectElementsInput {
  sourceId: string;
  targetId: string;
  diagramId: string;
  modelId: string;
  /** If omitted, derived from diagram type */
  connectionKind?: ElementKind;
  label?: string;
}

// ----------------------------------------------------------------
// Use case
// ----------------------------------------------------------------

export class ConnectElementsUseCase {
  constructor(
    private readonly elementRepo: IElementRepository,
    private readonly diagramRepo: IDiagramRepository,
    private readonly connectionRepo: IConnectionRepository
  ) {}

  async execute(input: ConnectElementsInput): Promise<Connection> {
    // 1. Fetch entities
    const [source, target, diagram] = await Promise.all([
      this.elementRepo.getElement(input.sourceId),
      this.elementRepo.getElement(input.targetId),
      this.diagramRepo.getDiagram(input.diagramId),
    ]);

    if (!source) throw new Error(`Source element «${input.sourceId}» not found`);
    if (!target) throw new Error(`Target element «${input.targetId}» not found`);
    if (!diagram) throw new Error(`Diagram «${input.diagramId}» not found`);

    // 2. Resolve connection kind
    const connKind = input.connectionKind ?? DEFAULT_KIND[diagram.type];

    // 3. Validate via ValidationEngine
    const allowed = ValidationEngine.isConnectionAllowed(
      source.kind,
      target.kind,
      connKind
    );
    if (!allowed) {
      throw new Error(
        `Connection «${connKind}» between «${source.kind}» and «${target.kind}» is not allowed by Arcadia rules`
      );
    }

    // 4. Build connection
    const now = new Date();
    const connection: Connection = {
      id: crypto.randomUUID(),
      modelId: input.modelId,
      diagramId: input.diagramId,
      sourceId: input.sourceId,
      targetId: input.targetId,
      kind: connKind,
      label: input.label ?? "",
      exchangeItemIds: [],
      properties: {},
      createdAt: now,
      updatedAt: now,
    };

    // 5. Persist
    await this.connectionRepo.saveConnection(connection);

    const updatedDiagram = {
      ...diagram,
      connectionIds: [...diagram.connectionIds, connection.id],
      updatedAt: now,
    };
    await this.diagramRepo.saveDiagram(updatedDiagram);

    return connection;
  }
}
