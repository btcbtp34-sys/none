import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConditionGroup, RuleCategory, RuleDefinition, RuleStatus, ValidationType } from '../dogrulama.model';
import { CATEGORY_LABELS, STATUS_LABELS, VALIDATION_TYPE_LABELS } from '../dogrulama.data';
import { ConditionLibraryComponent } from '../condition-library/condition-library.component';
import { ConditionGroupComponent } from '../condition-group/condition-group.component';
import { ActionBuilderComponent } from '../action-builder/action-builder.component';
import { VeToastsComponent } from '../ve-toasts/ve-toasts.component';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { BrandService } from '../../../services/brand.service';
import { AuthService } from '../../../services/auth.service';
import { PageTitleService } from '../../../services/page-title.service';
import { TranslationService } from '../../../services/translation.service';

type EditorTab = 'general' | 'conditions';

// Doğrulama Motoru > Kural editörü: genel bilgiler ve koşullar & aksiyonlar
@Component({
  selector: 'app-kural-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ConditionLibraryComponent,
    ConditionGroupComponent,
    ActionBuilderComponent,
    VeToastsComponent
  ],
  templateUrl: './kural-editor.component.html',
  styleUrls: ['../dogrulama.css', './kural-editor.component.css']
})
export class KuralEditorComponent implements OnInit {
  ruleService = inject(ValidationRuleService);
  brandService = inject(BrandService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  readonly tabs: { id: EditorTab; label: string }[] = [
    { id: 'general', label: '1. Genel Bilgiler' },
    { id: 'conditions', label: '2. Koşullar & Aksiyonlar' }
  ];
  readonly statuses: RuleStatus[] = ['Active', 'Draft', 'Inactive'];
  readonly statusLabels = STATUS_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as RuleCategory[];
  readonly categoryLabels = CATEGORY_LABELS;
  readonly validationTypes = Object.keys(VALIDATION_TYPE_LABELS) as ValidationType[];
  readonly typeLabels = VALIDATION_TYPE_LABELS;

  private ruleId = signal<string | null>(null);
  rule = computed(() => this.ruleService.getRule(this.ruleId()));

  tab: EditorTab = 'conditions';
  showJson = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.ruleId.set(params.get('id'));
      const rule = this.rule();
      this.pageTitleService.setPage(rule ? rule.name : 'Doğrulama Kuralları', 'Kural editörü');
    });
  }

  // Marka seçenekleri: Business Admin yalnızca kendi markasını seçebilir
  get brandOptions(): { code: string; name: string }[] {
    const scope = this.authService.brandScope();
    return this.brandService.brands().filter(b => !scope || scope.includes(b.id)).map(b => ({ code: b.code, name: b.name }));
  }

  update(patch: Partial<RuleDefinition>) {
    const rule = this.rule();
    if (rule) this.ruleService.updateRule(rule.id, patch);
  }

  brandClass(brand: string): string {
    return brand === 'BOTH' ? 'badge-both' : brand === 'NOVA' ? 'badge-nova' : brand === 'ORION' ? 'badge-orion' : 'badge-brand';
  }

  setTab(tab: EditorTab) {
    this.tab = tab;
  }

  save() {
    const rule = this.rule();
    if (rule) this.ruleService.saveRule(rule.id);
  }

  duplicate() {
    const rule = this.rule();
    const id = rule && this.ruleService.duplicateRule(rule.id);
    if (id) this.router.navigate(['/dogrulama-motoru', id]);
  }

  // ---------- JSON (AST) ----------

  // Şema, metin alanları seçili dile çevrilmiş olarak gösterilir/indirilir (yapı ve kodlar aynı kalır)
  get json(): string {
    const rule = this.rule();
    if (!rule) return '{}';
    const t = (v?: string) => (v ? this.tsService.translate(v) : v);
    const group = (g: ConditionGroup): ConditionGroup => ({
      ...g,
      name: t(g.name),
      children: g.children.map(c => (c.type === 'group' ? group(c) : c))
    });
    const view: RuleDefinition = {
      ...rule,
      name: t(rule.name)!,
      description: t(rule.description)!,
      author: t(rule.author)!,
      rootConditionGroup: group(rule.rootConditionGroup),
      actions: rule.actions.map(a => ({ ...a, title: t(a.title)!, message: t(a.message)! }))
    };
    return JSON.stringify(view, null, 2);
  }

  get jsonLineCount(): number {
    return this.json.split('\n').length;
  }

  copyJson() {
    navigator.clipboard?.writeText(this.json);
    this.ruleService.toast(this.tsService.translate('JSON kopyalandı'), this.tsService.translate('Kural şeması panoya kopyalandı.'), 'success');
  }

  downloadJson() {
    const rule = this.rule();
    if (!rule) return;
    const blob = new Blob([this.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rule.code || 'rule'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  trackCode = (_: number, b: { code: string }) => b.code;
}
