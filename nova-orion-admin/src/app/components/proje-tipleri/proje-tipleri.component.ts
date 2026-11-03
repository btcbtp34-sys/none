import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectTypeService, ProjectTypeItem } from '../../services/project-type.service';
import { BrandService } from '../../services/brand.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-proje-tipleri',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proje-tipleri.component.html',
  styleUrl: './proje-tipleri.component.css'
})
export class ProjeTipleriComponent implements OnInit {
  projectTypeService = inject(ProjectTypeService);
  brandService = inject(BrandService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  // Search & Filter
  searchQuery = '';
  filterBrand: number | 'ALL' = 'ALL';

  // Form Fields
  formCode = '';
  formValue = '';
  formBrandId: number | null = null;
  formError = '';

  ngOnInit() {
    this.pageTitleService.setPage('Proje Tipi', 'Sistemde tanımlı proje tipleri ve kod - değer eşleştirmeleri');
  }

  filteredProjectTypes(): ProjectTypeItem[] {
    const query = this.searchQuery.trim().toLowerCase();
    const list = this.projectTypeService.projectTypes()
      .filter(item => this.filterBrand === 'ALL' || item.brandId === this.filterBrand);
    if (!query) return list;

    return list.filter(item =>
      item.code.toLowerCase().includes(query) ||
      item.value.toLowerCase().includes(query) ||
      this.tsService.translate(item.value).toLowerCase().includes(query) ||
      this.brandService.brandName(item.brandId).toLowerCase().includes(query)
    );
  }

  openModal(item?: ProjectTypeItem) {
    if (item) {
      this.editingId = item.id;
      this.formCode = item.code;
      this.formValue = item.value;
      this.formBrandId = item.brandId ?? null;
      this.formError = '';
    } else {
      this.editingId = null;
      this.formCode = '';
      this.formValue = '';
      this.formBrandId = null;
      this.formError = '';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formCode = '';
    this.formValue = '';
    this.formBrandId = null;
    this.formError = '';
  }

  saveProjectType() {
    const code = this.formCode.trim();
    const val = this.formValue.trim();

    if (!code || !val) {
      this.formError = this.tsService.translate('Lütfen hem kod hem de değer alanını doldurunuz.');
      return;
    }

    if (!this.formBrandId) {
      this.formError = this.tsService.translate('Lütfen bir marka seçiniz.');
      return;
    }

    if (this.editingId) {
      this.projectTypeService.updateProjectType(this.editingId, {
        code: code.toUpperCase(),
        value: val,
        brandId: this.formBrandId
      });
    } else {
      this.projectTypeService.addProjectType({
        code: code.toUpperCase(),
        value: val,
        brandId: this.formBrandId
      });
    }

    this.closeModal();
  }

  deleteProjectType(id: number) {
    if (confirm(this.tsService.translate('Bu proje tipini silmek istediğinizden emin misiniz?'))) {
      this.projectTypeService.deleteProjectType(id);
    }
  }
}
