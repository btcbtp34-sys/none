import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConditionItem, FieldOption, OperatorType } from '../dogrulama.model';
import { FIELD_DEFINITIONS, OPERATOR_DEFINITIONS, PARAMETER_OPTIONS, getFieldDef } from '../dogrulama.data';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

// Koşul satırı: alan, operatör ve değer (sabit değer, liste, aralık veya dinamik parametre)
@Component({
  selector: 'app-condition-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './condition-item.component.html',
  styleUrls: ['../dogrulama.css', './condition-item.component.css']
})
export class ConditionItemComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  @Input({ required: true }) ruleId!: string;
  @Input({ required: true }) condition!: ConditionItem;

  readonly productFields = FIELD_DEFINITIONS.filter(f => f.category === 'product');
  readonly systemFields = FIELD_DEFINITIONS.filter(f => f.category === 'system');
  readonly operators = OPERATOR_DEFINITIONS;
  readonly parameterOptions = PARAMETER_OPTIONS;

  get fieldDef() {
    return getFieldDef(this.condition.field);
  }

  get options(): FieldOption[] {
    return this.ruleService.fieldOptions(this.condition.field);
  }

  get isList(): boolean {
    return this.condition.operator === 'in' || this.condition.operator === 'notIn';
  }

  get selectedValues(): string[] {
    const v = this.condition.value;
    return Array.isArray(v) ? v : v !== '' && v !== undefined ? [String(v)] : [];
  }

  private update(patch: Partial<ConditionItem>) {
    this.ruleService.updateCondition(this.ruleId, this.condition.id, patch);
  }

  // Alan değişince değer, birim ve değer tipi yeni alana göre sıfırlanır
  changeField(fieldId: string) {
    const def = getFieldDef(fieldId);
    const initial = def?.defaultValue ?? '';
    this.update({
      field: fieldId,
      value: this.isList ? [String(initial)] : initial,
      valueType: def?.isParameter ? 'parameter' : 'literal',
      unit: def?.unit
    });
  }

  changeOperator(op: OperatorType) {
    let value = this.condition.value;
    if (op === 'in' || op === 'notIn') {
      value = Array.isArray(value) ? value : value !== '' ? [String(value)] : [];
      this.update({ operator: op, value });
      return;
    }
    if (Array.isArray(value)) value = value[0] ?? '';
    if (op === 'between') {
      const min = Number(value) || 0;
      this.update({ operator: op, value: min, secondaryValue: min + 10, valueType: 'literal' });
      return;
    }
    this.update({ operator: op, value });
  }

  setValue(value: string | number) {
    this.update({ value: this.fieldDef?.dataType === 'number' && this.condition.valueType === 'literal' ? Number(value) : value });
  }

  setSecondary(value: number) {
    this.update({ secondaryValue: Number(value) });
  }

  toggleListValue(value: string) {
    const current = this.selectedValues;
    this.update({ value: current.includes(value) ? current.filter(v => v !== value) : [...current, value] });
  }

  // Sabit değer ile dinamik parametre (ör. limit) arasında geçiş
  toggleValueType() {
    if (this.condition.valueType === 'parameter') {
      this.update({ valueType: 'literal', value: this.fieldDef?.defaultValue ?? 0 });
    } else {
      this.update({ valueType: 'parameter', value: PARAMETER_OPTIONS[0].value });
    }
  }

  trackValue = (_: number, o: FieldOption) => o.value;
}
