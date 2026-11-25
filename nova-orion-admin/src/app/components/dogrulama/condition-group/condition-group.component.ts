import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConditionGroup, ConditionItem, ConditionNode } from '../dogrulama.model';
import { ConditionItemComponent } from '../condition-item/condition-item.component';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { TranslationService } from '../../../services/translation.service';

// İç içe VE / VEYA koşul grubu (kendini alt gruplar için tekrar çağırır)
@Component({
  selector: 'app-condition-group',
  standalone: true,
  imports: [CommonModule, FormsModule, ConditionItemComponent, ConditionGroupComponent],
  templateUrl: './condition-group.component.html',
  styleUrls: ['../dogrulama.css', './condition-group.component.css']
})
export class ConditionGroupComponent {
  ruleService = inject(ValidationRuleService);
  tsService = inject(TranslationService);

  @Input({ required: true }) ruleId!: string;
  @Input({ required: true }) group!: ConditionGroup;
  @Input() depth = 0;
  @Input() isRoot = false;

  editingName = false;
  nameDraft = '';
  dragOver = false;

  get displayName(): string {
    return this.group.name
      ? this.tsService.translate(this.group.name)
      : this.tsService.translate(this.group.operator === 'AND' ? 'VE Grubu' : 'VEYA Grubu');
  }

  // Aynı alana bakan birden çok VEYA koşulu tek bir IN [...] koşuluna çevrilebilir
  get canConvertToIn(): boolean {
    const children = this.group.children;
    return this.group.operator === 'OR' && children.length > 1 &&
      children.every(c => c.type === 'condition' && c.field === (children[0] as ConditionItem).field);
  }

  setOperator(operator: 'AND' | 'OR') {
    this.ruleService.updateGroup(this.ruleId, this.group.id, { operator });
  }

  toggleCollapse() {
    this.ruleService.updateGroup(this.ruleId, this.group.id, { isCollapsed: !this.group.isCollapsed });
  }

  startEditName() {
    this.nameDraft = this.displayName;
    this.editingName = true;
  }

  saveName() {
    this.editingName = false;
    const name = this.nameDraft.trim();
    if (name && name !== this.displayName) this.ruleService.updateGroup(this.ruleId, this.group.id, { name });
  }

  // Sol kütüphaneden sürüklenen alan bu gruba koşul olarak eklenir
  onDragOver(event: DragEvent) {
    if (!event.dataTransfer?.types.includes('application/x-ve-field')) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDrop(event: DragEvent) {
    const fieldId = event.dataTransfer?.getData('application/x-ve-field');
    this.dragOver = false;
    if (!fieldId) return;
    event.preventDefault();
    event.stopPropagation();
    this.ruleService.addCondition(this.ruleId, this.group.id, fieldId);
  }

  asGroup(node: ConditionNode): ConditionGroup {
    return node as ConditionGroup;
  }

  asItem(node: ConditionNode): ConditionItem {
    return node as ConditionItem;
  }

  trackId = (_: number, node: ConditionNode) => node.id;
}
