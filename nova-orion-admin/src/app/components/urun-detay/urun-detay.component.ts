import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CatalogService,
  CatalogItem,
  CatalogStatus,
  ProductCapacity,
  ProductDimensions,
  ProductImageGroups,
  emptyImageGroups
} from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';
import { CountryTreeComponent } from '../shared/country-tree/country-tree.component';
import { VersionChecklistComponent } from '../shared/version-checklist/version-checklist.component';
import { ImageGroupsComponent } from '../shared/image-groups/image-groups.component';

export type ProductTab = 'genel' | 'gorseller' | 'iliskiler';

@Component({
  selector: 'app-urun-detay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CountryTreeComponent, VersionChecklistComponent, ImageGroupsComponent],
  templateUrl: './urun-detay.component.html',
  styleUrls: ['../katalog/katalog.component.css', './urun-detay.component.css']
})
export class UrunDetayComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  catalogService = inject(CatalogService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  tabs: { id: ProductTab; label: string }[] = [
    { id: 'genel', label: 'Genel Bilgiler' },
    { id: 'gorseller', label: 'Görseller' },
    { id: 'iliskiler', label: 'İlişkiler' }
  ];
  activeTab: ProductTab = 'genel';

  productId: number | null = null;
  notFound = false;

  // Form Fields
  formName = '';
  formDescription = '';
  formUnbrandedName = '';
  formVersion = '';
  private groupId: number | null = null;
  private typeId: number | null = null;
  formFamilyId: number | null = null;
  formStatus: CatalogStatus = 'Aktif';
  formImageGroups: ProductImageGroups = emptyImageGroups();
  formDimensions: ProductDimensions = this.emptyDimensions();

  dimensionFields: { key: keyof ProductDimensions; label: string; unit: string }[] = [
    { key: 'width', label: 'En', unit: 'mm' },
    { key: 'height', label: 'Boy', unit: 'mm' },
    { key: 'depth', label: 'Derinlik', unit: 'mm' },
    { key: 'netWeight', label: 'Net Ağırlık', unit: 'kg' },
    { key: 'grossWeight', label: 'Brüt Ağırlık', unit: 'kg' }
  ];

  formCapacity: ProductCapacity = this.emptyCapacity();

  capacityFields: { key: keyof ProductCapacity; label: string; unit: string; type: 'number' | 'text' }[] = [
    { key: 'nominalCapacity', label: 'Nominal Kapasite', unit: 'kW', type: 'number' },
    { key: 'powerSupply', label: 'Güç Kaynağı', unit: '', type: 'text' },
    { key: 'coolingCapacity', label: 'Soğutma Kapasitesi', unit: 'kW', type: 'number' },
    { key: 'coolingSensibleCapacity', label: 'Duyulur Soğutma Kapasitesi', unit: 'kW', type: 'number' },
    { key: 'coolingPowerInput', label: 'Soğutma Güç Tüketimi', unit: 'W', type: 'number' },
    { key: 'heatingCapacity', label: 'Isıtma Kapasitesi', unit: 'kW', type: 'number' },
    { key: 'heatingPowerInput', label: 'Isıtma Güç Tüketimi', unit: 'W', type: 'number' }
  ];

  // İlişkiler
  formVersionIds: number[] = [];
  formCountryIds: number[] = [];

  formError = '';
  saveMessage = '';
  saveWarning = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.productId = idParam && idParam !== 'yeni' ? Number(idParam) : null;
      this.loadProduct();
    });
  }

  private loadProduct() {
    const product = this.productId !== null ? this.catalogService.getItem('urun', this.productId) : undefined;
    this.notFound = this.productId !== null && !product;

    this.formName = product?.name ?? '';
    this.formDescription = product?.description ?? '';
    this.formUnbrandedName = product?.unbrandedName ?? '';
    this.formVersion = product?.version ?? '';
    this.groupId = product?.parentIds[0] ?? null;
    this.typeId = product?.productTypeId ?? null;
    this.formFamilyId = product?.productFamilyId ?? null;
    this.formStatus = product?.status ?? 'Aktif';
    this.formImageGroups = { ...emptyImageGroups(), ...product?.imageGroups };
    this.formDimensions = { ...this.emptyDimensions(), ...product?.dimensions };
    this.formCapacity = { ...this.emptyCapacity(), ...product?.capacity };
    this.formVersionIds = [...(product?.versionIds ?? [])];
    this.formCountryIds = [...(product?.countryIds ?? [])];
    this.formError = '';

    this.pageTitleService.setPage(product ? product.name : 'Yeni Ürün', 'Ürün detayları');
  }

  private emptyDimensions(): ProductDimensions {
    return { width: null, height: null, depth: null, netWeight: null, grossWeight: null };
  }

  private emptyCapacity(): ProductCapacity {
    return {
      nominalCapacity: null,
      powerSupply: '',
      coolingCapacity: null,
      coolingSensibleCapacity: null,
      coolingPowerInput: null,
      heatingCapacity: null,
      heatingPowerInput: null
    };
  }

  get formGroupId(): number | null {
    return this.groupId;
  }

  set formGroupId(id: number | null) {
    this.groupId = id;
    // Grup değişince yeni gruba uymayan tip ve aile seçimlerini temizle
    if (!this.typeOptions.some(t => t.id === this.typeId)) this.typeId = null;
    this.resetFamilyIfInvalid();
  }

  get formTypeId(): number | null {
    return this.typeId;
  }

  set formTypeId(id: number | null) {
    this.typeId = id;
    this.resetFamilyIfInvalid();
  }

  private resetFamilyIfInvalid() {
    if (!this.familyOptions.some(f => f.id === this.formFamilyId)) this.formFamilyId = null;
  }

  get typeOptions(): CatalogItem[] {
    return this.catalogService.productTypeOptions(this.groupId);
  }

  get familyOptions(): CatalogItem[] {
    return this.catalogService.productFamilyOptions(this.groupId, this.typeId);
  }

  // Görseller

  get totalImageCount(): number {
    return Object.values(this.formImageGroups).reduce((sum, list) => sum + list.length, 0);
  }

  // Kaydet

  saveProduct() {
    this.saveMessage = '';
    this.saveWarning = '';
    const name = this.formName.trim();

    if (!name) {
      return this.showError('Lütfen ad alanını doldurunuz.');
    }
    if (this.groupId === null) {
      return this.showError('Lütfen bir ürün grubu seçiniz.');
    }
    if (this.typeOptions.length > 0 && this.typeId === null) {
      return this.showError('Lütfen bir ürün tipi seçiniz.');
    }
    if (this.familyOptions.length > 0 && this.formFamilyId === null) {
      return this.showError('Lütfen bir ürün ailesi seçiniz.');
    }

    const payload = {
      name,
      description: this.formDescription.trim(),
      parentIds: [this.groupId],
      productTypeId: this.typeId,
      productFamilyId: this.formFamilyId,
      unbrandedName: this.formUnbrandedName.trim(),
      version: this.formVersion.trim(),
      imageGroups: this.formImageGroups,
      versionIds: this.formVersionIds,
      countryIds: this.formCountryIds,
      dimensions: { ...this.formDimensions },
      capacity: { ...this.formCapacity, powerSupply: this.formCapacity.powerSupply.trim() },
      status: this.formStatus
    };

    let persisted: boolean;
    if (this.productId !== null) {
      persisted = this.catalogService.updateItem('urun', this.productId, payload);
      this.pageTitleService.setPage(name, 'Ürün detayları');
    } else {
      const result = this.catalogService.addItem('urun', payload);
      persisted = result.persisted;
      this.router.navigate(['/katalog/urun', result.id], { replaceUrl: true });
    }

    this.formError = '';
    this.saveMessage = this.tsService.translate('Ürün kaydedildi.');
    if (!persisted) {
      this.saveWarning = this.tsService.translate(
        'Tarayıcı depolama alanı doldu; değişiklikler sayfa yenilenince kaybolabilir. Görsel sayısını azaltmayı deneyin.'
      );
    }
  }

  private showError(message: string) {
    this.formError = this.tsService.translate(message);
    this.activeTab = 'genel';
  }
}
