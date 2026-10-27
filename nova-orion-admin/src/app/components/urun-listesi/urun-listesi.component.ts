import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogService, CatalogItem } from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-urun-listesi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './urun-listesi.component.html',
  styleUrls: ['../katalog/katalog.component.css', './urun-listesi.component.css']
})
export class UrunListesiComponent implements OnInit {
  router = inject(Router);
  catalogService = inject(CatalogService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  // Search & Filter
  searchQuery = '';
  filterGroup = 'ALL';
  filterFamily = 'ALL';
  filterStatus = 'ALL';

  ngOnInit() {
    this.pageTitleService.setPage('Ürün', 'Ürün grubu, tipi ve ailesine göre ürünlerin yönetimi');
  }

  get familyFilterOptions(): CatalogItem[] {
    const families = this.catalogService.items('urun-ailesi');
    if (this.filterGroup === 'ALL') return families;
    return families.filter(f => f.parentIds.includes(Number(this.filterGroup)));
  }

  get filteredProducts(): CatalogItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.catalogService.items('urun').filter(p => {
      if (this.filterStatus !== 'ALL' && p.status !== this.filterStatus) return false;
      if (this.filterGroup !== 'ALL' && !p.parentIds.includes(Number(this.filterGroup))) return false;
      if (this.filterFamily !== 'ALL' && p.productFamilyId !== Number(this.filterFamily)) return false;
      if (!query) return true;
      return [p.name, p.description, p.unbrandedName ?? '', p.version ?? ''].some(v =>
        v.toLowerCase().includes(query)
      );
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || this.filterGroup !== 'ALL' || this.filterFamily !== 'ALL' || this.filterStatus !== 'ALL';
  }

  onGroupFilterChange() {
    // Seçili aile yeni gruba ait değilse aile filtresini sıfırla
    if (!this.familyFilterOptions.some(f => f.id === Number(this.filterFamily))) {
      this.filterFamily = 'ALL';
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterGroup = 'ALL';
    this.filterFamily = 'ALL';
    this.filterStatus = 'ALL';
  }

  name(entity: 'urun-grubu' | 'urun-tipi' | 'urun-ailesi', id: number | null | undefined): string {
    return this.tsService.translate(this.catalogService.itemName(entity, id));
  }

  openDetail(id?: number) {
    this.router.navigate(['/katalog/urun', id ?? 'yeni']);
  }

  deleteProduct(id: number) {
    if (confirm(this.tsService.translate('Bu ürünü silmek istediğinizden emin misiniz?'))) {
      this.catalogService.deleteItem('urun', id);
    }
  }
}
