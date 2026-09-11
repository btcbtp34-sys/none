import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService, LanguageItem } from '../../services/language.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dil-yonetimi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dil-yonetimi.component.html',
  styleUrl: './dil-yonetimi.component.css'
})
export class DilYonetimiComponent implements OnInit {
  langService = inject(LanguageService);
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  formCode = '';
  formName = '';
  formIsDefault = false;

  get canDeleteLanguage(): boolean {
    return this.authService.isSuperAdmin();
  }

  ngOnInit() {
    this.pageTitleService.setPage('Dil Yönetimi', 'Sistemde kullanılan dillerin tanımlanması ve durum yönetimi');
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: LanguageItem) {
    this.editingId = item.id;
    this.formCode = item.code;
    this.formName = item.name;
    this.formIsDefault = !!item.isDefault;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formIsDefault = false;
  }

  saveLanguage() {
    if (!this.formCode.trim() || !this.formName.trim()) return;

    if (this.editingId) {
      this.langService.updateLanguage(this.editingId, {
        code: this.formCode.trim().toLowerCase(),
        name: this.formName.trim(),
        isDefault: this.formIsDefault
      });
    } else {
      this.langService.addLanguage({
        code: this.formCode.trim().toLowerCase(),
        name: this.formName.trim(),
        isDefault: this.formIsDefault,
        status: 'Aktif'
      });
    }

    this.closeModal();
  }

  deleteLanguage(id: number) {
    if (!this.canDeleteLanguage) {
      alert('Dil silme yetkisi yalnızca Süper Admin (Super Admin) kullanıcısına aittir.');
      return;
    }
    if (confirm('Bu dili silmek istediğinizden emin misiniz?')) {
      this.langService.deleteLanguage(id);
    }
  }

  toggleStatus(id: number) {
    this.langService.toggleStatus(id);
  }
}
