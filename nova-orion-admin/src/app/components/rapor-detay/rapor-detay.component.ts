import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ReportService,
  ReportProject,
  ReportLine,
  ReportDimension,
  ReportFilters,
  ReportPeriodMode,
  ProjectStatus,
  DETAIL_DIMENSIONS,
  PROJECT_STATUSES,
  STATUS_LABELS
} from '../../services/report.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

// Detay tablosunun bir satırı: proje bilgisi + tek ürün satırı
export interface DetailRow {
  project: ReportProject;
  line: ReportLine;
}

type DetailFlag = 'noController' | 'r32Failed';

const FLAG_LABELS: Record<DetailFlag, string> = {
  noController: 'Kontrol cihazı yok',
  r32Failed: 'R32 kontrolü başarısız'
};

const PAGE_SIZE = 25;

// Raporlar > Detay: Yönetici Özeti'ndeki sayıların proje ve ürün satırı bazında dökümü.
// Filtreler URL'de tutulur; Yönetici Özeti'ndeki bağlantılar buraya filtreli gelir
@Component({
  selector: 'app-rapor-detay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rapor-detay.component.html',
  styleUrls: ['../proje-tipleri/proje-tipleri.component.css', './rapor-detay.component.css']
})
export class RaporDetayComponent implements OnInit {
  reportService = inject(ReportService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  readonly dimensions = DETAIL_DIMENSIONS;
  readonly statuses = PROJECT_STATUSES;

  filters: ReportFilters = {};
  status: ProjectStatus | 'ALL' = 'ALL';
  flag: DetailFlag | null = null;
  period: string | null = null;
  searchQuery = '';
  page = 1;

  ngOnInit() {
    this.pageTitleService.setPage('Detay', 'Yönetici Özeti sayılarının proje ve ürün bazında dökümü');
    this.route.queryParamMap.subscribe(params => {
      const filters: ReportFilters = {};
      this.dimensions.forEach(dim => {
        const value = params.get(dim);
        if (value) filters[dim] = value;
      });
      this.filters = filters;
      const status = params.get('status') as ProjectStatus | null;
      this.status = status && PROJECT_STATUSES.includes(status) ? status : 'ALL';
      const flag = params.get('flag') as DetailFlag | null;
      this.flag = flag && flag in FLAG_LABELS ? flag : null;
      this.period = params.get('period');
      this.page = 1;
    });
  }

  // Filtreler URL'de tutulur: sayfa yenilense veya link paylaşılsa da aynı liste görünür
  private syncUrl(changes: Record<string, string | null>) {
    this.router.navigate([], { relativeTo: this.route, queryParams: changes, queryParamsHandling: 'merge', replaceUrl: true });
  }

  filterValue(dim: ReportDimension): string {
    return this.filters[dim] ?? 'ALL';
  }

  setFilter(dim: ReportDimension, value: string) {
    this.syncUrl({ [dim]: value === 'ALL' ? null : value });
  }

  setStatus(value: string) {
    this.syncUrl({ status: value === 'ALL' ? null : value });
  }

  clearPeriod() {
    this.syncUrl({ period: null });
  }

  clearFlag() {
    this.syncUrl({ flag: null });
  }

  clearFilters() {
    this.searchQuery = '';
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  get hasFilters(): boolean {
    return Object.keys(this.filters).length > 0 || this.status !== 'ALL' || !!this.flag || !!this.period || !!this.searchQuery.trim();
  }

  private get periodMode(): ReportPeriodMode {
    return this.period?.length === 4 ? 'yearly' : 'monthly';
  }

  get periodLabel(): string {
    return this.period ? this.reportService.periodLabel(this.periodMode, this.period) : '';
  }

  get flagLabel(): string {
    return this.flag ? this.tsService.translate(FLAG_LABELS[this.flag]) : '';
  }

  statusLabel(status: ProjectStatus): string {
    return this.tsService.translate(STATUS_LABELS[status]);
  }

  // Proje düzeyindeki filtreler (Yönetici Özeti ile aynı mantık)
  private get projects(): ReportProject[] {
    return this.reportService.scopedProjects().filter(p => {
      if (!this.reportService.matches(p, this.filters)) return false;
      if (this.status !== 'ALL' && p.status !== this.status) return false;
      if (this.flag === 'noController' && p.controllers !== 0) return false;
      if (this.flag === 'r32Failed' && (p.r32RoomsNeedingVentilation !== null || p.status === 'won' || p.status === 'lost')) return false;
      if (this.period && !this.reportService.inPeriod(p, this.periodMode, this.period)) return false;
      return true;
    });
  }

  // Ürün kategorisi filtresi satır düzeyinde uygulanır; diğer filtreler proje düzeyinde
  get rows(): DetailRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    const category = this.filters.productCategory;
    const rows: DetailRow[] = [];
    this.projects.forEach(project => project.lines
      .filter(line => !category || String(line.productGroupId) === category)
      .forEach(line => rows.push({ project, line })));
    if (!q) return rows;
    return rows.filter(row => this.searchText(row).includes(q));
  }

  private searchText(row: DetailRow): string {
    const p = row.project;
    const label = this.reportService.labelOf.bind(this.reportService);
    return [
      p.projectNumber, p.userCode, p.userName, p.projectCode, p.name, p.company, p.createdBy,
      p.countryCode, p.salesChannel, this.reportService.brandName(p),
      label('buildingType', String(p.projectTypeId)),
      label('system', String(p.systemId)),
      label('country', p.country),
      label('region', p.region),
      this.reportService.groupName(row.line.productGroupId),
      this.productTypeName(row.line),
      row.line.productFamily,
      row.line.productName
    ].join(' ').toLowerCase();
  }

  productTypeName(line: ReportLine): string {
    return line.productTypeId ? this.reportService.productTypeName(line.productTypeId) : '-';
  }

  // Özet: proje sayısı Yönetici Özeti'ndeki sayılarla birebir eşleşir
  get totals(): { projects: number; lines: number; quantity: number } {
    const rows = this.rows;
    return {
      projects: new Set(rows.map(r => r.project.id)).size,
      lines: rows.length,
      quantity: rows.reduce((sum, r) => sum + r.line.quantity, 0)
    };
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.rows.length / PAGE_SIZE));
  }

  get pageStart(): number {
    return (Math.min(this.page, this.pageCount) - 1) * PAGE_SIZE;
  }

  get pagedRows(): DetailRow[] {
    return this.rows.slice(this.pageStart, this.pageStart + PAGE_SIZE);
  }

  formatDate(iso: string): string {
    const locale = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR' }[this.tsService.currentLang()] ?? 'en-US';
    return new Date(iso + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'numeric', year: 'numeric' });
  }

  exportCsv() {
    const projects = [...new Map(this.rows.map(r => [r.project.id, r.project])).values()];
    this.reportService.downloadCsv('detay.csv', this.reportService.detailRows(projects, this.filters.productCategory));
  }

  // Getter'lar her kontrol turunda yeni nesne ürettiği için listeler anahtarla izlenir
  trackKey = (_: number, item: { key: string }) => item.key;
  trackRow = (i: number, row: DetailRow) => `${row.project.id}|${row.line.productName}|${i}`;
}
