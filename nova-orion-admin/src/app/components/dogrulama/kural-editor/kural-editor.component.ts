import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConditionGroup, RuleCategory, RuleDefinition, RuleStatus, ValidationType } from '../dogrulama.model';
import { CATEGORY_LABELS, CHANNELS, STATUS_LABELS, VALIDATION_TYPE_LABELS } from '../dogrulama.data';
import { ConditionLibraryComponent } from '../condition-library/condition-library.component';
import { ConditionGroupComponent } from '../condition-group/condition-group.component';
import { ActionBuilderComponent } from '../action-builder/action-builder.component';
import { SimulationPanelComponent } from '../simulation-panel/simulation-panel.component';
import { VeToastsComponent } from '../ve-toasts/ve-toasts.component';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { BrandService } from '../../../services/brand.service';
import { AuthService } from '../../../services/auth.service';
import { PageTitleService } from '../../../services/page-title.service';
import { TranslationService } from '../../../services/translation.service';

type EditorTab = 'general' | 'conditions' | 'scope' | 'management';

// Doğrulama Motoru > Kural editörü: genel bilgiler, koşullar & aksiyonlar, öncelik & kapsam, yönetim & denetim
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
    SimulationPanelComponent,
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
    { id: 'conditions', label: '2. Koşullar & Aksiyonlar' },
    { id: 'scope', label: '3. Öncelik & Kapsam' },
    { id: 'management', label: '4. Yönetim & Denetim' }
  ];
  readonly statuses: RuleStatus[] = ['Active', 'Draft', 'Inactive'];
  readonly statusLabels = STATUS_LABELS;
  readonly categories = Object.keys(CATEGORY_LABELS) as RuleCategory[];
  readonly categoryLabels = CATEGORY_LABELS;
  readonly validationTypes = Object.keys(VALIDATION_TYPE_LABELS) as ValidationType[];
  readonly typeLabels = VALIDATION_TYPE_LABELS;
  readonly channels = CHANNELS;

  private ruleId = signal<string | null>(null);
  rule = computed(() => this.ruleService.getRule(this.ruleId()));

  tab: EditorTab = 'conditions';
  simOpen = true;
  showJson = false;
  jsonDraft = '';
  jsonError = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.ruleId.set(params.get('id'));
      this.jsonDraft = '';
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
    if (tab === 'management') this.jsonDraft = this.json;
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

  // Simülasyondaki senaryo başka bir kurala aitse o kurala geçilir
  openRule(id: string) {
    this.router.navigate(['/dogrulama-motoru', id]);
  }

  toggleChannel(key: string) {
    const rule = this.rule();
    if (!rule) return;
    const list = rule.applicableChannels.includes(key)
      ? rule.applicableChannels.filter(c => c !== key)
      : [...rule.applicableChannels, key];
    this.update({ applicableChannels: list });
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

  // JSON'dan güncelleme: kimlik korunur, geri kalan alanlar şemadan alınır
  applyJson() {
    const rule = this.rule();
    if (!rule) return;
    try {
      const parsed = JSON.parse(this.jsonDraft) as Partial<RuleDefinition>;
      if (!parsed || typeof parsed !== 'object' || !parsed.rootConditionGroup || !Array.isArray(parsed.actions)) {
        throw new Error(this.tsService.translate('Şemada koşul ağacı (rootConditionGroup) ve aksiyonlar (actions) bulunmalıdır.'));
      }
      this.jsonError = '';
      this.ruleService.updateRule(rule.id, { ...parsed, id: rule.id });
      this.ruleService.toast(this.tsService.translate('JSON uygulandı'), this.tsService.translate('Kural JSON şemasından güncellendi.'), 'success');
    } catch (e) {
      this.jsonError = (e as Error).message;
    }
  }

  // ---------- İstatistik ----------

  get passRate(): number {
    const s = this.rule()?.executionStats;
    return s && s.testCount ? Math.round((s.passCount / s.testCount) * 100) : 100;
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const locale = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', fr: 'fr-FR' }[this.tsService.currentLang()] ?? 'en-GB';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
  }

  trackCode = (_: number, b: { code: string }) => b.code;
}
