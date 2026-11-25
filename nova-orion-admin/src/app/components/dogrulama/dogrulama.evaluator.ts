import {
  ConditionGroup,
  ConditionItem,
  EvaluationNode,
  RuleAction,
  RuleDefinition,
  SimulationContext,
  SimulationResult
} from './dogrulama.model';
import { getFieldDef, getOperatorDef } from './dogrulama.data';

// Çeviri fonksiyonu: Türkçe anahtarı seçili dile çevirir ({x} yer tutucuları korunur)
export type Translate = (key: string) => string;

const fill = (text: string, values: Record<string, string | number>) =>
  Object.keys(values).reduce((acc, k) => acc.split(`{${k}}`).join(String(values[k])), text);

const norm = (v: unknown) => String(v).trim().toLowerCase();

function listOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(norm);
  if (typeof value === 'string') return value.split(',').map(norm);
  return [norm(value)];
}

export function evaluateCondition(condition: ConditionItem, context: SimulationContext, t: Translate): EvaluationNode {
  const fieldDef = getFieldDef(condition.field);
  const fieldName = fieldDef ? t(fieldDef.name) : condition.field;
  const actualValue = context[condition.field];
  const unit = condition.unit || fieldDef?.unit || '';
  const unitText = unit ? ' ' + t(unit) : '';

  // Hedef değer: sabit değer ya da bağlamdaki dinamik parametre (ör. limit)
  let targetValue: unknown = condition.value;
  let targetDisplay = Array.isArray(condition.value) ? `[${condition.value.join(', ')}]` : String(condition.value);
  if (condition.valueType === 'parameter' && typeof condition.value === 'string' && condition.value in context) {
    targetValue = context[condition.value];
    targetDisplay = fill(t('{value} ({param} parametresi)'), { value: String(targetValue), param: condition.value });
  }

  if (actualValue === undefined || actualValue === null || actualValue === '') {
    return {
      id: condition.id,
      type: 'condition',
      isSatisfied: false,
      operator: condition.operator,
      explanation: fill(t('{field} değeri simülasyon girdilerinde bulunamadı.'), { field: fieldName })
    };
  }

  let ok = false;
  switch (condition.operator) {
    case 'equals':
      ok = typeof actualValue === 'number' ? actualValue === Number(targetValue) : norm(actualValue) === norm(targetValue);
      break;
    case 'notEquals':
      ok = typeof actualValue === 'number' ? actualValue !== Number(targetValue) : norm(actualValue) !== norm(targetValue);
      break;
    case 'greaterThan':
      ok = Number(actualValue) > Number(targetValue);
      break;
    case 'lessThan':
      ok = Number(actualValue) < Number(targetValue);
      break;
    case 'greaterThanOrEqual':
      ok = Number(actualValue) >= Number(targetValue);
      break;
    case 'lessThanOrEqual':
      ok = Number(actualValue) <= Number(targetValue);
      break;
    case 'in':
      ok = listOf(targetValue).includes(norm(actualValue));
      break;
    case 'notIn':
      ok = !listOf(targetValue).includes(norm(actualValue));
      break;
    case 'between': {
      const min = Number(targetValue);
      const max = Number(condition.secondaryValue ?? targetValue);
      ok = Number(actualValue) >= min && Number(actualValue) <= max;
      targetDisplay = `[${min} - ${max}]`;
      break;
    }
    case 'contains':
      ok = norm(actualValue).includes(norm(targetValue));
      break;
  }

  const symbol = getOperatorDef(condition.operator)?.symbol ?? condition.operator;
  const statement = `${fieldName}: "${actualValue}${unitText}" ${symbol} "${targetDisplay}${unitText}"`;
  return {
    id: condition.id,
    type: 'condition',
    isSatisfied: ok,
    operator: condition.operator,
    actualValue,
    explanation: `${ok ? '✓' : '✗'} ${statement} (${t(ok ? 'Koşul sağlandı' : 'Koşul sağlanmadı')})`
  };
}

export function evaluateGroup(group: ConditionGroup, context: SimulationContext, t: Translate): EvaluationNode {
  const groupName = group.name ? t(group.name) : t(group.operator === 'AND' ? 'VE Grubu' : 'VEYA Grubu');

  if (group.children.length === 0) {
    return {
      id: group.id,
      type: 'group',
      isSatisfied: true,
      operator: group.operator,
      explanation: fill(t('{group}: Grupta koşul yok (varsayılan olarak sağlandı).'), { group: groupName }),
      children: []
    };
  }

  const children = group.children.map(child =>
    child.type === 'group' ? evaluateGroup(child, context, t) : evaluateCondition(child, context, t)
  );
  const satisfied = children.filter(c => c.isSatisfied).length;
  const ok = group.operator === 'AND' ? satisfied === children.length : satisfied > 0;
  const counts = { group: groupName, satisfied, total: children.length };

  return {
    id: group.id,
    type: 'group',
    isSatisfied: ok,
    operator: group.operator,
    explanation: ok
      ? '✓ ' + fill(t('{group}: {satisfied}/{total} alt koşul sağlandı (grup başarılı)'), counts)
      : '✗ ' + fill(t(group.operator === 'AND'
          ? '{group}: {satisfied}/{total} alt koşul sağlandı (tüm koşullar sağlanmalı)'
          : '{group}: {satisfied}/{total} alt koşul sağlandı (en az biri sağlanmalı)'), counts),
    children
  };
}

// Mesajdaki {anahtar} yer tutucularını simülasyon değerleriyle doldurur
export function interpolateMessage(message: string, context: SimulationContext): string {
  return fill(message, context);
}

export function evaluateRule(rule: RuleDefinition, context: SimulationContext, t: Translate, locale: string): SimulationResult {
  const start = performance.now();
  const rootResult = evaluateGroup(rule.rootConditionGroup, context, t);
  const triggeredActions: RuleAction[] = rootResult.isSatisfied
    ? rule.actions.map(a => ({ ...a, title: t(a.title), message: interpolateMessage(t(a.message), context) }))
    : [];
  return {
    matched: rootResult.isSatisfied,
    evaluatedAt: new Date().toLocaleTimeString(locale),
    rootResult,
    triggeredActions,
    executionTimeMs: Number((performance.now() - start).toFixed(2))
  };
}
