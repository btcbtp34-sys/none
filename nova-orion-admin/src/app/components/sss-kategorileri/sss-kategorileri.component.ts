import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqCategoryService, FaqCategoryItem, CategoryModuleType } from '../../services/faq-category.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-sss-kategorileri',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sss-kategorileri.component.html',
  styleUrl: './sss-kategorileri.component.css'
})
export class SssKategorileriComponent implements OnInit {
  catService = inject(FaqCategoryService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  selectedModuleFilter: 'ALL' | CategoryModuleType = 'ALL';

  formCategoryName = '';
  formModule: CategoryModuleType = 'SSS';
  formDescription = '';

  ngOnInit() {
    this.pageTitleService.setPage('Kategoriler', 'SSS, Eğitim ve Bize Ulaşın modülleri için merkezi kategori yönetimi');
  }

  get categoryList(): FaqCategoryItem[] {
    if (this.selectedModuleFilter === 'ALL') {
      return this.catService.categories();
    }
    return this.catService.categories().filter(c => c.module === this.selectedModuleFilter);
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: FaqCategoryItem) {
    this.editingId = item.id;
    this.formCategoryName = item.name;
    this.formModule = item.module || 'SSS';
    this.formDescription = item.description;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formCategoryName = '';
    this.formModule = this.selectedModuleFilter !== 'ALL' ? this.selectedModuleFilter : 'SSS';
    this.formDescription = '';
  }

  saveCategory() {
    if (!this.formCategoryName.trim()) return;

    if (this.editingId) {
      this.catService.updateCategory(this.editingId, {
        name: this.formCategoryName.trim(),
        module: this.formModule,
        description: this.formDescription.trim(),
        status: 'Aktif'
      });
    } else {
      this.catService.addCategory({
        name: this.formCategoryName.trim(),
        module: this.formModule,
        description: this.formDescription.trim(),
        status: 'Aktif'
      });
    }

    this.closeModal();
  }

  deleteCategory(id: number) {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      this.catService.deleteCategory(id);
    }
  }

  toggleCategoryStatus(id: number) {
    this.catService.toggleStatus(id);
  }
}
