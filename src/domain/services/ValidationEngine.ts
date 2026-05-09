// ============================================================
// Validation Engine — Domain Service
// Enforces Arcadia methodology rules at edit-time and save-time
// ============================================================

import type {
  Element,
  Connection,
  Diagram,
  ValidationResult,
  ElementKind,
} from "@/domain/entities";

// ----------------------------------------------------------------
// Rule registry
// ----------------------------------------------------------------

type RuleId =
  | "LEAF_FUNCTION_EXCHANGE_PORT"
  | "FUNCTION_COMPONENT_ASSIGNMENT"
  | "INTERFACE_EXCHANGE_ITEM"
  | "PHYSICAL_CONNECTION_REALIZATION"
  | "UNIQUE_ID_IN_MODEL"
  | "VALID_CONNECTION_ENDPOINTS";

interface ValidationContext {
  diagram: Diagram;
  allElements: Map<string, Element>;
  allConnections: Map<string, Connection>;
}

// Allowed source → target kinds per connection type
const ALLOWED_CONNECTIONS: Partial<
  Record<ElementKind, ElementKind[]>
> = {
  RealizationLink: [
    "PhysicalComponent",
    "PhysicalFunction",
    "PhysicalInterface",
  ],
  LogicalInterface: ["LogicalComponent", "LogicalFunction"],
  SystemInterface: ["SystemFunction"],
  OperationalInteraction: ["OperationalEntity", "OperationalActivity"],
};

// ----------------------------------------------------------------
// Individual rule implementations
// ----------------------------------------------------------------

function checkLeafFunctionExchangePort(
  ctx: ValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = [];

  ctx.allElements.forEach((element) => {
    if (element.kind !== "ExchangePort") return;

    // The parent must be a leaf function (no children)
    if (!element.parentId) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT",
        severity: "error",
        message:
          "Exchange Port باید به یک Function برگ (Leaf) وابسته باشد.",
        elementId: element.id,
      });
      return;
    }

    const parent = ctx.allElements.get(element.parentId);
    if (!parent) return;

    // Check if parent is a function kind
    const functionKinds: ElementKind[] = [
      "SystemFunction",
      "LogicalFunction",
      "PhysicalFunction",
      "OperationalActivity",
    ];
    if (!functionKinds.includes(parent.kind)) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT",
        severity: "error",
        message: `Exchange Port فقط می‌تواند به یک Function برگ متعلق باشد، نه به «${parent.kind}».`,
        elementId: element.id,
      });
      return;
    }

    // Check the parent is a leaf (has no function children)
    const hasChildren = Array.from(ctx.allElements.values()).some(
      (el) =>
        el.parentId === parent.id && functionKinds.includes(el.kind)
    );
    if (hasChildren) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT",
        severity: "error",
        message: `تابع «${parent.name}» یک Function برگ نیست و نمی‌تواند Exchange Port داشته باشد.`,
        elementId: element.id,
      });
    }
  });

  return results;
}

function checkFunctionComponentAssignment(
  ctx: ValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = [];

  const functionKinds: ElementKind[] = [
    "SystemFunction",
    "LogicalFunction",
    "PhysicalFunction",
    "OperationalActivity",
  ];
  const componentKinds: ElementKind[] = [
    "LogicalComponent",
    "PhysicalComponent",
    "OperationalEntity",
  ];

  ctx.allElements.forEach((element) => {
    if (!functionKinds.includes(element.kind)) return;

    // Check if it is a leaf function (no function children)
    const hasChildren = Array.from(ctx.allElements.values()).some(
      (el) =>
        el.parentId === element.id && functionKinds.includes(el.kind)
    );
    if (hasChildren) return; // non-leaf; skip

    // The leaf function must be contained in (parentId) a component
    if (!element.parentId) {
      results.push({
        ruleId: "FUNCTION_COMPONENT_ASSIGNMENT",
        severity: "error",
        message: `تابع برگ «${element.name}» باید حداقل به یک مؤلفه تخصیص یابد.`,
        elementId: element.id,
      });
      return;
    }

    const parent = ctx.allElements.get(element.parentId);
    if (!parent || !componentKinds.includes(parent.kind)) {
      results.push({
        ruleId: "FUNCTION_COMPONENT_ASSIGNMENT",
        severity: "error",
        message: `تابع برگ «${element.name}» باید زیرمجموعه یک Component یا Entity باشد.`,
        elementId: element.id,
      });
    }
  });

  return results;
}

function checkInterfaceExchangeItem(
  ctx: ValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = [];

  const interfaceKinds: ElementKind[] = [
    "SystemInterface",
    "LogicalInterface",
    "PhysicalInterface",
  ];

  ctx.allConnections.forEach((connection) => {
    if (!interfaceKinds.includes(connection.kind)) return;

    if (connection.exchangeItemIds.length === 0) {
      results.push({
        ruleId: "INTERFACE_EXCHANGE_ITEM",
        severity: "error",
        message: `رابط «${connection.label ?? connection.id}» باید حداقل یک Exchange Item داشته باشد.`,
        connectionId: connection.id,
      });
    }
  });

  return results;
}

