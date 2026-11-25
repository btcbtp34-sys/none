import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActionType,
  ConditionGroup,
  ConditionItem,
  ConditionNode,
  FieldOption,
  RuleAction,
  RuleDefinition,
  SimulationContext
} from '../components/dogrulama/dogrulama.model';
import {
  ACTION_TEMPLATES,
  DEFAULT_SIMULATION_CONTEXT,
  INITIAL_RULES,
  TEST_PRESETS,
  getFieldDef
} from '../components/dogrulama/dogrulama.data';
import { AuthService } from './auth.service';
import { BrandService } from './brand.service';
import { TranslationService } from './translation.service';

export interface VeToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const STORAGE_KEY = 'nova_orion_validation_rules_v1';

const uid = (prefix: string) => prefix + Math.random().toString(36).substring(2, 8);

// Grup ağacında her grubu dönüştürür (alt gruplar dahil)
function mapGroups(group: ConditionGroup, fn: (g: ConditionGroup) => ConditionGroup): ConditionGroup {
  const updated = fn(group);
  return { ...updated, children: updated.children.map(c => (c.type === 'group' ? mapGroups(c, fn) : c)) };
}

function cloneWithNewIds<T extends ConditionNode>(node: T): T {
  const copy = JSON.parse(JSON.stringify(node)) as ConditionNode;
  const assign = (n: ConditionNode) => {
    n.id = uid(n.type === 'group' ? 'grp_' : 'c_');
    if (n.type === 'group') n.children.forEach(assign);
  };
  assign(copy);
  return copy as T;
}

// Doğrulama Motoru: kurallar, koşul ağacı işlemleri, simülasyon girdileri ve bildirimler
@Injectable({
  providedIn: 'root'
})
export class ValidationRuleService {
  private authService = inject(AuthService);
  private brandService = inject(BrandService);
  private tsService = inject(TranslationService);

  private rulesList = signal<RuleDefinition[]>(this.load());
  rules = this.rulesList.asReadonly();

  // Business Admin yalnızca kendi markasının ve ortak (her iki marka) kuralları görür
  visibleRules = computed(() => {
    const scope = this.authService.brandScope();
    if (!scope) return this.rulesList();
    const codes = this.brandService.brands().filter(b => scope.includes(b.id)).map(b => b.code);
    return this.rulesList().filter(r => r.brand === 'BOTH' || codes.includes(r.brand));
  });

  simulationContext = signal<SimulationContext>({ ...DEFAULT_SIMULATION_CONTEXT });
  autoSimulate = signal(true);
  activePresetId = signal(TEST_PRESETS[0].id);

  toasts = signal<VeToast[]>([]);

  private load(): RuleDefinition[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return JSON.parse(JSON.stringify(INITIAL_RULES));
  }

  private commit(rules: RuleDefinition[]) {
    this.rulesList.set(rules);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch {}
  }

  // ---------- Bildirimler ----------

  toast(title: string, message: string, type: VeToast['type'] = 'info') {
    const id = uid('t_');
    this.toasts.update(list => [...list, { id, title, message, type }]);
    setTimeout(() => this.dismissToast(id), 4500);
  }

