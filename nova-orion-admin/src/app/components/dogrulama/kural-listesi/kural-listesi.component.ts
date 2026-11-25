import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RuleDefinition, RuleStatus } from '../dogrulama.model';
import { CATEGORY_LABELS, STATUS_LABELS, VALIDATION_TYPE_LABELS } from '../dogrulama.data';
import { VeToastsComponent } from '../ve-toasts/ve-toasts.component';
import { ValidationRuleService } from '../../../services/validation-rule.service';
import { BrandService } from '../../../services/brand.service';
import { AuthService } from '../../../services/auth.service';
import { PageTitleService } from '../../../services/page-title.service';
import { TranslationService } from '../../../services/translation.service';

type SortField = 'id' | 'name' | 'brand' | 'validationType' | 'priority' | 'status' | 'lastModified';

const PAGE_SIZE = 8;

// Doğrulama Motoru > Doğrulama Kuralları: arama, filtre, sıralama ve kural işlemleri
@Component({
  selector: 'app-kural-listesi',
  standalone: true,
  imports: [CommonModule, FormsModule, VeToastsComponent],
  templateUrl: './kural-listesi.component.html',
  styleUrls: ['../../proje-tipleri/proje-tipleri.component.css', '../dogrulama.css', './kural-listesi.component.css']
})
export class KuralListesiComponent implements OnInit {
  ruleService = inject(ValidationRuleService);
  brandService = inject(BrandService);
  authService = inject(AuthService);
  router = inject(Router);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  readonly statusLabels = STATUS_LABELS;
  readonly typeLabels = VALIDATION_TYPE_LABELS;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly statuses: RuleStatus[] = ['Active', 'Draft', 'Inactive'];

  search = '';
  brandFilter = 'ALL';
  statusFilter = 'ALL';
  sortField: SortField = 'priority';
  sortDesc = true;
  page = 1;

  // Yeni kural penceresi
  showNewRule = false;
  newName = '';
  newCode = '';
  newDescription = '';
  newBrand = '';
  newValidFrom = '';
  newValidTo = '';
  codeTouched = false;

  ngOnInit() {
    this.pageTitleService.setPage('Doğrulama Kuralları', 'Nova ve Orion için kodsuz doğrulama kuralları, koşul ağaçları ve aksiyonlar');
  }

  get rules(): RuleDefinition[] {
    return this.ruleService.visibleRules();
  }

  // Marka filtresi seçenekleri: rol kapsamındaki markalar ve ortak kurallar
  get brandOptions(): { code: string; name: string }[] {
    const scope = this.authService.brandScope();
    return this.brandService.brands()
      .filter(b => !scope || scope.includes(b.id))
      .map(b => ({ code: b.code, name: b.name }));
  }

  get kpis(): { label: string; value: number; tone: string }[] {
    return [
      { label: 'Toplam kural', value: this.rules.length, tone: 'neutral' },
      { label: 'Aktif kural', value: this.rules.filter(r => r.status === 'Active').length, tone: 'good' },
      ...this.brandOptions.map(b => ({
        label: this.tsService.translate('{brand} kuralları').replace('{brand}', b.name),
        value: this.rules.filter(r => r.brand === b.code || r.brand === 'BOTH').length,
        tone: 'brand'
      }))
    ];
  }

