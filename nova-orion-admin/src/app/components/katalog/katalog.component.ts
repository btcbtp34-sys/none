import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogService,
  CatalogItem,
  CatalogEntity,
  CatalogStatus,
  CATALOG_ENTITIES
} from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-katalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './katalog.component.html',
  styleUrl: './katalog.component.css'
})
export class KatalogComponent implements OnInit {
  route = inject(ActivatedRoute);
  catalogService = inject(CatalogService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  entity: CatalogEntity = 'sistem';
  config = CATALOG_ENTITIES['sistem'];

  showModal = false;
  editingId: number | null = null;

  // Search & Filter
  searchQuery = '';
  filterParent = 'ALL';
  filterStatus = 'ALL';

  // Form Fields
  formName = '';
  formDescription = '';
  formParentIds: number[] = [];
  formProductTypeId: number | null = null;
  formSystemIds: number[] = [];
  formStatus: CatalogStatus = 'Aktif';
  formError = '';

  ngOnInit() {
    // Aynı bileşen Katalog sayfaları arasında yeniden kullanıldığı için route verisi dinlenir
    this.route.data.subscribe(data => {
      this.entity = data['entity'] as CatalogEntity;
      this.config = CATALOG_ENTITIES[this.entity];
      this.searchQuery = '';
      this.filterParent = 'ALL';
      this.filterStatus = 'ALL';
      this.closeModal();
      this.pageTitleService.setPage(this.config.title, this.config.subtitle);
    });
  }

  get parentItems(): CatalogItem[] {
    return this.config.parent ? this.catalogService.items(this.config.parent) : [];
  }

  parentName(id: number): string {
    return this.config.parent ? this.catalogService.itemName(this.config.parent, id) : '';
  }

  get filteredItems(): CatalogItem[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.catalogService.items(this.entity).filter(item => {
      if (this.filterStatus !== 'ALL' && item.status !== this.filterStatus) return false;
      if (this.filterParent !== 'ALL' && !item.parentIds.includes(Number(this.filterParent))) return false;
      if (!query) return true;
      return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || this.filterParent !== 'ALL' || this.filterStatus !== 'ALL';
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterParent = 'ALL';
    this.filterStatus = 'ALL';
  }

  openModal(item?: CatalogItem) {
    this.editingId = item?.id ?? null;
    this.formName = item?.name ?? '';
    this.formDescription = item?.description ?? '';
    this.formParentIds = item ? [...item.parentIds] : [];
    this.formProductTypeId = item?.productTypeId ?? null;
    this.formSystemIds = [...(item?.systemIds ?? [])];
    this.formStatus = item?.status ?? 'Aktif';
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  get singleParentId(): number | null {
    return this.formParentIds[0] ?? null;
  }

  set singleParentId(id: number | null) {
    this.formParentIds = id !== null ? [Number(id)] : [];

    // Grup değişince, yeni gruba ait olmayan ürün tipi seçimini temizle
    if (!this.productTypeOptions.some(t => t.id === this.formProductTypeId)) {
      this.formProductTypeId = null;
    }

    // Sistemler seçilen ürün grubundan gelir; grup değişince grubun tüm sistemleri seçili başlar
    if (this.config.hasSystem) {
      this.formSystemIds = this.systemOptions.map(s => s.id);
    }
  }

  // Seçili ürün tipinin (yoksa ürün grubunun) bağlı olduğu sistemler
  get systemOptions(): CatalogItem[] {
    return this.catalogService.systemOptions(
      this.singleParentId,
      this.config.hasProductType ? this.formProductTypeId : null
    );
  }

  // Ürün tipi değişince sistemler yeni tipten gelir ve hepsi seçili başlar
  onProductTypeChange() {
    if (this.config.hasSystem) {
      this.formSystemIds = this.systemOptions.map(s => s.id);
    }
  }

  isSystemSelected(id: number): boolean {
    return this.formSystemIds.includes(id);
  }

  toggleSystem(id: number) {
    this.formSystemIds = this.isSystemSelected(id)
      ? this.formSystemIds.filter(s => s !== id)
      : [...this.formSystemIds, id];
  }

  systemName(id: number): string {
    return this.catalogService.itemName('sistem', id);
  }

  // Seçili ürün grubuna ait ürün tipleri
  get productTypeOptions(): CatalogItem[] {
    return this.catalogService.productTypeOptions(this.singleParentId);
  }

  productTypeName(id: number | null | undefined): string {
    return this.catalogService.itemName('urun-tipi', id);
  }

  get columnCount(): number {
    return 5 + (this.config.parent ? 1 : 0) + (this.config.hasProductType ? 1 : 0) + (this.config.hasSystem ? 1 : 0);
  }

  isParentSelected(id: number): boolean {
    return this.formParentIds.includes(id);
  }

  toggleParentSelection(id: number) {
    this.formParentIds = this.isParentSelected(id)
      ? this.formParentIds.filter(p => p !== id)
      : [...this.formParentIds, id];
  }

  saveItem() {
    const name = this.formName.trim();

    if (!name) {
      this.formError = this.tsService.translate('Lütfen ad alanını doldurunuz.');
      return;
    }

    if (this.config.parent && this.formParentIds.length === 0) {
      this.formError = this.tsService.translate('Lütfen en az bir ' + CATALOG_ENTITIES[this.config.parent].singular.toLocaleLowerCase('tr-TR') + ' seçiniz.');
      return;
    }

    if (this.config.hasProductType && !this.formProductTypeId) {
      this.formError = this.tsService.translate('Lütfen bir ürün tipi seçiniz.');
      return;
    }

    if (this.config.hasSystem && this.systemOptions.length > 0 && this.formSystemIds.length === 0) {
      this.formError = this.tsService.translate('Lütfen en az bir sistem seçiniz.');
      return;
    }

    const payload = {
      name,
      description: this.formDescription.trim(),
      parentIds: this.config.parent ? this.formParentIds : [],
      ...(this.config.hasProductType ? { productTypeId: this.formProductTypeId } : {}),
      ...(this.config.hasSystem ? { systemIds: this.formSystemIds } : {}),
      status: this.formStatus
    };

    if (this.editingId) {
      this.catalogService.updateItem(this.entity, this.editingId, payload);
    } else {
      this.catalogService.addItem(this.entity, payload);
    }

    this.closeModal();
  }

  deleteItem(id: number) {
    if (confirm(this.tsService.translate('Bu kaydı silmek istediğinizden emin misiniz?'))) {
      this.catalogService.deleteItem(this.entity, id);
    }
  }
}
