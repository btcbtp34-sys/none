import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserManagementItem } from '../../services/user-management.service';
import { UserRoleService } from '../../services/user-role.service';
import { BrandService } from '../../services/brand.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-kullanici-yonetimi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kullanici-yonetimi.component.html',
  styleUrl: './kullanici-yonetimi.component.css'
})
export class KullaniciYonetimiComponent implements OnInit {
  userService = inject(UserManagementService);
  roleService = inject(UserRoleService);
  brandService = inject(BrandService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';
  filterRole = 'ALL';
  filterBrand: number | 'ALL' = 'ALL';

  // Form Fields
  formName = '';
  formEmail = '';
  formRoleCode = 'COUNTRY_ADMIN';
  formScope = 'Türkiye';
  formBrandIds: number[] = [];
  formStatus: 'Aktif' | 'Pasif' = 'Aktif';
  formError = '';

  availableRoles = [
    { code: 'SUPER_ADMIN', title: 'Süper Admin (Global)' },
    { code: 'REGION_ADMIN', title: 'Bölge Yöneticisi' },
    { code: 'COUNTRY_ADMIN', title: 'Ülke Yöneticisi' },
    { code: 'SALES_REP', title: 'Satış Temsilcisi' },
    { code: 'TECH_SUPPORT', title: 'Teknik Destek' }
  ];

  ngOnInit() {
    this.pageTitleService.setPage('Kullanıcı Yönetimi', 'Sistem kullanıcıları, atanmış roller ve yetki alanları');
  }

  filteredUsers(): UserManagementItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.userService.users();

    return list.filter(u => {
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.scope.toLowerCase().includes(q) ||
        this.tsService.translate(u.scope).toLowerCase().includes(q);

      const matchesRole = this.filterRole === 'ALL' || u.roleCode === this.filterRole;
      const matchesBrand = this.filterBrand === 'ALL' || (u.brandIds || []).includes(this.filterBrand);

      return matchesSearch && matchesRole && matchesBrand;
    });
  }

  openModal(item?: UserManagementItem) {
    if (item) {
      this.editingId = item.id;
      this.formName = item.name;
      this.formEmail = item.email;
      this.formRoleCode = item.roleCode;
      this.formScope = item.scope;
      this.formBrandIds = [...(item.brandIds || [])];
      this.formStatus = item.status;
      this.formError = '';
    } else {
      this.editingId = null;
      this.formName = '';
      this.formEmail = '';
      this.formRoleCode = 'COUNTRY_ADMIN';
      this.formScope = 'Türkiye';
      this.formBrandIds = [];
      this.formStatus = 'Aktif';
      this.formError = '';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  // Kayıtlı eski verilerde brandIds olmayabilir
  userBrandNames(user: UserManagementItem): string[] {
    return (user.brandIds || []).map(id => this.brandService.brandName(id)).filter(n => !!n);
  }

  isBrandSelected(id: number): boolean {
    return this.formBrandIds.includes(id);
  }

  toggleBrand(id: number) {
    this.formBrandIds = this.isBrandSelected(id)
      ? this.formBrandIds.filter(b => b !== id)
      : [...this.formBrandIds, id];
  }

  saveUser() {
    const name = this.formName.trim();
    const email = this.formEmail.trim();

    if (!name || !email) {
      this.formError = this.tsService.translate('Lütfen isim ve e-posta alanlarını eksiksiz doldurunuz.');
      return;
    }

    if (this.formBrandIds.length === 0) {
      this.formError = this.tsService.translate('Lütfen en az bir marka seçiniz.');
      return;
    }

    const matchedRole = this.availableRoles.find(r => r.code === this.formRoleCode);
    const roleTitle = matchedRole ? matchedRole.title : this.formRoleCode;

    if (this.editingId) {
      this.userService.updateUser(this.editingId, {
        name,
        email: email.toLowerCase(),
        roleCode: this.formRoleCode,
        roleTitle,
        scope: this.formScope.trim() || 'Global (Tüm Sistem)',
        brandIds: [...this.formBrandIds],
        status: this.formStatus
      });
    } else {
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      this.userService.addUser({
        name,
        email: email.toLowerCase(),
        roleCode: this.formRoleCode,
        roleTitle,
        scope: this.formScope.trim() || 'Global (Tüm Sistem)',
        brandIds: [...this.formBrandIds],
        status: this.formStatus,
        lastLogin: dateStr
      });
    }

    this.closeModal();
  }

  deleteUser(id: number) {
    if (confirm(this.tsService.translate('Bu kullanıcıyı sistemden silmek istediğinize emin misiniz?'))) {
      this.userService.deleteUser(id);
    }
  }
}
