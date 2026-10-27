import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CatalogService,
  CatalogItem,
  CatalogStatus,
  CapacityRow,
  CapacityType,
  ProductCapacity,
  ProductDimensions,
  ProductImageGroupKey,
  ProductImageGroups,
  PRODUCT_IMAGE_GROUPS,
  emptyImageGroups
} from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';
import { CountryTreeComponent } from '../shared/country-tree/country-tree.component';
import { VersionChecklistComponent } from '../shared/version-checklist/version-checklist.component';

export type ProductTab = 'genel' | 'gorseller' | 'iliskiler' | 'kapasite' | 'kombinasyon';

// Yüklenen görseller depolama alanını korumak için bu boyuta küçültülür
const MAX_IMAGE_SIZE = 1200;

@Component({
  selector: 'app-urun-detay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CountryTreeComponent, VersionChecklistComponent],
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
    { id: 'iliskiler', label: 'İlişkiler' },
    { id: 'kapasite', label: 'Kapasite' },
    { id: 'kombinasyon', label: 'Kombinasyon' }
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
  imageGroups = PRODUCT_IMAGE_GROUPS;
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

  // Kapasite tablosu (sütunlar veri kaynağındaki sırayla)
  formCapacityRows: CapacityRow[] = [];
  capacityTypeFilter: Record<CapacityType, boolean> = { COOLING: true, HEATING: true };
  capacityTypes: { value: CapacityType; label: string }[] = [
    { value: 'COOLING', label: 'Cooling' },
    { value: 'HEATING', label: 'Heating' }
  ];

  // Tip sütunu ayrı çizildiği için sadece sayısal sütunlar
  capacityColumnsBeforeType: { key: keyof CapacityRow; label: string; unit: string }[] = [
    { key: 'nominalCapacity', label: 'Nominal Kapasite', unit: 'kW' }
  ];
  capacityColumnsAfterType: { key: keyof CapacityRow; label: string; unit: string }[] = [
    { key: 'outdoorWb', label: 'Dış Ortam Yaş Termometre', unit: '°C' },
    { key: 'outdoorDb', label: 'Dış Ortam Kuru Termometre', unit: '°C' },
    { key: 'totalCapacity', label: 'Toplam Kapasite', unit: 'kW' },
    { key: 'powerInput', label: 'Güç Tüketimi', unit: 'kW' },
    { key: 'combinationRatio', label: 'Kombinasyon Oranı', unit: '%' },
    { key: 'indoorDb', label: 'İç Ortam Kuru Termometre', unit: '°C' },
    { key: 'indoorWb', label: 'İç Ortam Yaş Termometre', unit: '°C' }
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
    this.formCapacityRows = (product?.capacityRows ?? []).map(r => ({ ...r }));
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

  onImagesSelected(event: Event, group: ProductImageGroupKey) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'));
    input.value = '';

    files.forEach(file => {
      this.resizeImage(file).then(dataUrl => {
        this.formImageGroups = {
          ...this.formImageGroups,
          [group]: [...this.formImageGroups[group], dataUrl]
        };
      });
    });
  }

  private resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d')!;
          // Şeffaf PNG'ler JPEG'e çevrilirken siyah arka plan oluşmasın
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(group: ProductImageGroupKey, index: number) {
    this.formImageGroups = {
      ...this.formImageGroups,
      [group]: this.formImageGroups[group].filter((_, i) => i !== index)
    };
  }

  // Kapasite tablosu

  // Tablo doğrudan formCapacityRows üzerinden çizilir, filtre satır bazında *ngIf ile uygulanır.
  // Şablonda her çağrıda yeni dizi/nesne üreten bir getter kullanılırsa satırlar sürekli yeniden
  // oluşturulur; yeni ngModel'ler yeni değişiklik algılaması tetikler ve sayfa donar.
  get visibleCapacityCount(): number {
    return this.formCapacityRows.filter(r => this.capacityTypeFilter[r.type]).length;
  }

  capacityTypeCount(type: CapacityType): number {
    return this.formCapacityRows.filter(r => r.type === type).length;
  }

  addCapacityRow() {
    // Sadece tek tip filtrelenmişse yeni satır o tipte açılır
    const type: CapacityType =
      this.capacityTypeFilter.HEATING && !this.capacityTypeFilter.COOLING ? 'HEATING' : 'COOLING';
    this.capacityTypeFilter[type] = true;
    this.formCapacityRows = [
      ...this.formCapacityRows,
      {
        nominalCapacity: this.formCapacity.nominalCapacity,
        type,
        outdoorWb: null,
        outdoorDb: null,
        totalCapacity: null,
        powerInput: null,
        combinationRatio: null,
        indoorDb: null,
        indoorWb: null
      }
    ];
  }

  removeCapacityRow(index: number) {
    this.formCapacityRows = this.formCapacityRows.filter((_, i) => i !== index);
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
      capacityRows: this.formCapacityRows.map(r => ({ ...r })),
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
