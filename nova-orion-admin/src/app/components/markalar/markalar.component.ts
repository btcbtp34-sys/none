import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandService, BrandItem, BrandStatus } from '../../services/brand.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-markalar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './markalar.component.html',
  styleUrl: '../katalog/katalog.component.css'
})
export class MarkalarComponent implements OnInit {
  brandService = inject(BrandService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  searchQuery = '';

  // Form Fields
  formCode = '';
  formName = '';
  formDescription = '';
  formStatus: BrandStatus = 'Aktif';
  formError = '';

  ngOnInit() {
    this.pageTitleService.setPage('Markalar', 'İndirilenler, proje tipleri, kategoriler ve kullanıcıların bağlandığı markalar');
  }

  get filteredBrands(): BrandItem[] {
    const query = this.searchQuery.trim().toLowerCase();
    const list = this.brandService.brands();
    if (!query) return list;

    return list.filter(b =>
      b.code.toLowerCase().includes(query) ||
      b.name.toLowerCase().includes(query) ||
      this.tsService.translate(b.description).toLowerCase().includes(query)
    );
  }

  openModal(item?: BrandItem) {
    this.editingId = item?.id ?? null;
    this.formCode = item?.code ?? '';
    this.formName = item?.name ?? '';
    this.formDescription = item?.description ?? '';
    this.formStatus = item?.status ?? 'Aktif';
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  saveBrand() {
    const code = this.formCode.trim().toUpperCase();
    const name = this.formName.trim();

    if (!code || !name) {
      this.formError = this.tsService.translate('Lütfen kod ve marka adı alanlarını doldurunuz.');
      return;
    }

    if (this.brandService.brands().some(b => b.code === code && b.id !== this.editingId)) {
      this.formError = this.tsService.translate('Bu kod ile tanımlı bir marka zaten var.');
      return;
    }

    const payload = { code, name, description: this.formDescription.trim(), status: this.formStatus };
    if (this.editingId) {
      this.brandService.updateBrand(this.editingId, payload);
    } else {
      this.brandService.addBrand(payload);
    }

    this.closeModal();
  }

  deleteBrand(id: number) {
    if (confirm(this.tsService.translate('Bu markayı silmek istediğinizden emin misiniz?'))) {
      this.brandService.deleteBrand(id);
    }
  }
}