  get filtered(): RuleDefinition[] {
    const q = this.search.trim().toLocaleLowerCase(this.tsService.currentLang());
    const t = (k: string) => this.tsService.translate(k).toLocaleLowerCase(this.tsService.currentLang());
    const list = this.rules.filter(r => {
      if (this.brandFilter === 'BOTH' && r.brand !== 'BOTH') return false;
      if (this.brandFilter !== 'ALL' && this.brandFilter !== 'BOTH' && r.brand !== this.brandFilter && r.brand !== 'BOTH') return false;
      if (this.statusFilter !== 'ALL' && r.status !== this.statusFilter) return false;
      if (!q) return true;
      return [r.id, r.code, t(r.name), t(r.description), t(CATEGORY_LABELS[r.category])]
        .some(v => v.toLocaleLowerCase(this.tsService.currentLang()).includes(q));
    });
    const dir = this.sortDesc ? -1 : 1;
    return [...list].sort((a, b) => {
      const av = a[this.sortField];
      const bv = b[this.sortField];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), this.tsService.currentLang()) * dir;
    });
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filtered.length / PAGE_SIZE));
  }

  get currentPage(): number {
    return Math.min(this.page, this.pageCount);
  }

  get paged(): RuleDefinition[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filtered.slice(start, start + PAGE_SIZE);
  }

  get hasFilters(): boolean {
    return !!this.search || this.brandFilter !== 'ALL' || this.statusFilter !== 'ALL';
  }

  clearFilters() {
    this.search = '';
    this.brandFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.page = 1;
  }

  sortBy(field: SortField) {
    if (this.sortField === field) this.sortDesc = !this.sortDesc;
    else {
      this.sortField = field;
      this.sortDesc = true;
    }
  }

  brandClass(brand: string): string {
    return brand === 'BOTH' ? 'badge-both' : brand === 'NOVA' ? 'badge-nova' : brand === 'ORION' ? 'badge-orion' : 'badge-brand';
  }

  priorityClass(p: number): string {
    return p >= 85 ? 'high' : p >= 70 ? 'mid' : 'low';
  }

  formatDate(iso: string): string {
    const locale = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', fr: 'fr-FR' }[this.tsService.currentLang()] ?? 'en-GB';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
  }

  open(rule: RuleDefinition) {
    this.router.navigate(['/dogrulama-motoru', rule.id]);
  }

  duplicate(rule: RuleDefinition) {
    const id = this.ruleService.duplicateRule(rule.id);
    if (id) this.router.navigate(['/dogrulama-motoru', id]);
  }

  remove(rule: RuleDefinition) {
    const msg = this.tsService.translate('"{name}" kuralını silmek istediğinize emin misiniz?').replace('{name}', this.tsService.translate(rule.name));
    if (confirm(msg)) this.ruleService.deleteRule(rule.id);
  }

  resetDefaults() {
    if (confirm(this.tsService.translate('Tüm kurallar silinip örnek kurallar yeniden yüklenecek. Devam edilsin mi?'))) {
      this.ruleService.resetToDefaults();
    }
  }

  // ---------- Yeni kural ----------

  openNewRule() {
    this.newName = '';
    this.newCode = '';
    this.newDescription = '';
    this.newBrand = this.brandOptions.length === 1 ? this.brandOptions[0].code : 'NOVA';
    this.newValidFrom = new Date().toISOString().slice(0, 10);
    this.newValidTo = '';
    this.codeTouched = false;
    this.showNewRule = true;
  }

  // Kural kodu, kullanıcı elle değiştirmediyse addan türetilir
  onNameChange(name: string) {
    this.newName = name;
    if (!this.codeTouched) {
      const ascii = name.toLocaleUpperCase('tr-TR')
        .replace(/Ç/g, 'C').replace(/Ğ/g, 'G').replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ş/g, 'S').replace(/Ü/g, 'U');
      this.newCode = name ? 'VAL_' + ascii.replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) : '';
    }
  }

  createRule() {
    if (!this.newName.trim()) return;
    const id = this.ruleService.createRule({
      name: this.newName.trim(),
      code: this.newCode.trim(),
      description: this.newDescription.trim(),
      brand: this.newBrand,
      validFrom: this.newValidFrom || undefined,
      validTo: this.newValidTo || undefined
    });
    this.showNewRule = false;
    this.router.navigate(['/dogrulama-motoru', id]);
  }

  // Getter'lar her kontrol turunda yeni dizi ürettiği için listeler anahtarla izlenir
  trackId = (_: number, r: RuleDefinition) => r.id;
  trackCode = (_: number, b: { code: string }) => b.code;
  trackLabel = (_: number, k: { label: string }) => k.label;
}