  dismissToast(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private t(key: string): string {
    return this.tsService.translate(key);
  }

  private fill(key: string, values: Record<string, string>): string {
    return Object.keys(values).reduce((acc, k) => acc.split(`{${k}}`).join(values[k]), this.t(key));
  }

  // ---------- Yardımcılar ----------

  getRule(id: string | null): RuleDefinition | undefined {
    return this.visibleRules().find(r => r.id === id);
  }

  brandLabel(brand: string): string {
    if (brand === 'BOTH') return this.t('Her iki marka');
    return this.brandService.brands().find(b => b.code === brand)?.name ?? brand;
  }

  // Marka alanının seçenekleri Markalar sayfasından gelir
  fieldOptions(fieldId: string): FieldOption[] {
    if (fieldId === 'brand') {
      return this.brandService.brands().map(b => ({ label: b.name, value: b.code }));
    }
    return getFieldDef(fieldId)?.options ?? [];
  }

  // Koşul ve simülasyonda gösterilecek değer etiketi
  valueLabel(fieldId: string, value: unknown): string {
    const option = this.fieldOptions(fieldId).find(o => o.value === value);
    return option ? this.t(option.label) : String(value ?? '');
  }

  private nextId(): string {
    const max = this.rulesList().reduce((m, r) => Math.max(m, Number(r.id.replace(/\D/g, '')) || 0), 0);
    return 'RULE-VAL-' + String(max + 1).padStart(3, '0');
  }

  private touch(rule: RuleDefinition, patch: Partial<RuleDefinition>): RuleDefinition {
    return { ...rule, ...patch, lastModified: new Date().toISOString() };
  }

  updateRule(id: string, patch: Partial<RuleDefinition>) {
    this.commit(this.rulesList().map(r => (r.id === id ? this.touch(r, patch) : r)));
  }

  // ---------- Kural işlemleri ----------

  createRule(data: Partial<RuleDefinition>): string {
    const id = this.nextId();
    const scope = this.authService.brandScope();
    const ownBrand = scope?.length === 1 ? this.brandService.brands().find(b => b.id === scope[0])?.code : undefined;
    const brand = data.brand ?? ownBrand ?? 'NOVA';
    const rule: RuleDefinition = {
      id,
      code: data.code || 'VAL_CUSTOM_' + Math.floor(Math.random() * 1000),
      name: data.name || this.t('Yeni Doğrulama Kuralı'),
      description: data.description ?? '',
      brand,
      category: data.category ?? 'general',
      validationType: data.validationType ?? 'error',
      status: 'Draft',
      priority: data.priority ?? 50,
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      author: this.authService.currentUser().name,
      stopOnFirstFail: false,
      validFrom: data.validFrom,
      validTo: data.validTo,
      applicableChannels: ['b2bPortal'],
      rootConditionGroup: {
        id: uid('grp_root_'),
        type: 'group',
        name: 'Ana Koşul Grubu',
        operator: 'AND',
        children: [
          { id: uid('c_'), type: 'condition', field: 'brand', operator: 'equals', value: brand === 'BOTH' ? 'NOVA' : brand, valueType: 'literal' }
        ]
      },
      actions: [
        { id: uid('act_'), type: 'giveError', title: 'Doğrulama Hatası', message: 'Belirlenen kural koşulları karşılanmadı.', code: 'ERR_CUSTOM_VAL' }
      ],
      executionStats: { testCount: 0, passCount: 0, failCount: 0 }
    };
    this.commit([rule, ...this.rulesList()]);
    this.toast(this.t('Yeni kural oluşturuldu'), this.fill('"{name}" eklendi.', { name: rule.name }), 'success');
    return id;
  }

  duplicateRule(id: string): string | null {
    const source = this.rulesList().find(r => r.id === id);
    if (!source) return null;
    const newId = this.nextId();
    const copy: RuleDefinition = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      code: `${source.code}_COPY`,
      name: `${this.t(source.name)} (${this.t('Kopya')})`,
      status: 'Draft',
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      executionStats: { testCount: 0, passCount: 0, failCount: 0 }
    };
    this.commit([copy, ...this.rulesList()]);
    this.toast(this.t('Kural kopyalandı'), this.fill('"{name}" oluşturuldu.', { name: copy.name }), 'info');
    return newId;
  }

  deleteRule(id: string) {
    this.commit(this.rulesList().filter(r => r.id !== id));
    this.toast(this.t('Kural silindi'), this.t('Kural kaldırıldı.'), 'warning');
  }

  resetToDefaults() {
    this.commit(JSON.parse(JSON.stringify(INITIAL_RULES)));
    this.toast(this.t('Sıfırlandı'), this.t('Varsayılan örnek kurallar yüklendi.'), 'info');
  }

  saveRule(id: string) {
    const rule = this.rulesList().find(r => r.id === id);
    if (!rule) return;
    this.updateRule(id, {});
    this.toast(this.t('Kural kaydedildi'), this.fill('"{name}" güncellendi.', { name: this.t(rule.name) }), 'success');
  }

  // ---------- Koşul ağacı ----------

  private updateTree(ruleId: string, fn: (root: ConditionGroup) => ConditionGroup) {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (rule) this.updateRule(ruleId, { rootConditionGroup: fn(rule.rootConditionGroup) });
  }

  private newCondition(fieldId = 'brand'): ConditionItem {
    const def = getFieldDef(fieldId);
    return {
      id: uid('c_'),
      type: 'condition',
      field: fieldId,
      operator: 'equals',
      value: def?.defaultValue ?? '',
      valueType: def?.isParameter ? 'parameter' : 'literal',
      unit: def?.unit
    };
  }

  addCondition(ruleId: string, groupId: string, fieldId?: string) {
    const condition = this.newCondition(fieldId);
    this.updateTree(ruleId, root => mapGroups(root, g => (g.id === groupId ? { ...g, isCollapsed: false, children: [...g.children, condition] } : g)));
    const def = getFieldDef(condition.field);
    this.toast(this.t('Koşul eklendi'), this.fill('"{field}" koşulu gruba eklendi.', { field: def ? this.t(def.name) : condition.field }), 'info');
  }

  addGroup(ruleId: string, groupId: string) {
    const group: ConditionGroup = {
      id: uid('grp_'),
      type: 'group',
      name: 'Alt Koşul Grubu',
      operator: 'AND',
      children: [this.newCondition('productFamily')]
    };
    this.updateTree(ruleId, root => mapGroups(root, g => (g.id === groupId ? { ...g, isCollapsed: false, children: [...g.children, group] } : g)));
    this.toast(this.t('Koşul grubu eklendi'), this.t('İç içe yeni bir mantıksal grup oluşturuldu.'), 'info');
  }

  updateCondition(ruleId: string, conditionId: string, patch: Partial<ConditionItem>) {
    const update = (group: ConditionGroup): ConditionGroup => ({
      ...group,
      children: group.children.map(c => {
        if (c.type === 'group') return update(c);
        return c.id === conditionId ? { ...c, ...patch } : c;
      })
    });
    this.updateTree(ruleId, update);
  }

