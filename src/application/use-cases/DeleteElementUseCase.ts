import type {
  IElementRepository,
  IDiagramRepository,
  IConnectionRepository,
} from "@/application/ports/IRepository";

// ----------------------------------------------------------------
// Output DTO
// ----------------------------------------------------------------

export interface DeleteElementResult {
  deletedElementId: string;
  deletedConnectionIds: string[];
}

// ----------------------------------------------------------------
// Use case
// ----------------------------------------------------------------

export class DeleteElementUseCase {
  constructor(
    private readonly elementRepo: IElementRepository,
    private readonly diagramRepo: IDiagramRepository,
    private readonly connectionRepo: IConnectionRepository
  ) {}

  async execute(elementId: string): Promise<DeleteElementResult> {
    // 1. Verify element exists
    const element = await this.elementRepo.getElement(elementId);
    if (!element) {
      throw new Error(`Element «${elementId}» not found`);
    }

    // 2. Find all connections involving this element
    const allConns = await this.connectionRepo.listByDiagram(element.diagramId);
    const affected = allConns.filter(
      (c) => c.sourceId === elementId || c.targetId === elementId
    );

    // 3. Delete connections
    await Promise.all(affected.map((c) => this.connectionRepo.deleteConnection(c.id)));

    // 4. Delete element
    await this.elementRepo.deleteElement(elementId);

    // 5. Update diagram's elementIds and connectionIds
    const diagram = await this.diagramRepo.getDiagram(element.diagramId);
    if (diagram) {
      const affectedIds = new Set(affected.map((c) => c.id));
      await this.diagramRepo.saveDiagram({
        ...diagram,
        elementIds: diagram.elementIds.filter((id) => id !== elementId),
        connectionIds: diagram.connectionIds.filter((id) => !affectedIds.has(id)),
        updatedAt: new Date(),
      });
    }

    return {
      deletedElementId: elementId,
      deletedConnectionIds: affected.map((c) => c.id),
    };
  }
}
