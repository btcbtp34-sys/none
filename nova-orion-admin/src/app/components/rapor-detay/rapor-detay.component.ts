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
  REPORT_DIMENSIONS
} from '../../services/report.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

// Detay tablosunun bir satırı: proje bilgisi + tek ürün satırı
export interface DetailRow {
  project: ReportProject;
  line: ReportLine;
}

const PAGE_SIZE = 25;

// Raporlar > Detay: Yönetici Özeti'ndeki sayıların proje ve ürün satırı bazında dökümü.
// Yönetici Özeti'nden gelen filtreler URL ile taşınır
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

  readonly dimensions = REPORT_DIMENSIONS;

  filters: ReportFilters = {};
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
      this.page = 1;
    });
  }

  filterValue(dim: ReportDimension): string {
    return this.filters[dim] ?? 'ALL';
  }

  setFilter(dim: ReportDimension, value: string) {
    const next = { ...this.filters };
    if (value === 'ALL') {
      delete next[dim];
    } else {
      next[dim] = value;
    }
    this.syncUrl(next);
  }

  clearFilters() {
    this.searchQuery = '';
    this.syncUrl({});
  }

  get hasFilters(): boolean {
    return Object.keys(this.filters).length > 0 || !!this.searchQuery.trim();
  }

  // Filtreler URL'de tutulur: sayfa yenilense veya link paylaşılsa da aynı liste görünür
  private syncUrl(filters: ReportFilters) {
    this.router.navigate([], { relativeTo: this.route, queryParams: filters, replaceUrl: true });
  }

  // Ürün tipi filtresi satır düzeyinde uygulanır; diğer filtreler proje düzeyinde
  get rows(): DetailRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    const typeFilter = this.filters.productType;
    const rows: DetailRow[] = [];
    this.reportService.scopedProjects()
      .filter(p => this.reportService.matches(p, this.filters))
      .forEach(project => project.lines
        .filter(line => !typeFilter || String(line.productTypeId) === typeFilter)
        .forEach(line => rows.push({ project, line })));
    if (!q) return rows;
    return rows.filter(row => this.searchText(row).includes(q));
  }

  private searchText(row: DetailRow): string {
    const p = row.project;
    const label = this.reportService.labelOf.bind(this.reportService);
    return [
      p.projectNumber, p.userCode, p.userName, p.projectCode, p.name, p.createdBy,
      p.countryCode, p.salesChannel, this.reportService.brandName(p),
      label('projectType', String(p.projectTypeId)),
      label('system', String(p.systemId)),
      label('country', p.country),
      label('region', p.region),
      this.tsService.translate(row.line.productGroup),
      label('productType', String(row.line.productTypeId)),
      row.line.productFamily,
      row.line.productName
    ].join(' ').toLowerCase();
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
}
