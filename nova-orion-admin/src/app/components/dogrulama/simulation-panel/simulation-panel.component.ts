import { Component, EventEmitter, Input, Output, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationNode, FieldDefinition, FieldOption, RuleDefinition, SimulationResult } from '../dogrulama.model';
import { TEST_PRESETS, getFieldDef } from '../dogrulama.data';
import { evaluateRule } from '../dogrulama.evaluator';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

// Simülasyonda girdi olarak gösterilen alanlar
const SIMULATION_FIELDS = [
  'brand', 'productFamily', 'climateSystem', 'oduPosition', 'refrigerantType',
  'capacity', 'distanceBetweenIdu', 'heightDifference', 'pipeLength', 'limit'
];

// Kural testi: hazır senaryolar, girdiler, eşleşme sonucu, tetiklenen aksiyonlar ve mantık ağacı
@Component({
  selector: 'app-simulation-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simulation-panel.component.html',
  styleUrls: ['../dogrulama.css', './simulation-panel.component.css']
})
export class SimulationPanelComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  rule = input.required<RuleDefinition>();
  @Input() wide = false;
  @Input() closable = true;
  @Output() closed = new EventEmitter<void>();
  // Seçilen senaryo başka bir kurala aitse o kurala geçilir
  @Output() ruleRequested = new EventEmitter<string>();

  readonly presets = TEST_PRESETS;
  readonly fields: FieldDefinition[] = SIMULATION_FIELDS.map(id => getFieldDef(id)!).filter(Boolean);

  treeOpen = true;
  private manualResult = signal<SimulationResult | null>(null);

  // Canlı modda kural veya girdi değiştikçe sonuç yeniden hesaplanır
  result = computed<SimulationResult | null>(() => {
    if (!this.ruleService.autoSimulate()) return this.manualResult();
    this.tsService.currentLang();
    return this.evaluate();
  });

  private evaluate(): SimulationResult {
    return evaluateRule(this.rule(), this.ruleService.simulationContext(), k => this.tsService.translate(k), this.locale);
  }

  get locale(): string {
    return { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', fr: 'fr-FR' }[this.tsService.currentLang()] ?? 'en-GB';
  }

  get activePreset() {
    return this.presets.find(p => p.id === this.ruleService.activePresetId());
  }

  options(field: FieldDefinition): FieldOption[] {
    return this.ruleService.fieldOptions(field.id);
  }

  value(fieldId: string) {
    return this.ruleService.simulationContext()[fieldId];
  }

  setValue(field: FieldDefinition, value: string | number) {
    this.ruleService.setSimulationField(field.id, field.dataType === 'number' ? Number(value) : value);
  }

  selectPreset(id: string) {
    const target = this.ruleService.applyPreset(id);
    if (target && target !== this.rule().id) this.ruleRequested.emit(target);
  }

  // Elle çalıştırılan test, kuralın test istatistiklerine işlenir
  run() {
    const result = this.evaluate();
    this.manualResult.set(result);
    this.ruleService.recordTest(this.rule().id, result.matched);
  }

  // Ağaçta durum ikonla gösterildiği için açıklamanın başındaki işaret atılır
  stripMark(text: string): string {
    return text.replace(/^[✓✗] /, '');
  }

  trackValue = (_: number, o: FieldOption) => o.value;
  trackNode = (_: number, n: EvaluationNode) => n.id;
}
