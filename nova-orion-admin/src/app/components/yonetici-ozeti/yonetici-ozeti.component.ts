import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ReportService,
  ReportProject,
  ReportDimension,
  ReportFilters,
  OTHER_KEY
} from '../../services/report.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

export interface PieSlice {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  path: string;
  isOther: boolean;
}

export interface PieChart {
  dim: ReportDimension;
  title: string;
  subtitle: string;
  total: number;
  slices: PieSlice[];
}

// Kategorik palet (doğrulanmış sabit sıra); 6 dilimden fazlası "Diğer"de toplanır
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const OTHER_COLOR = '#a8a29e';
const MAX_SLICES = SERIES_COLORS.length;

// Halka grafik geometrisi (viewBox 0 0 200 200)
const CX = 100;
const CY = 100;
const R_OUTER = 92;
const R_INNER = 58;

@Component({
  selector: 'app-yonetici-ozeti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './yonetici-ozeti.component.html',
  styleUrls: ['../proje-tipleri/proje-tipleri.component.css', './yonetici-ozeti.component.css']
})
export class YoneticiOzetiComponent implements OnInit {
  reportService = inject(ReportService);
  router = inject(Router);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  readonly dimensions: { dim: ReportDimension; title: string; subtitle: string }[] = [
    { dim: 'projectType', title: 'Proje Tipine Göre', subtitle: 'Proje sayısı' },
    { dim: 'productType', title: 'Kullanılan Ürün Tipine Göre', subtitle: 'Projelerde kullanım sayısı' },
    { dim: 'system', title: 'Sistem Tipine Göre', subtitle: 'Proje sayısı' },
    { dim: 'country', title: 'Ülkeye Göre', subtitle: 'Proje sayısı' },
    { dim: 'region', title: 'Bölgeye Göre', subtitle: 'Proje sayısı' }
  ];

  // Dilime tıklayınca seçilen filtreler; diğer grafikler buna göre süzülür
  filters: ReportFilters = {};
  hovered: { dim: ReportDimension; key: string } | null = null;

  ngOnInit() {
    this.pageTitleService.setPage('Yönetici Özeti', 'Projelerin proje tipi, ürün tipi, sistem, ülke ve bölge dağılımı');
  }

  private countBy(projects: ReportProject[], dim: ReportDimension): Map<string, number> {
    const counts = new Map<string, number>();
    projects.forEach(p => this.reportService.keysOf(p, dim).forEach(k => counts.set(k, (counts.get(k) ?? 0) + 1)));
    return counts;
  }

  get charts(): PieChart[] {
    const scoped = this.reportService.scopedProjects();
    return this.dimensions.map(d => {
      // Renk ve dilim sırası filtreden bağımsız kapsamdaki toplamdan gelir: filtre değişince renkler kaymaz
      const order = [...this.countBy(scoped, d.dim).entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([k]) => k);
      const ranked = order.length > MAX_SLICES ? order.slice(0, MAX_SLICES - 1) : order;

      const counts = this.countBy(scoped.filter(p => this.reportService.matches(p, this.filters, d.dim)), d.dim);
      const entries = ranked.map((key, i) => ({ key, count: counts.get(key) ?? 0, color: SERIES_COLORS[i], isOther: false }));
      const otherCount = order.slice(ranked.length).reduce((sum, k) => sum + (counts.get(k) ?? 0), 0);
      if (order.length > ranked.length) entries.push({ key: OTHER_KEY, count: otherCount, color: OTHER_COLOR, isOther: true });

      const total = entries.reduce((sum, e) => sum + e.count, 0);
      let angle = 0;
      const slices: PieSlice[] = entries.map(e => {
        const sweep = total ? (e.count / total) * 360 : 0;
        const path = sweep > 0 ? this.arcPath(angle, angle + sweep) : '';
        angle += sweep;
        return {
          key: e.key,
          label: this.reportService.labelOf(d.dim, e.key),
          count: e.count,
          percent: total ? (e.count / total) * 100 : 0,
          color: e.color,
          path,
          isOther: e.isOther
        };
      });

      return { dim: d.dim, title: d.title, subtitle: d.subtitle, total, slices };
    });
  }

  private arcPath(start: number, end: number): string {
    // Tam daire tek yayla çizilemez; iki yarım halka olarak çizilir
    if (end - start >= 359.999) {
      return this.arcPath(start, start + 180) + ' ' + this.arcPath(start + 180, end);
    }
    const large = end - start > 180 ? 1 : 0;
    const p = (r: number, a: number) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return `${(CX + r * Math.cos(rad)).toFixed(2)} ${(CY + r * Math.sin(rad)).toFixed(2)}`;
    };
    return `M ${p(R_OUTER, start)} A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${p(R_OUTER, end)} ` +
      `L ${p(R_INNER, end)} A ${R_INNER} ${R_INNER} 0 ${large} 0 ${p(R_INNER, start)} Z`;
  }

  // "Diğer" dilimi tek bir değere karşılık gelmediği için filtrelenemez
  toggleFilter(dim: ReportDimension, slice: PieSlice) {
    if (slice.isOther || slice.count === 0) return;
    const next = { ...this.filters };
    if (next[dim] === slice.key) {
      delete next[dim];
    } else {
      next[dim] = slice.key;
    }
    this.filters = next;
  }

  isDimmed(dim: ReportDimension, slice: PieSlice): boolean {
    const selected = this.filters[dim];
    if (selected) return selected !== slice.key;
    return !!this.hovered && this.hovered.dim === dim && this.hovered.key !== slice.key;
  }

  centerSlice(chart: PieChart): PieSlice | undefined {
    const key = this.hovered?.dim === chart.dim ? this.hovered.key : this.filters[chart.dim];
    return key ? chart.slices.find(s => s.key === key) : undefined;
  }

  get activeFilters(): { dim: ReportDimension; label: string }[] {
    return (Object.keys(this.filters) as ReportDimension[]).map(dim => ({
      dim,
      label: this.reportService.labelOf(dim, this.filters[dim]!)
    }));
  }

  removeFilter(dim: ReportDimension) {
    const next = { ...this.filters };
    delete next[dim];
    this.filters = next;
  }

  clearFilters() {
    this.filters = {};
  }

  // Seçili filtrelerle Detay sayfasına geçer
  openDetail() {
    this.router.navigate(['/raporlar/detay'], { queryParams: this.filters });
  }

  get kpis(): { label: string; value: number }[] {
    const list = this.reportService.scopedProjects().filter(p => this.reportService.matches(p, this.filters));
    return [
      { label: 'Toplam Proje', value: list.length },
      { label: 'Ülke', value: new Set(list.map(p => p.country)).size },
      { label: 'Bölge', value: new Set(list.map(p => p.region)).size },
      { label: 'Proje Oluşturan Kullanıcı', value: new Set(list.map(p => p.createdBy)).size },
      { label: 'Toplam Adet', value: list.reduce((sum, p) => sum + p.lines.reduce((q, l) => q + l.quantity, 0), 0) }
    ];
  }

  formatPercent(value: number): string {
    return value.toFixed(value >= 10 || value === 0 ? 0 : 1) + '%';
  }
}