function checkPhysicalConnectionRealization(
  ctx: ValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = [];

  ctx.allConnections.forEach((connection) => {
    if (connection.kind !== "PhysicalLink") return;

    const source = ctx.allElements.get(connection.sourceId);
    const target = ctx.allElements.get(connection.targetId);

    if (!source || !target) return;

    // Both source and target must have at least one RealizationLink to a logical element
    const sourceHasRealization = source.realizationIds.length > 0;
    const targetHasRealization = target.realizationIds.length > 0;

    if (!sourceHasRealization) {
      results.push({
        ruleId: "PHYSICAL_CONNECTION_REALIZATION",
        severity: "error",
        message: `مؤلفه فیزیکی «${source.name}» فاقد Realization Link به عنصر منطقی معتبر است.`,
        elementId: source.id,
        connectionId: connection.id,
      });
    }

    if (!targetHasRealization) {
      results.push({
        ruleId: "PHYSICAL_CONNECTION_REALIZATION",
        severity: "error",
        message: `مؤلفه فیزیکی «${target.name}» فاقد Realization Link به عنصر منطقی معتبر است.`,
        elementId: target.id,
        connectionId: connection.id,
      });
    }
  });

  return results;
}

function checkUniqueIds(
  elements: Element[],
  connections: Connection[]
): ValidationResult[] {
  const seen = new Map<string, string>();
  const results: ValidationResult[] = [];

  for (const el of elements) {
    if (seen.has(el.id)) {
      results.push({
        ruleId: "UNIQUE_ID_IN_MODEL",
        severity: "error",
        message: `شناسه تکراری «${el.id}» برای عنصر «${el.name}» شناسایی شد.`,
        elementId: el.id,
      });
    } else {
      seen.set(el.id, el.name);
    }
  }

  for (const conn of connections) {
    if (seen.has(conn.id)) {
      results.push({
        ruleId: "UNIQUE_ID_IN_MODEL",
        severity: "error",
        message: `شناسه تکراری «${conn.id}» در اتصالات شناسایی شد.`,
        connectionId: conn.id,
      });
    } else {
      seen.set(conn.id, conn.id);
    }
  }

  return results;
}

function checkValidConnectionEndpoints(
  ctx: ValidationContext
): ValidationResult[] {
  const results: ValidationResult[] = [];

  ctx.allConnections.forEach((connection) => {
    const source = ctx.allElements.get(connection.sourceId);
    const target = ctx.allElements.get(connection.targetId);

    if (!source) {
      results.push({
        ruleId: "VALID_CONNECTION_ENDPOINTS",
        severity: "error",
        message: `اتصال «${connection.id}» مبدأ معتبری ندارد.`,
        connectionId: connection.id,
      });
    }

    if (!target) {
      results.push({
        ruleId: "VALID_CONNECTION_ENDPOINTS",
        severity: "error",
        message: `اتصال «${connection.id}» مقصد معتبری ندارد.`,
        connectionId: connection.id,
      });
    }

    if (!source || !target) return;

    // Check allowed connection kinds
    const allowedTargets = ALLOWED_CONNECTIONS[connection.kind];
    if (allowedTargets) {
      if (!allowedTargets.includes(source.kind)) {
        results.push({
          ruleId: "VALID_CONNECTION_ENDPOINTS",
          severity: "error",
          message: `نوع عنصر مبدأ «${source.kind}» برای اتصال از نوع «${connection.kind}» مجاز نیست.`,
          connectionId: connection.id,
          elementId: source.id,
        });
      }
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export interface ValidateConnectionParams {
  connection: Omit<Connection, "id" | "createdAt" | "updatedAt">;
  diagram: Diagram;
  allElements: Map<string, Element>;
  allConnections: Map<string, Connection>;
}

export interface ValidateModelParams {
  diagrams: Diagram[];
  allElements: Element[];
  allConnections: Connection[];
}

export class ValidationEngine {
  /**
   * Validates a single connection attempt (called at draw-time).
   * Returns errors if the connection violates Arcadia rules.
   */
  static validateConnection(
    params: ValidateConnectionParams
  ): ValidationResult[] {
    const { connection, diagram, allElements, allConnections } = params;

    const tempId = "__temp__";
    const tempConnection: Connection = {
      ...connection,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tempConnections = new Map(allConnections);
    tempConnections.set(tempId, tempConnection);

    const ctx: ValidationContext = {
      diagram,
      allElements,
      allConnections: tempConnections,
    };

    const results: ValidationResult[] = [
      ...checkValidConnectionEndpoints(ctx),
      ...checkInterfaceExchangeItem(ctx),
      ...checkPhysicalConnectionRealization(ctx),
    ];

    // Filter to only those related to the temp connection
    return results.filter((r) => r.connectionId === tempId);
  }

  /**
   * Validates the entire model before saving.
   * Returns all rule violations across all diagrams.
   */
  static validateModel(params: ValidateModelParams): ValidationResult[] {
    const { allElements, allConnections } = params;

    const elementsMap = new Map(allElements.map((el) => [el.id, el]));
    const connectionsMap = new Map(
      allConnections.map((c) => [c.id, c])
    );

    // Use first diagram as representative context (rules are model-scoped)
    const diagram = params.diagrams[0];
    if (!diagram) return [];

    const ctx: ValidationContext = {
      diagram,
      allElements: elementsMap,
      allConnections: connectionsMap,
    };

    return [
      ...checkUniqueIds(allElements, allConnections),
      ...checkLeafFunctionExchangePort(ctx),
      ...checkFunctionComponentAssignment(ctx),
      ...checkInterfaceExchangeItem(ctx),
      ...checkPhysicalConnectionRealization(ctx),
      ...checkValidConnectionEndpoints(ctx),
    ];
  }

  /**
   * Quick check: is a given connection between two elements allowed?
   */
  static isConnectionAllowed(
    sourceKind: ElementKind,
    targetKind: ElementKind,
    connectionKind: ElementKind
  ): boolean {
    const allowedTargets = ALLOWED_CONNECTIONS[connectionKind];
    if (!allowedTargets) return true; // no restriction defined
    return (
      allowedTargets.includes(sourceKind) &&
      allowedTargets.includes(targetKind)
    );
  }
}
