import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  ReportService,
  ReportProject,
  ReportDimension,
  ReportFilters,
  ReportPeriodMode,
  DASHBOARD_DIMENSIONS,
  CONTROLLERS_PER_IDU_TARGET,
  CENTRAL_CONTROLLER_TARGET,
  GROUP_IDU,
  STATUS_LABELS
} from '../../services/report.service';
import { BrandService } from '../../services/brand.service';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

interface Kpi {
  label: string;
  value: string;
  note: string;
  tone: 'neutral' | 'good' | 'bad';
}

interface BarRow {
  key: string;
  label: string;
  value: number;
  display: string;
  share: number; // en büyük değere oranı (0–1)
}

interface SplitBar {
  title: string;
  parts: { label: string; percent: number; color: string }[];
}

interface ActionItem {
  value: string;
  title: string;
  detail: string;
  tone: 'info' | 'warning';
  link?: { queryParams: Record<string, string> };
}

// Bar grafikler tek renk (büyüklük), iki parçalı oranlar sabit sıradaki ilk iki kategorik renk
const BAR_COLOR = '#2a78d6';
const SPLIT_COLORS = ['#2a78d6', '#eb6834'];

// Raporlar > Yönetici Özeti: AirSelect Gen2 admin dashboard akışı
// (marka · dönem · filtreler → KPI'lar → aylık trend → kırılımlar → bölgeler → aksiyon listesi)
@Component({
  selector: 'app-yonetici-ozeti',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './yonetici-ozeti.component.html',
  styleUrls: ['../proje-tipleri/proje-tipleri.component.css', './yonetici-ozeti.component.css']
})
export class YoneticiOzetiComponent implements OnInit {
  reportService = inject(ReportService);
  brandService = inject(BrandService);
  authService = inject(AuthService);
  router = inject(Router);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  readonly dimensions = DASHBOARD_DIMENSIONS;
  readonly barColor = BAR_COLOR;

  brand: string = 'ALL';
  periodMode: ReportPeriodMode = 'monthly';
  period = '';
  filters: ReportFilters = {};
  hoveredMonth: number | null = null;

  ngOnInit() {
    this.pageTitleService.setPage('Yönetici Özeti', 'Marka, dönem, sistem ve bina tipine göre proje özeti');
    this.period = this.reportService.periodOptions('monthly')[0];
    // Business Admin kendi markasına kilitlidir
    const scope = this.authService.brandScope();
    if (scope?.length === 1) this.brand = String(scope[0]);
  }

  get brandLocked(): boolean {
    return (this.authService.brandScope()?.length ?? 0) === 1;
  }

  get brandOptions(): { key: string; label: string }[] {
    const scope = this.authService.brandScope();
    const brands = this.brandService.brands().filter(b => !scope || scope.includes(b.id));
    return [
      ...(scope?.length === 1 ? [] : [{ key: 'ALL', label: this.tsService.translate('Tüm markalar') }]),
      ...brands.map(b => ({ key: String(b.id), label: b.name }))
    ];
  }

  setPeriodMode(mode: ReportPeriodMode) {
    if (this.periodMode === mode) return;
    // Aylıktan yıllığa geçerken seçili ayın yılı korunur
    this.period = mode === 'yearly' ? this.period.slice(0, 4) : this.reportService.periodOptions('monthly').find(p => p.startsWith(this.period)) ?? this.reportService.periodOptions('monthly')[0];
    this.periodMode = mode;
  }

  get periodOptions(): string[] {
    return this.reportService.periodOptions(this.periodMode);
  }

  periodLabel(period: string): string {
    return this.reportService.periodLabel(this.periodMode, period);
  }

  get subtitle(): string {
    const brand = this.brand === 'ALL'
      ? this.brandService.brands().map(b => b.name).join(' + ')
      : this.brandService.brandName(Number(this.brand));
    return `${brand} · ${this.periodLabel(this.period)}`;
  }

  // Filtre seçenekleri: ülke listesi seçili bölgeye göre daralır
  optionsFor(dim: ReportDimension): { key: string; label: string }[] {
    const within = dim === 'country' && this.filters.region
      ? this.brandScoped.filter(p => p.region === this.filters.region)
      : this.brandScoped;
    return this.reportService.optionsFor(dim, within);
  }

  setFilter(dim: ReportDimension, value: string) {
    const next = { ...this.filters };
    if (value === 'ALL') delete next[dim];
    else next[dim] = value;
    // Bölge değişince o bölgede olmayan ülke seçimi temizlenir
    if (dim === 'region' && next.country && !this.brandScoped.some(p => p.region === next.region && p.country === next.country)) {
      delete next.country;
    }
    this.filters = next;
  }

