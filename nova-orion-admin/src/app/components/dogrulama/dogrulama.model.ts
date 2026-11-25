// Doğrulama Motoru: kodsuz doğrulama kuralı veri modeli
// (koşul ağacı IF, aksiyonlar THEN; değerler dilden bağımsız anahtarlarla saklanır, ekranda çevrilir)

// Marka kodu (Sistem Yönetimi > Markalar) ya da her iki marka
export type RuleBrand = string | 'BOTH';

export type RuleStatus = 'Active' | 'Draft' | 'Inactive';

export type RuleCategory = 'sizingPiping' | 'capacityPower' | 'safetyCompliance' | 'systemArchitecture' | 'refrigerant' | 'general';

export type ValidationType = 'error' | 'warning' | 'info' | 'block';

export type OperatorType =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'in'
  | 'notIn'
  | 'between'
  | 'contains';

export type ValueDataType = 'text' | 'number' | 'select';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  id: string;
  name: string;
  category: 'product' | 'system';
  dataType: ValueDataType;
  unit?: string;
  options?: FieldOption[];
  description: string;
  defaultValue: string | number;
  // Sistem konfigürasyonundan gelen dinamik parametre (ör. limit)
  isParameter?: boolean;
}

export interface OperatorOption {
  value: OperatorType;
  label: string;
  symbol: string;
  description: string;
}

export type ConditionValue = string | number | string[];

export interface ConditionItem {
  id: string;
  type: 'condition';
  field: string;
  operator: OperatorType;
  value: ConditionValue;
  // between için üst sınır
  secondaryValue?: number;
  // literal: sabit değer, parameter: dinamik parametre adı (ör. limit)
  valueType: 'literal' | 'parameter';
  unit?: string;
}

export interface ConditionGroup {
  id: string;
  type: 'group';
  name?: string;
  operator: 'AND' | 'OR';
  isCollapsed?: boolean;
  children: ConditionNode[];
}

export type ConditionNode = ConditionGroup | ConditionItem;

export type ActionType = 'giveError' | 'giveWarning' | 'giveInfo' | 'blockSelection' | 'setFieldValue' | 'showMessage';

export interface RuleAction {
  id: string;
  type: ActionType;
  title: string;
  message: string;
  code?: string;
  targetField?: string;
  targetValue?: string;
  blockTarget?: string;
}

export interface ExecutionStats {
  testCount: number;
  passCount: number;
  failCount: number;
  lastTestedAt?: string;
}

export interface RuleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  brand: RuleBrand;
  category: RuleCategory;
  validationType: ValidationType;
  status: RuleStatus;
  priority: number; // 1-100
  version: string;
  lastModified: string; // ISO
  author: string;
  stopOnFirstFail: boolean;
  validFrom?: string;
  validTo?: string;
  applicableChannels: string[];
  rootConditionGroup: ConditionGroup;
  actions: RuleAction[];
  executionStats: ExecutionStats;
}

export type SimulationContext = Record<string, string | number>;

export interface EvaluationNode {
  id: string;
  type: 'condition' | 'group';
  isSatisfied: boolean;
  operator?: string;
  actualValue?: string | number;
  explanation: string;
  children?: EvaluationNode[];
}

export interface SimulationResult {
  matched: boolean;
  evaluatedAt: string;
  rootResult: EvaluationNode;
  triggeredActions: RuleAction[];
  executionTimeMs: number;
}

export interface TestPreset {
  id: string;
  name: string;
  targetRuleId: string;
  description: string;
  context: SimulationContext;
}
