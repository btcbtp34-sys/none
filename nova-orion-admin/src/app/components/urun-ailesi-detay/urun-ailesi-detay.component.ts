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
  ProductImageGroups,
  emptyImageGroups
} from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';
import { CountryTreeComponent } from '../shared/country-tree/country-tree.component';
import { VersionChecklistComponent } from '../shared/version-checklist/version-checklist.component';
import { ImageGroupsComponent } from '../shared/image-groups/image-groups.component';

export type FamilyTab = 'genel' | 'gorseller' | 'iliskiler' | 'kapasite' | 'kombinasyon';

// Ürün Ailesi detay sayfası: Ürün detayı gibi sekmeli; genel bilgiler, görseller, ilişkiler (uyumlu versiyonlar, ülkeler),
// kapasite tablosu ve kombinasyon
@Component({
  selector: 'app-urun-ailesi-detay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CountryTreeComponent, VersionChecklistComponent, ImageGroupsComponent],
  templateUrl: './urun-ailesi-detay.component.html',
  styleUrls: [
    '../katalog/katalog.component.css',
    '../urun-detay/urun-detay.component.css',
    './urun-ailesi-detay.component.css'
  ]
})
export class UrunAilesiDetayComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  catalogService = inject(CatalogService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  tabs: { id: FamilyTab; label: string }[] = [
    { id: 'genel', label: 'Genel Bilgiler' },
    { id: 'gorseller', label: 'Görseller' },
    { id: 'iliskiler', label: 'İlişkiler' },
    { id: 'kapasite', label: 'Kapasite' },
    { id: 'kombinasyon', label: 'Kombinasyon' }
  ];
  activeTab: FamilyTab = 'genel';

  familyId: number | null = null;
  notFound = false;

  // Form Fields
  formName = '';
  formDescription = '';
  private groupId: number | null = null;
  private typeId: number | null = null;
  formSystemIds: number[] = [];
  formOwnVersionId: number | null = null;
  formStatus: CatalogStatus = 'Aktif';
  formImageGroups: ProductImageGroups = emptyImageGroups();

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
      this.familyId = idParam && idParam !== 'yeni' ? Number(idParam) : null;
      this.loadFamily();
    });
  }

  private loadFamily() {
    const family = this.familyId !== null ? this.catalogService.getItem('urun-ailesi', this.familyId) : undefined;
    this.notFound = this.familyId !== null && !family;

    this.formName = family?.name ?? '';
    this.formDescription = family?.description ?? '';
    this.groupId = family?.parentIds[0] ?? null;
    this.typeId = family?.productTypeId ?? null;
    this.formSystemIds = [...(family?.systemIds ?? [])];
    this.formOwnVersionId = family?.ownVersionId ?? null;
    this.formStatus = family?.status ?? 'Aktif';
    this.formImageGroups = { ...emptyImageGroups(), ...family?.imageGroups };
    this.formVersionIds = [...(family?.versionIds ?? [])];
    this.formCountryIds = [...(family?.countryIds ?? [])];
    this.formCapacityRows = (family?.capacityRows ?? []).map(r => ({ ...r }));
    this.formError = '';
    this.saveMessage = '';
    this.saveWarning = '';

    this.pageTitleService.setPage(family ? family.name : 'Yeni Ürün Ailesi', 'Ürün ailesi detayları');
  }

  get formGroupId(): number | null {
    return this.groupId;
  }

  set formGroupId(id: number | null) {
    this.groupId = id;
    // Grup değişince yeni gruba ait olmayan tip temizlenir, sistemler grubun tümüyle başlar
    if (!this.typeOptions.some(t => t.id === this.typeId)) this.typeId = null;
    this.formSystemIds = this.systemOptions.map(s => s.id);
  }

  get formTypeId(): number | null {
    return this.typeId;
  }

  // Ürün tipi değişince sistemler yeni tipten gelir ve hepsi seçili başlar
  set formTypeId(id: number | null) {
    this.typeId = id;
    this.formSystemIds = this.systemOptions.map(s => s.id);
  }

  get typeOptions(): CatalogItem[] {
    return this.catalogService.productTypeOptions(this.groupId);
  }

  // Seçili ürün tipinin (yoksa ürün grubunun) bağlı olduğu sistemler
  get systemOptions(): CatalogItem[] {
    return this.catalogService.systemOptions(this.groupId, this.typeId);
  }

  get totalImageCount(): number {
    return Object.values(this.formImageGroups).reduce((sum, list) => sum + list.length, 0);
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
        nominalCapacity: null,
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

  isSystemSelected(id: number): boolean {
    return this.formSystemIds.includes(id);
  }

  toggleSystem(id: number) {
    this.formSystemIds = this.isSystemSelected(id)
      ? this.formSystemIds.filter(s => s !== id)
      : [...this.formSystemIds, id];
  }

  saveFamily() {
    this.saveMessage = '';
    this.saveWarning = '';
    const name = this.formName.trim();

    if (!name) {
      return this.showError('Lütfen ad alanını doldurunuz.');
    }
    if (this.groupId === null) {
      return this.showError('Lütfen bir ürün grubu seçiniz.');
    }
    if (this.typeId === null) {
      return this.showError('Lütfen bir ürün tipi seçiniz.');
    }
    if (this.systemOptions.length > 0 && this.formSystemIds.length === 0) {
      return this.showError('Lütfen en az bir sistem seçiniz.');
    }

    const payload = {
      name,
      description: this.formDescription.trim(),
      parentIds: [this.groupId],
      productTypeId: this.typeId,
      systemIds: this.formSystemIds,
      ownVersionId: this.formOwnVersionId,
      versionIds: this.formVersionIds,
      countryIds: this.formCountryIds,
      imageGroups: this.formImageGroups,
      capacityRows: this.formCapacityRows.map(r => ({ ...r })),
      status: this.formStatus
    };

    let persisted: boolean;
    if (this.familyId !== null) {
      persisted = this.catalogService.updateItem('urun-ailesi', this.familyId, payload);
      this.pageTitleService.setPage(name, 'Ürün ailesi detayları');
    } else {
      const result = this.catalogService.addItem('urun-ailesi', payload);
      persisted = result.persisted;
      this.router.navigate(['/katalog/urun-ailesi', result.id], { replaceUrl: true });
    }

    this.formError = '';
    this.saveMessage = this.tsService.translate('Ürün ailesi kaydedildi.');
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