  get hasFilters(): boolean {
    return Object.keys(this.filters).length > 0;
  }

  clearFilters() {
    this.filters = {};
  }

  allLabel(dim: ReportDimension): string {
    return {
      brand: 'Tüm markalar',
      region: 'Tüm bölgeler',
      country: 'Tüm ülkeler',
      system: 'Tüm sistemler',
      subSystem: 'Tümü',
      productCategory: 'Tüm kategoriler',
      buildingType: 'Tüm tipler',
      designMode: 'Tümü'
    }[dim];
  }

  // Veri katmanları: rol kapsamı → marka → filtreler → dönem
  private get brandScoped(): ReportProject[] {
    return this.reportService.scopedProjects().filter(p => this.brand === 'ALL' || String(this.reportService.brandIdOf(p)) === this.brand);
  }

  private get filtered(): ReportProject[] {
    return this.brandScoped.filter(p => this.reportService.matches(p, this.filters));
  }

  get periodProjects(): ReportProject[] {
    return this.filtered.filter(p => this.reportService.inPeriod(p, this.periodMode, this.period));
  }

  private get previousProjects(): ReportProject[] {
    const prev = this.reportService.previousPeriod(this.periodMode, this.period);
    return this.filtered.filter(p => this.reportService.inPeriod(p, this.periodMode, prev));
  }