  updateGroup(ruleId: string, groupId: string, patch: Partial<ConditionGroup>) {
    this.updateTree(ruleId, root => mapGroups(root, g => (g.id === groupId ? { ...g, ...patch } : g)));
  }

  setAllCollapsed(ruleId: string, collapsed: boolean) {
    this.updateTree(ruleId, root => mapGroups(root, g => ({ ...g, isCollapsed: collapsed })));
  }

  deleteNode(ruleId: string, nodeId: string) {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (!rule || rule.rootConditionGroup.id === nodeId) return;
    const remove = (group: ConditionGroup): ConditionGroup => ({
      ...group,
      children: group.children.filter(c => c.id !== nodeId).map(c => (c.type === 'group' ? remove(c) : c))
    });
    this.updateTree(ruleId, remove);
    this.toast(this.t('Öğe silindi'), this.t('Seçilen koşul veya grup kaldırıldı.'), 'info');
  }

  duplicateNode(ruleId: string, nodeId: string) {
    const dup = (group: ConditionGroup): ConditionGroup => ({
      ...group,
      children: group.children.flatMap(c => {
        const self = c.type === 'group' ? dup(c) : c;
        return c.id === nodeId ? [self, cloneWithNewIds(c)] : [self];
      })
    });
    this.updateTree(ruleId, dup);
    this.toast(this.t('Öğe kopyalandı'), this.t('Kopyası hemen altına eklendi.'), 'info');
  }

  // Aynı alana bakan VEYA koşullarını tek bir IN [...] koşuluna çevirir
  convertOrToIn(ruleId: string, groupId: string) {
    this.updateTree(ruleId, root => mapGroups(root, g => {
      if (g.id !== groupId || g.operator !== 'OR') return g;
      const conditions = g.children.filter((c): c is ConditionItem => c.type === 'condition');
      if (!conditions.length || conditions.length !== g.children.length) return g;
      const merged: ConditionItem = {
        id: uid('c_in_'),
        type: 'condition',
        field: conditions[0].field,
        operator: 'in',
        value: conditions.map(c => String(c.value)),
        valueType: 'literal'
      };
      return { ...g, operator: 'AND', children: [merged] };
    }));
    this.toast(this.t('IN operatörüne dönüştürüldü'), this.t('Ayrı VEYA koşulları tek bir IN listesine çevrildi.'), 'success');
  }

  // ---------- Aksiyonlar ----------

  addAction(ruleId: string, type: ActionType = 'giveWarning') {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (!rule) return;
    const template = ACTION_TEMPLATES.find(a => a.type === type)!;
    const action: RuleAction = {
      id: uid('act_'),
      type,
      title: template.label,
      message: template.defaultMessage,
      code: 'ACT_' + Math.floor(Math.random() * 1000)
    };
    this.updateRule(ruleId, { actions: [...rule.actions, action] });
    this.toast(this.t('Aksiyon eklendi'), this.fill('"{action}" kurala eklendi.', { action: this.t(template.label) }), 'success');
  }

  updateAction(ruleId: string, actionId: string, patch: Partial<RuleAction>) {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (!rule) return;
    this.updateRule(ruleId, { actions: rule.actions.map(a => (a.id === actionId ? { ...a, ...patch } : a)) });
  }

  deleteAction(ruleId: string, actionId: string) {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (!rule) return;
    if (rule.actions.length <= 1) {
      this.toast(this.t('Uyarı'), this.t('Kuralda en az bir aksiyon tanımlı olmalıdır.'), 'warning');
      return;
    }
    this.updateRule(ruleId, { actions: rule.actions.filter(a => a.id !== actionId) });
    this.toast(this.t('Aksiyon silindi'), this.t('Aksiyon kaldırıldı.'), 'info');
  }

  // ---------- Simülasyon ----------

  setSimulationField(field: string, value: string | number) {
    this.simulationContext.update(ctx => ({ ...ctx, [field]: value }));
  }

  // Hazır senaryoyu uygular; senaryonun hedef kuralını döndürür
  applyPreset(presetId: string): string | null {
    const preset = TEST_PRESETS.find(p => p.id === presetId);
    if (!preset) return null;
    this.activePresetId.set(presetId);
    this.simulationContext.set({ ...preset.context });
    this.toast(this.t('Test senaryosu yüklendi'), this.fill('"{name}" girdileri uygulandı.', { name: this.t(preset.name) }), 'info');
    return preset.targetRuleId;
  }

  // Simülasyon sonucu kural istatistiklerine işlenir
  recordTest(ruleId: string, matched: boolean) {
    const rule = this.rulesList().find(r => r.id === ruleId);
    if (!rule) return;
    const s = rule.executionStats;
    this.commit(this.rulesList().map(r => r.id === ruleId ? {
      ...r,
      executionStats: {
        testCount: s.testCount + 1,
        passCount: s.passCount + (matched ? 0 : 1),
        failCount: s.failCount + (matched ? 1 : 0),
        lastTestedAt: new Date().toISOString()
      }
    } : r));
  }
}
