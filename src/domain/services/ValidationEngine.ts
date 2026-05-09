// ============================================================
// Validation Engine — Domain Service
// Enforces Arcadia methodology rules at edit-time and model-time
// ============================================================

import type {
  Element,
  Connection,
  Diagram,
  ValidationResult,
  ElementKind,
} from "@/domain/entities";

// ----------------------------------------------------------------
// Rule IDs
// ----------------------------------------------------------------

type RuleId =
  | "LEAF_FUNCTION_EXCHANGE_PORT"
  | "FUNCTION_COMPONENT_ASSIGNMENT"
  | "INTERFACE_EXCHANGE_ITEM"
  | "PHYSICAL_CONNECTION_REALIZATION"
  | "UNIQUE_ID_IN_MODEL"
  | "VALID_CONNECTION_ENDPOINTS"
  | "DANGLING_REALIZATION"
  | "DEFAULT_ELEMENT_NAME"
  | "EMPTY_DIAGRAM"
  | "CROSS_VIEW_COVERAGE";

interface ValidationContext {
  diagram: Diagram;
  allDiagrams: Diagram[];
  allElements: Map<string, Element>;
  allConnections: Map<string, Connection>;
}

// ----------------------------------------------------------------
// Allowed connection endpoints — sources / targets per connection kind
// ----------------------------------------------------------------

const ALLOWED_CONNECTIONS: Partial<
  Record<ElementKind, { sources: ElementKind[]; targets: ElementKind[] }>
> = {
  RealizationLink: {
    sources: ["PhysicalComponent", "PhysicalFunction", "PhysicalInterface"],
    targets: ["LogicalComponent",  "LogicalFunction",  "LogicalInterface"],
  },
  LogicalInterface: {
    sources: ["LogicalComponent", "LogicalFunction"],
    targets: ["LogicalComponent", "LogicalFunction"],
  },
  SystemInterface: {
    sources: ["SystemFunction"],
    targets: ["SystemFunction"],
  },
  OperationalInteraction: {
    sources: ["OperationalEntity", "OperationalActivity"],
    targets: ["OperationalEntity", "OperationalActivity"],
  },
  PhysicalLink: {
    sources: ["PhysicalComponent", "PhysicalPort"],
    targets: ["PhysicalComponent", "PhysicalPort"],
  },
};

// ----------------------------------------------------------------
// Rule: Exchange ports must be on leaf functions
// ----------------------------------------------------------------

