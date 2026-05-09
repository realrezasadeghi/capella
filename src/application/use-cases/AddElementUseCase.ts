import type {
  Element as ArcadiaElement,
  ElementKind,
  DiagramType,
} from "@/domain/entities";
import type {
  IElementRepository,
  IDiagramRepository,
} from "@/application/ports/IRepository";

// ----------------------------------------------------------------
// Elements allowed per diagram type
// ----------------------------------------------------------------

const ALLOWED_KINDS_PER_DIAGRAM: Record<DiagramType, ElementKind[]> = {
  OEBD: ["OperationalEntity", "OperationalInteraction"],
  OAD: ["OperationalActivity", "OperationalInteraction", "FunctionPort", "ExchangePort"],
  SAB: ["SystemFunction", "SystemInterface", "SystemExchangeItem", "FunctionalChain", "FunctionPort", "ExchangePort"],
  SFCD: ["SystemFunction", "SystemInterface", "FunctionalChain"],
  LAB: ["LogicalComponent", "LogicalFunction", "LogicalInterface", "LogicalExchangeItem", "FunctionPort", "ExchangePort"],
  LDFD: ["LogicalFunction", "LogicalInterface", "LogicalExchangeItem"],
  PAB: ["PhysicalComponent", "PhysicalFunction", "PhysicalInterface", "PhysicalLink", "PhysicalPort", "PhysicalExchangeItem"],
  PDD: ["PhysicalComponent", "PhysicalLink"],
  EPBS: ["ConfigurationItem"],
};

// ----------------------------------------------------------------
// Input DTO
// ----------------------------------------------------------------

export interface AddElementInput {
  modelId: string;
  diagramId: string;
  kind: ElementKind;
  name: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  parentId?: string;
}

// ----------------------------------------------------------------
// Use case
// ----------------------------------------------------------------

export class AddElementUseCase {
  constructor(
    private readonly elementRepo: IElementRepository,
    private readonly diagramRepo: IDiagramRepository
  ) {}

  async execute(input: AddElementInput): Promise<ArcadiaElement> {
    // 1. Fetch diagram to validate kind
    const diagram = await this.diagramRepo.getDiagram(input.diagramId);
    if (!diagram) {
      throw new Error(`Diagram «${input.diagramId}» not found`);
    }

    // 2. Check element kind is allowed in this diagram type
    const allowed = ALLOWED_KINDS_PER_DIAGRAM[diagram.type];
    if (allowed && !allowed.includes(input.kind)) {
      throw new Error(
        `Element kind «${input.kind}» is not allowed in diagram type «${diagram.type}»`
      );
    }

    // 3. Build element
    const now = new Date();
    const element: ArcadiaElement = {
      id: crypto.randomUUID(),
      modelId: input.modelId,
      diagramId: input.diagramId,
      kind: input.kind,
      name: input.name,
      position: input.position,
      size: input.size ?? { width: 160, height: 60 },
      parentId: input.parentId,
      realizationIds: [],
      properties: {},
      createdAt: now,
      updatedAt: now,
    };

    // 4. Persist element
    await this.elementRepo.saveElement(element);

    // 5. Update diagram's elementIds
    const updatedDiagram = {
      ...diagram,
      elementIds: [...diagram.elementIds, element.id],
      updatedAt: now,
    };
    await this.diagramRepo.saveDiagram(updatedDiagram);

    return element;
  }
}
