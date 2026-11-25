import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActionType, RuleAction, RuleDefinition } from '../dogrulama.model';
import { ACTION_TEMPLATES, ActionTemplate } from '../dogrulama.data';
import { interpolateMessage } from '../dogrulama.evaluator';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

// THEN bölümü: kural koşulları sağlandığında uygulanacak aksiyonlar
@Component({
  selector: 'app-action-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-builder.component.html',
  styleUrls: ['../dogrulama.css', './action-builder.component.css']
})
export class ActionBuilderComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  @Input({ required: true }) rule!: RuleDefinition;

  readonly templates = ACTION_TEMPLATES;
  readonly quickParams = ['limit', 'heightDifference', 'pipeLength', 'brand'];

  sectionDragOver = false;
  messageDragOver: string | null = null;

  template(type: ActionType): ActionTemplate {
    return this.templates.find(t => t.type === type) ?? this.templates[0];
  }

  update(action: RuleAction, patch: Partial<RuleAction>) {
    this.ruleService.updateAction(this.rule.id, action.id, patch);
  }

  // Tip değişince başlık, kullanıcı değiştirmediyse yeni tipin adını alır
  changeType(action: RuleAction, type: ActionType) {
    const oldLabel = this.template(action.type).label;
    const title = !action.title || action.title === oldLabel ? this.template(type).label : action.title;
    this.update(action, { type, title });
  }

  insertParam(action: RuleAction, key: string) {
    this.update(action, { message: `${this.tsService.translate(action.message || '')} {${key}}`.trim() });
  }

  preview(action: RuleAction): string {
    return interpolateMessage(this.tsService.translate(action.message || ''), this.ruleService.simulationContext());
  }

  // Sol panelden sürüklenen aksiyon tipi bölüme, mesaj şablonu / parametre mesaj kutusuna bırakılır
  onSectionDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('application/x-ve-action')) return;
    event.preventDefault();
    this.sectionDragOver = true;
  }

  onSectionDrop(event: DragEvent) {
    const type = event.dataTransfer?.getData('application/x-ve-action') as ActionType;
    this.sectionDragOver = false;
    if (!type) return;
    event.preventDefault();
    this.ruleService.addAction(this.rule.id, type);
  }

  onMessageDragOver(event: DragEvent, action: RuleAction) {
    const types = event.dataTransfer?.types ?? [];
    if (!types.includes('application/x-ve-message') && !types.includes('application/x-ve-param')) return;
    event.preventDefault();
    event.stopPropagation();
    this.messageDragOver = action.id;
  }

  onMessageDrop(event: DragEvent, action: RuleAction) {
    this.messageDragOver = null;
    const message = event.dataTransfer?.getData('application/x-ve-message');
    const param = event.dataTransfer?.getData('application/x-ve-param');
    if (!message && !param) return;
    event.preventDefault();
    event.stopPropagation();
    if (message) this.update(action, { message });
    else this.insertParam(action, param!);
  }

  trackId = (_: number, a: RuleAction) => a.id;
}
