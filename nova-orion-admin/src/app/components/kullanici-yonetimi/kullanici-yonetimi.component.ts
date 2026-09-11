import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserManagementService, UserManagementItem } from '../../services/user-management.service';
import { UserRoleService } from '../../services/user-role.service';
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
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';
  filterRole = 'ALL';

  // Form Fields
  formName = '';
  formEmail = '';
  formRoleCode = 'COUNTRY_ADMIN';
  formScope = 'Türkiye';
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
        u.scope.toLowerCase().includes(q);

      const matchesRole = this.filterRole === 'ALL' || u.roleCode === this.filterRole;

      return matchesSearch && matchesRole;
    });
  }

  openModal(item?: UserManagementItem) {
    if (item) {
      this.editingId = item.id;
      this.formName = item.name;
      this.formEmail = item.email;
      this.formRoleCode = item.roleCode;
      this.formScope = item.scope;
      this.formStatus = item.status;
      this.formError = '';
    } else {
      this.editingId = null;
      this.formName = '';
      this.formEmail = '';
      this.formRoleCode = 'COUNTRY_ADMIN';
      this.formScope = 'Türkiye';
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

  saveUser() {
    const name = this.formName.trim();
    const email = this.formEmail.trim();

    if (!name || !email) {
      this.formError = this.tsService.translate('Lütfen isim ve e-posta alanlarını eksiksiz doldurunuz.');
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
