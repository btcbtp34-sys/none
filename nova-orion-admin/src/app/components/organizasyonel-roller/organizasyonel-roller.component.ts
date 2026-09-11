import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRoleService, UserRoleItem } from '../../services/user-role.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-organizasyonel-roller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizasyonel-roller.component.html',
  styleUrl: './organizasyonel-roller.component.css'
})
export class OrganizasyonelRollerComponent implements OnInit {
  roleService = inject(UserRoleService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';

  // Form Fields
  formCode = '';
  formName = '';
  formDescription = '';
  formScope = 'Global (Tüm Sistem)';
  formStatus: 'Aktif' | 'Pasif' = 'Aktif';
  formPermissionsStr = '';
  formError = '';

  scopeOptions = [
    'Global (Tüm Sistem)',
    'Bölge Bazlı',
    'Ülke Bazlı',
    'Satış Kanalı',
    'Destek & Rehber'
  ];

  ngOnInit() {
    this.pageTitleService.setPage('Organizasyonel Roller', 'Sistemdeki roller, erişim yetkileri ve hiyerarşi');
  }

  filteredRoles(): UserRoleItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.roleService.roles();
    if (!q) return list;

    return list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }

  openModal(item?: UserRoleItem) {
    if (item) {
      this.editingId = item.id;
      this.formCode = item.code;
      this.formName = item.name;
      this.formDescription = item.description || '';
      this.formScope = item.scope;
      this.formStatus = item.status;
      this.formPermissionsStr = (item.permissions || []).join(', ');
      this.formError = '';
    } else {
      this.editingId = null;
      this.formCode = '';
      this.formName = '';
      this.formDescription = '';
      this.formScope = 'Global (Tüm Sistem)';
      this.formStatus = 'Aktif';
      this.formPermissionsStr = '';
      this.formError = '';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  saveRole() {
    const code = this.formCode.trim();
    const name = this.formName.trim();

    if (!code || !name) {
      this.formError = this.tsService.translate('Lütfen hem kod hem de rol adını doldurunuz.');
      return;
    }

    const permissions = this.formPermissionsStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    if (this.editingId) {
      this.roleService.updateRole(this.editingId, {
        code: code.toUpperCase(),
        name,
        description: this.formDescription.trim(),
        scope: this.formScope,
        status: this.formStatus,
        permissions: permissions.length > 0 ? permissions : ['Temel Erişim']
      });
    } else {
      this.roleService.addRole({
        code: code.toUpperCase(),
        name,
        description: this.formDescription.trim(),
        scope: this.formScope,
        userCount: 0,
        status: this.formStatus,
        permissions: permissions.length > 0 ? permissions : ['Temel Erişim']
      });
    }

    this.closeModal();
  }

  deleteRole(id: number) {
    if (confirm(this.tsService.translate('Bu rolü silmek istediğinizden emin misiniz?'))) {
      this.roleService.deleteRole(id);
    }
  }
}
