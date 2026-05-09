import type { Diagram, DiagramType, ArcadiaView } from "@/domain/entities";
import type {
  IDiagramRepository,
  IModelRepository,
} from "@/application/ports/IRepository";

// ----------------------------------------------------------------
// View derivation
// ----------------------------------------------------------------

const DIAGRAM_VIEW: Record<DiagramType, ArcadiaView> = {
  OEBD: "OA", OAD: "OA",
  SAB: "SA",  SFCD: "SA",
  LAB: "LA",  LDFD: "LA",
  PAB: "PA",  PDD: "PA",
  EPBS: "EPBS",
};

// ----------------------------------------------------------------
// Input DTO
// ----------------------------------------------------------------

export interface CreateDiagramInput {
  modelId: string;
  name: string;
  type: DiagramType;
}

// ----------------------------------------------------------------
// Use case
// ----------------------------------------------------------------

export class CreateDiagramUseCase {
  constructor(
    private readonly diagramRepo: IDiagramRepository,
    private readonly modelRepo: IModelRepository
  ) {}

  async execute(input: CreateDiagramInput): Promise<Diagram> {
    // 1. Verify model exists
    const model = await this.modelRepo.getModel(input.modelId);
    if (!model) {
      throw new Error(`Model «${input.modelId}» not found`);
    }

    // 2. Validate name
    if (!input.name.trim()) {
      throw new Error("Diagram name must not be empty");
    }

    // 3. Build diagram
    const now = new Date();
    const diagram: Diagram = {
      id: crypto.randomUUID(),
      modelId: input.modelId,
      name: input.name.trim(),
      view: DIAGRAM_VIEW[input.type],
      type: input.type,
      elementIds: [],
      connectionIds: [],
      createdAt: now,
      updatedAt: now,
    };

    // 4. Persist diagram
    await this.diagramRepo.saveDiagram(diagram);

    // 5. Update model's diagramIds
    const updatedModel = {
      ...model,
      diagramIds: [...model.diagramIds, diagram.id],
      updatedAt: now,
    };
    await this.modelRepo.saveModel(updatedModel);

    return diagram;
  }
}