  // KPI'lar
  get kpis(): Kpi[] {
    const list = this.periodProjects;
    const prev = this.previousProjects.length;
    const fmt = (n: number, d = 0) => this.reportService.formatNumber(n, d);
    const delta = prev ? Math.round(((list.length - prev) / prev) * 100) : null;
    const prevLabel = this.periodMode === 'monthly' ? 'önceki aya göre' : 'önceki yıla göre';

    const idu = list.reduce((s, p) => s + this.reportService.unitsOf(p, GROUP_IDU), 0);
    const controllers = list.reduce((s, p) => s + p.controllers, 0);
    const ratio = idu ? controllers / idu : 0;
    const central = list.length ? (list.filter(p => p.centralController).length / list.length) * 100 : 0;

    return [
      {
        label: 'Oluşturulan projeler',
        value: fmt(list.length),
        note: delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}% ${this.tsService.translate(prevLabel)}`,
        tone: delta === null ? 'neutral' : delta >= 0 ? 'good' : 'bad'
      },
      {
        label: 'Harici kullanıcılar (SKID)',
        value: fmt(new Set(list.filter(p => p.userType === 'external').map(p => p.userCode)).size),
        note: this.tsService.translate('Dönemde aktif'),
        tone: 'neutral'
      },
      {
        label: 'Dahili kullanıcılar (SSO)',
        value: fmt(new Set(list.filter(p => p.userType === 'internal').map(p => p.userCode)).size),
        note: this.tsService.translate('Nova ve Orion çalışanları'),
        tone: 'neutral'
      },
      {
        label: 'Tasarlanan üniteler',
        value: this.reportService.formatCompact(list.reduce((s, p) => s + this.reportService.totalUnits(p), 0)),
        note: this.tsService.translate('Tüm ürün kategorileri'),
        tone: 'neutral'
      },
      {
        label: 'İç ünite başına kontrol cihazı',
        value: fmt(ratio, 2),
        note: this.tsService.translate('Hedef') + ' ' + fmt(CONTROLLERS_PER_IDU_TARGET, 2),
        tone: ratio >= CONTROLLERS_PER_IDU_TARGET ? 'good' : 'bad'
      },
      {
        label: 'Merkezi kontrol payı',
        value: fmt(central) + '%',
        note: this.tsService.translate('2030 hedefi') + ' ' + CENTRAL_CONTROLLER_TARGET,
        tone: central >= 25 ? 'good' : 'bad'
      }
    ];
  }

  // Aylık proje trendi: seçili yılın 12 ayı (dönem dışındaki filtreler uygulanır)
  get chartYear(): string {
    return this.period.slice(0, 4);
  }

  get selectedMonth(): number | null {
    return this.periodMode === 'monthly' ? Number(this.period.slice(5, 7)) : null;
  }

  get monthlyBars(): { month: number; label: string; value: number; height: number; future: boolean }[] {
    const year = this.chartYear;
    const counts = Array(12).fill(0);
    this.filtered.filter(p => p.createdAt.startsWith(year)).forEach(p => counts[Number(p.createdAt.slice(5, 7)) - 1]++);
    const max = Math.max(1, ...counts);
    const last = this.reportService.lastDay;
    return counts.map((value, i) => ({
      month: i + 1,
      label: this.reportService.monthShort(i + 1),
      value,
      height: (value / max) * 100,
      future: `${year}-${String(i + 1).padStart(2, '0')}` > last.slice(0, 7)
    }));
  }

  get monthlyMax(): number {
    return Math.max(0, ...this.monthlyBars.map(b => b.value));
  }

  monthTooltip(bar: { month: number; value: number }): string {
    return `${this.reportService.periodLabel('monthly', `${this.chartYear}-${String(bar.month).padStart(2, '0')}`)}: ${this.reportService.formatNumber(bar.value)}`;
  }

  // Bina tipine göre projeler
  get buildingTypeRows(): BarRow[] {
    return this.toRows(this.countBy(this.periodProjects, p => [String(p.projectTypeId)]), key => this.reportService.labelOf('buildingType', key));
  }

  // Ürün kategorisine göre tasarlanan üniteler
  get categoryRows(): BarRow[] {
    const totals = new Map<string, number>();
    this.periodProjects.forEach(p => p.lines.forEach(l => {
      const key = String(l.productGroupId);
      totals.set(key, (totals.get(key) ?? 0) + l.quantity);
    }));
    return this.toRows(totals, key => this.reportService.groupName(Number(key)), true);
  }

  private countBy(list: ReportProject[], keys: (p: ReportProject) => string[]): Map<string, number> {
    const counts = new Map<string, number>();
    list.forEach(p => keys(p).forEach(k => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return counts;
  }

  private toRows(counts: Map<string, number>, label: (key: string) => string, compact = false): BarRow[] {
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const max = Math.max(1, ...entries.map(e => e[1]));
    return entries.map(([key, value]) => ({
      key,
      label: label(key),
      value,
      display: compact ? this.reportService.formatCompact(value) : this.reportService.formatNumber(value),
      share: value / max
    }));
  }

  // Sistem ve tasarım modu oranları
  get splitBars(): SplitBar[] {
    const list = this.periodProjects;
    const vrf = list.filter(p => p.systemId === 4);
    const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
    const hp = pct(vrf.filter(p => p.subSystem === 'heatPump').length, vrf.length);
    const auto = pct(list.filter(p => p.designMode === 'auto').length, list.length);
    return [
      {
        title: 'Alt sistem (VRF)',
        parts: vrf.length ? [
          { label: this.reportService.labelOf('subSystem', 'heatPump'), percent: hp, color: SPLIT_COLORS[0] },
          { label: this.reportService.labelOf('subSystem', 'heatRecovery'), percent: 100 - hp, color: SPLIT_COLORS[1] }
        ] : []
      },
      {
        title: 'Tasarım modu',
        parts: list.length ? [
          { label: this.reportService.labelOf('designMode', 'auto'), percent: auto, color: SPLIT_COLORS[0] },
          { label: this.reportService.labelOf('designMode', 'free'), percent: 100 - auto, color: SPLIT_COLORS[1] }
        ] : []
      }
    ];
  }

  // Bölgeler ve business admin'ler (bölge × marka)
  get regionRows(): { region: string; brand: string; admin: string; projects: number }[] {
    const map = new Map<string, { region: string; brandId: number | null; projects: number }>();
    this.periodProjects.forEach(p => {
      const brandId = this.reportService.brandIdOf(p);
      const key = `${p.region}|${brandId}`;
      const row = map.get(key) ?? { region: p.region, brandId, projects: 0 };
      row.projects++;
      map.set(key, row);
    });
    return [...map.values()]
      .sort((a, b) => b.projects - a.projects)
      .map(r => ({
        region: this.tsService.translate(r.region),
        brand: this.brandService.brandName(r.brandId) || '—',
        admin: this.reportService.businessAdmin(r.region, r.brandId),
        projects: r.projects
      }));
  }

  // Aksiyon gerektirenler: Projeler listesine filtreli bağlantı verir
  get actions(): ActionItem[] {
    const list = this.periodProjects;
    const all = this.filtered;
    const items: ActionItem[] = [];
    const fmt = (n: number, d = 0) => this.reportService.formatNumber(n, d);

    const readOnly = all.filter(p => p.status === 'readOnly').length;
    if (readOnly) {
      items.push({
        value: fmt(readOnly),
        title: this.tsService.translate('Salt okunur projeler'),
        detail: this.tsService.translate('Ürün listesinde devreden çıkmış ürün var'),
        tone: 'info',
        link: { queryParams: { status: 'readOnly' } }
      });
    }

    const noController = list.filter(p => p.controllers === 0).length;
    if (noController) {
      items.push({
        value: fmt(noController),
        title: this.tsService.translate('Kontrol cihazı olmayan projeler'),
        detail: this.tsService.translate('Bu dönemde oluşturuldu'),
        tone: 'info',
        link: { queryParams: { flag: 'noController', period: this.period } }
      });
    }

    const r32Failed = all.filter(p => p.r32RoomsNeedingVentilation === null && p.status !== 'won' && p.status !== 'lost').length;
    if (r32Failed) {
      items.push({
        value: fmt(r32Failed),
        title: this.tsService.translate('R32 güvenlik kontrolünden geçemeyen projeler'),
        detail: this.tsService.translate('Açık projeler; tasarımcıyla kontrol edilmeli'),
        tone: 'warning',
        link: { queryParams: { flag: 'r32Failed' } }
      });
    }

    const kpis = this.kpis;
    if (kpis[4].tone === 'bad') {
      items.push({
        value: kpis[4].value,
        title: this.tsService.translate('İç ünite başına kontrol cihazı hedefin altında'),
        detail: kpis[4].note,
        tone: 'warning'
      });
    }

    const undefinedAdmins = this.regionRows.filter(r => !r.admin);
    if (undefinedAdmins.length) {
      items.push({
        value: fmt(undefinedAdmins.length),
        title: this.tsService.translate('Business admin atanmamış bölgeler'),
        detail: undefinedAdmins.map(r => `${r.region} · ${r.brand}`).join(', '),
        tone: 'warning'
      });
    }
    return items;
  }

  openAction(item: ActionItem) {
    if (!item.link) return;
    this.router.navigate(['/raporlar/detay'], { queryParams: { ...this.baseParams, ...item.link.queryParams } });
  }

  // Detay'a dashboard'daki marka ve filtreler taşınır
  private get baseParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.brand !== 'ALL') params['brand'] = this.brand;
    (Object.keys(this.filters) as ReportDimension[]).forEach(dim => {
      if (this.filters[dim]) params[dim] = this.filters[dim]!;
    });
    return params;
  }

  // Seçili dönem de taşınır: Detay'daki proje sayısı "Oluşturulan projeler" ile eşleşir
  get detailParams(): Record<string, string> {
    return { ...this.baseParams, period: this.period };
  }

  // Excel'e aktarım: özet tabloları tek CSV dosyasında
  exportExcel() {
    const t = (k: string) => this.tsService.translate(k);
    const rows: string[][] = [
      [t('Yönetici Özeti'), this.subtitle],
      [],
      [t('KPI'), t('Değer'), t('Not')],
      ...this.kpis.map(k => [t(k.label), k.value, k.note]),
      [],
      [`${t('Aylık projeler')} · ${this.chartYear}`, t('Proje')],
      ...this.monthlyBars.map(b => [b.label, String(b.value)]),
      [],
      [t('Bina tipine göre projeler'), t('Proje')],
      ...this.buildingTypeRows.map(r => [r.label, String(r.value)]),
      [],
      [t('Ürün kategorisine göre tasarlanan üniteler'), t('Adet')],
      ...this.categoryRows.map(r => [r.label, String(r.value)]),
      [],
      [t('Sistem ve tasarım modu'), '%'],
      ...this.splitBars.flatMap(s => s.parts.map(part => [`${t(s.title)} · ${part.label}`, String(part.percent)])),
      [],
      [t('Bölge'), t('Marka'), t('Business admin'), t('Proje')],
      ...this.regionRows.map(r => [r.region, r.brand, r.admin || t('Tanımlanacak'), String(r.projects)])
    ];
    this.reportService.downloadCsv(`yonetici-ozeti-${this.period}.csv`, rows);
  }

  // Getter'lar her kontrol turunda yeni nesne ürettiği için listeler anahtarla izlenir
  trackKey = (_: number, item: { key: string }) => item.key;
  trackLabel = (_: number, item: { label: string }) => item.label;
  trackTitle = (_: number, item: { title: string }) => item.title;
  trackMonth = (_: number, item: { month: number }) => item.month;
  trackRegion = (_: number, item: { region: string; brand: string }) => item.region + '|' + item.brand;

  statusLabel(key: keyof typeof STATUS_LABELS): string {
    return this.tsService.translate(STATUS_LABELS[key]);
  }
}