function checkLeafFunctionExchangePort(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = [];
  const functionKinds: ElementKind[] = [
    "SystemFunction", "LogicalFunction", "PhysicalFunction", "OperationalActivity",
  ];

  ctx.allElements.forEach((element) => {
    if (element.kind !== "ExchangePort") return;

    if (!element.parentId) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT", severity: "error",
        message: `Exchange Port باید به یک Function برگ وابسته باشد.`,
        elementId: element.id,
      });
      return;
    }

    const parent = ctx.allElements.get(element.parentId);
    if (!parent) return;

    if (!functionKinds.includes(parent.kind)) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT", severity: "error",
        message: `Exchange Port فقط می‌تواند به یک Function برگ تعلق داشته باشد، نه «${parent.kind}».`,
        elementId: element.id,
      });
      return;
    }

    const hasChildren = Array.from(ctx.allElements.values()).some(
      (el) => el.parentId === parent.id && functionKinds.includes(el.kind)
    );
    if (hasChildren) {
      results.push({
        ruleId: "LEAF_FUNCTION_EXCHANGE_PORT", severity: "error",
        message: `تابع «${parent.name}» یک Function برگ نیست (دارای زیرتابع است).`,
        elementId: element.id,
      });
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Rule: Leaf functions should be assigned to a component (warning)
// ----------------------------------------------------------------

function checkFunctionComponentAssignment(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = [];
  const functionKinds: ElementKind[] = [
    "SystemFunction", "LogicalFunction", "PhysicalFunction", "OperationalActivity",
  ];
  const componentKinds: ElementKind[] = [
    "LogicalComponent", "PhysicalComponent", "OperationalEntity",
  ];

  ctx.allElements.forEach((element) => {
    if (!functionKinds.includes(element.kind)) return;

    const hasChildren = Array.from(ctx.allElements.values()).some(
      (el) => el.parentId === element.id && functionKinds.includes(el.kind)
    );
    if (hasChildren) return;

    if (!element.parentId) {
      results.push({
        ruleId: "FUNCTION_COMPONENT_ASSIGNMENT", severity: "warning",
        message: `تابع برگ «${element.name}» هنوز به یک مؤلفه تخصیص نیافته است.`,
        elementId: element.id,
      });
      return;
    }

    const parent = ctx.allElements.get(element.parentId);
    if (!parent || !componentKinds.includes(parent.kind)) {
      results.push({
        ruleId: "FUNCTION_COMPONENT_ASSIGNMENT", severity: "warning",
        message: `تابع برگ «${element.name}» باید زیرمجموعه یک Component یا Entity باشد.`,
        elementId: element.id,
      });
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Rule: Interfaces must carry at least one exchange item
// ----------------------------------------------------------------

function checkInterfaceExchangeItem(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = [];
  const interfaceKinds: ElementKind[] = [
    "SystemInterface", "LogicalInterface", "PhysicalInterface",
  ];

  ctx.allConnections.forEach((connection) => {
    if (!interfaceKinds.includes(connection.kind)) return;
    if (connection.exchangeItemIds.length === 0) {
      results.push({
        ruleId: "INTERFACE_EXCHANGE_ITEM", severity: "error",
        message: `رابط «${connection.label || connection.id}» باید حداقل یک Exchange Item داشته باشد.`,
        connectionId: connection.id,
      });
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Rule: Physical connections require realization links
// ----------------------------------------------------------------

function checkPhysicalConnectionRealization(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = [];

  ctx.allConnections.forEach((connection) => {
    if (connection.kind !== "PhysicalLink") return;
    const source = ctx.allElements.get(connection.sourceId);
    const target = ctx.allElements.get(connection.targetId);
    if (!source || !target) return;

    if (source.realizationIds.length === 0) {
      results.push({
        ruleId: "PHYSICAL_CONNECTION_REALIZATION", severity: "error",
        message: `مؤلفه فیزیکی «${source.name}» فاقد Realization Link به عنصر منطقی است.`,
        elementId: source.id, connectionId: connection.id,
      });
    }
    if (target.realizationIds.length === 0) {
      results.push({
        ruleId: "PHYSICAL_CONNECTION_REALIZATION", severity: "error",
        message: `مؤلفه فیزیکی «${target.name}» فاقد Realization Link به عنصر منطقی است.`,
        elementId: target.id, connectionId: connection.id,
      });
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Rule: Unique IDs
// ----------------------------------------------------------------

function checkUniqueIds(elements: Element[], connections: Connection[]): ValidationResult[] {
  const seen = new Map<string, string>();
  const results: ValidationResult[] = [];

  for (const el of elements) {
    if (seen.has(el.id)) {
      results.push({
        ruleId: "UNIQUE_ID_IN_MODEL", severity: "error",
        message: `شناسه تکراری «${el.id}» برای عنصر «${el.name}».`, elementId: el.id,
      });
    } else { seen.set(el.id, el.name); }
  }

  for (const conn of connections) {
    if (seen.has(conn.id)) {
      results.push({
        ruleId: "UNIQUE_ID_IN_MODEL", severity: "error",
        message: `شناسه تکراری «${conn.id}» در اتصالات.`, connectionId: conn.id,
      });
    } else { seen.set(conn.id, conn.id); }
  }

  return results;
}

// ----------------------------------------------------------------
// Rule: Valid connection endpoints
// ----------------------------------------------------------------

function checkValidConnectionEndpoints(ctx: ValidationContext): ValidationResult[] {
  const results: ValidationResult[] = [];

  ctx.allConnections.forEach((connection) => {
    const source = ctx.allElements.get(connection.sourceId);
    const target = ctx.allElements.get(connection.targetId);

    if (!source) results.push({
      ruleId: "VALID_CONNECTION_ENDPOINTS", severity: "error",
      message: `اتصال «${connection.id}» مبدأ معتبری ندارد.`, connectionId: connection.id,
    });
    if (!target) results.push({
      ruleId: "VALID_CONNECTION_ENDPOINTS", severity: "error",
      message: `اتصال «${connection.id}» مقصد معتبری ندارد.`, connectionId: connection.id,
    });
    if (!source || !target) return;

    const rule = ALLOWED_CONNECTIONS[connection.kind];
    if (rule) {
      if (!rule.sources.includes(source.kind)) {
        results.push({
          ruleId: "VALID_CONNECTION_ENDPOINTS", severity: "error",
          message: `نوع مبدأ «${source.kind}» برای اتصال «${connection.kind}» مجاز نیست.`,
          connectionId: connection.id, elementId: source.id,
        });
      }
      if (!rule.targets.includes(target.kind)) {
        results.push({
          ruleId: "VALID_CONNECTION_ENDPOINTS", severity: "error",
          message: `نوع مقصد «${target.kind}» برای اتصال «${connection.kind}» مجاز نیست.`,
          connectionId: connection.id, elementId: target.id,
        });
      }
    }
  });

  return results;
}

// ----------------------------------------------------------------
// Rule: No dangling realization IDs
// ----------------------------------------------------------------

function checkDanglingRealization(elements: Element[]): ValidationResult[] {
  const elementIds = new Set(elements.map((e) => e.id));
  const results: ValidationResult[] = [];

  for (const el of elements) {
    for (const rid of el.realizationIds) {
      if (!elementIds.has(rid)) {
        results.push({
          ruleId: "DANGLING_REALIZATION", severity: "error",
          message: `عنصر «${el.name}» به Realization شناسه «${rid}» اشاره می‌کند که وجود ندارد.`,
          elementId: el.id,
        });
      }
    }
  }

  return results;
}

// ----------------------------------------------------------------
// Rule: Default / unchanged element names
// ----------------------------------------------------------------

function checkDefaultElementName(elements: Element[]): ValidationResult[] {
  return elements
    .filter((el) => el.name === el.kind || el.name.trim() === "")
    .map((el) => ({
      ruleId: "DEFAULT_ELEMENT_NAME" as RuleId,
      severity: "warning" as const,
      message: `عنصر «${el.kind}» دارای نام پیش‌فرض است و تغییر نکرده.`,
      elementId: el.id,
    }));
}

// ----------------------------------------------------------------
// Rule: Empty diagrams
// ----------------------------------------------------------------

function checkEmptyDiagram(diagrams: Diagram[]): ValidationResult[] {
  return diagrams
    .filter((d) => d.elementIds.length === 0)
    .map((d) => ({
      ruleId: "EMPTY_DIAGRAM" as RuleId,
      severity: "info" as const,
      message: `دیاگرام «${d.name}» [${d.type}] هیچ عنصری ندارد.`,
    }));
}

// ----------------------------------------------------------------
// Rule: Cross-view realization coverage
// ----------------------------------------------------------------

function checkCrossViewCoverage(
  elements: Element[],
  diagrams: Diagram[]
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const diagramMap = new Map(diagrams.map((d) => [d.id, d]));

  // SA SystemFunction → should be realized by at least one LA LogicalComponent
  const saFunctions = elements.filter(
    (el) => el.kind === "SystemFunction" && diagramMap.get(el.diagramId)?.view === "SA"
  );
  const realizedBySa = new Set(
    elements
      .filter((el) => diagramMap.get(el.diagramId)?.view === "LA")
      .flatMap((el) => el.realizationIds)
  );
  for (const fn of saFunctions) {
    if (!realizedBySa.has(fn.id)) {
      results.push({
        ruleId: "CROSS_VIEW_COVERAGE", severity: "warning",
        message: `SystemFunction «${fn.name}» توسط هیچ LogicalComponent محقق نشده (SA→LA).`,
        elementId: fn.id,
      });
    }
  }

  // LA LogicalComponent → should be realized by at least one PA PhysicalComponent
  const laComponents = elements.filter(
    (el) => el.kind === "LogicalComponent" && diagramMap.get(el.diagramId)?.view === "LA"
  );
  const realizedByLa = new Set(
    elements
      .filter((el) => diagramMap.get(el.diagramId)?.view === "PA")
      .flatMap((el) => el.realizationIds)
  );
  for (const comp of laComponents) {
    if (!realizedByLa.has(comp.id)) {
      results.push({
        ruleId: "CROSS_VIEW_COVERAGE", severity: "warning",
        message: `LogicalComponent «${comp.name}» توسط هیچ PhysicalComponent محقق نشده (LA→PA).`,
        elementId: comp.id,
      });
    }
  }

  return results;
}

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export interface ValidateModelParams {
  diagrams: Diagram[];
  allElements: Element[];
  allConnections: Connection[];
}

export class ValidationEngine {
  /** Full model validation — returns all violations */
  static validateModel(params: ValidateModelParams): ValidationResult[] {
    const { allElements, allConnections, diagrams } = params;

    const elementsMap    = new Map(allElements.map((el) => [el.id, el]));
    const connectionsMap = new Map(allConnections.map((c) => [c.id, c]));
    const diagram        = diagrams[0];
    if (!diagram) return [];

    const ctx: ValidationContext = {
      diagram,
      allDiagrams: diagrams,
      allElements: elementsMap,
      allConnections: connectionsMap,
    };

    return [
      ...checkUniqueIds(allElements, allConnections),
      ...checkDanglingRealization(allElements),
      ...checkDefaultElementName(allElements),
      ...checkEmptyDiagram(diagrams),
      ...checkLeafFunctionExchangePort(ctx),
      ...checkFunctionComponentAssignment(ctx),
      ...checkInterfaceExchangeItem(ctx),
      ...checkPhysicalConnectionRealization(ctx),
      ...checkValidConnectionEndpoints(ctx),
      ...checkCrossViewCoverage(allElements, diagrams),
    ];
  }

  /**
   * Quick check used at draw-time: is a connection between two element kinds allowed?
   */
  static isConnectionAllowed(
    sourceKind: ElementKind,
    targetKind: ElementKind,
    connectionKind: ElementKind
  ): boolean {
    const rule = ALLOWED_CONNECTIONS[connectionKind];
    if (!rule) return true;
    return rule.sources.includes(sourceKind) && rule.targets.includes(targetKind);
  }
}
