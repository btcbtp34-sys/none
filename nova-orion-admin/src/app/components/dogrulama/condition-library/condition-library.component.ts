import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldDefinition, RuleDefinition } from '../dogrulama.model';
import {
  ACTION_TEMPLATES,
  ActionTemplate,
  FIELD_DEFINITIONS,
  MESSAGE_PARAMETERS,
  MESSAGE_TEMPLATES,
  OPERATOR_DEFINITIONS
} from '../dogrulama.data';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

type LibraryTab = 'conditions' | 'actions' | 'messages';

// Sol kolon: koşul alanları, operatörler, aksiyon tipleri ve mesaj şablonları (sürükle-bırak veya tıkla-ekle)
@Component({
  selector: 'app-condition-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './condition-library.component.html',
  styleUrls: ['../dogrulama.css', './condition-library.component.css']
})
export class ConditionLibraryComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  @Input({ required: true }) rule!: RuleDefinition;

  tab: LibraryTab = 'conditions';
  search = '';
  collapsed: Record<string, boolean> = {};

  readonly actionTemplates = ACTION_TEMPLATES;
  readonly messageParameters = MESSAGE_PARAMETERS;

  private matches(...texts: (string | undefined)[]): boolean {
    const q = this.search.trim().toLocaleLowerCase(this.tsService.currentLang());
    if (!q) return true;
    return texts.some(t => t && (t.toLocaleLowerCase(this.tsService.currentLang()).includes(q) ||
      this.tsService.translate(t).toLocaleLowerCase(this.tsService.currentLang()).includes(q)));
  }

  fields(category: 'product' | 'system'): FieldDefinition[] {
    return FIELD_DEFINITIONS.filter(f => f.category === category && this.matches(f.name, f.id, f.description));
  }

  get operators() {
    return OPERATOR_DEFINITIONS.filter(o => this.matches(o.label, o.symbol, o.description));
  }

  get templates(): ActionTemplate[] {
    return this.actionTemplates.filter(a => this.matches(a.label, a.description));
  }

  get messages() {
    return MESSAGE_TEMPLATES.filter(m => this.matches(m.title, m.text));
  }

  toggle(section: string) {
    this.collapsed[section] = !this.collapsed[section];
  }

  // Sürükle-bırak: veri tipine göre hedefler (koşul grubu, aksiyon bölümü, mesaj kutusu) kabul eder
  dragStart(event: DragEvent, type: 'field' | 'action' | 'message' | 'param', value: string) {
    event.dataTransfer?.setData(`application/x-ve-${type}`, value);
    event.dataTransfer?.setData('text/plain', value);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
  }

  addField(fieldId: string) {
    this.ruleService.addCondition(this.rule.id, this.rule.rootConditionGroup.id, fieldId);
  }

  addAction(template: ActionTemplate) {
    this.ruleService.addAction(this.rule.id, template.type);
  }

  // Tıklanan mesaj şablonu / parametre ilk aksiyona uygulanır
  applyMessage(text: string) {
    const first = this.rule.actions[0];
    if (!first) return;
    this.ruleService.updateAction(this.rule.id, first.id, { message: text });
    this.ruleService.toast(this.tsService.translate('Mesaj güncellendi'), this.tsService.translate('Mesaj şablonu ilk aksiyona uygulandı.'), 'info');
  }

  insertParam(key: string) {
    const first = this.rule.actions[0];
    if (!first) return;
    const message = `${this.tsService.translate(first.message || '')} {${key}}`.trim();
    this.ruleService.updateAction(this.rule.id, first.id, { message });
    this.ruleService.toast(this.tsService.translate('Parametre eklendi'), `{${key}} ` + this.tsService.translate('ilk aksiyonun mesajına eklendi.'), 'info');
  }
}
