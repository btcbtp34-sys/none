import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService, CatalogItem, CatalogStatus } from '../../services/catalog.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';
import { CountryTreeComponent } from '../shared/country-tree/country-tree.component';
import { VersionChecklistComponent } from '../shared/version-checklist/version-checklist.component';

// Ürün Ailesi detay sayfası: üstte genel bilgiler, altında ilişkiler (uyumlu versiyonlar, ülkeler)
@Component({
  selector: 'app-urun-ailesi-detay',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CountryTreeComponent, VersionChecklistComponent],
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

  // İlişkiler
  formVersionIds: number[] = [];
  formCountryIds: number[] = [];

  formError = '';
  saveMessage = '';

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
    this.formVersionIds = [...(family?.versionIds ?? [])];
    this.formCountryIds = [...(family?.countryIds ?? [])];
    this.formError = '';
    this.saveMessage = '';

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
      status: this.formStatus
    };

    if (this.familyId !== null) {
      this.catalogService.updateItem('urun-ailesi', this.familyId, payload);
      this.pageTitleService.setPage(name, 'Ürün ailesi detayları');
    } else {
      const result = this.catalogService.addItem('urun-ailesi', payload);
      this.router.navigate(['/katalog/urun-ailesi', result.id], { replaceUrl: true });
    }

    this.formError = '';
    this.saveMessage = this.tsService.translate('Ürün ailesi kaydedildi.');
  }

  private showError(message: string) {
    this.formError = this.tsService.translate(message);
  }
}
