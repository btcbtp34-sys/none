import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService, SystemParameterItem } from '../../services/system-settings.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-parametreler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametreler.component.html',
  styleUrl: './parametreler.component.css'
})
export class ParametrelerComponent implements OnInit {
  settingsService = inject(SystemSettingsService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';
  filterCategory = 'ALL';

  // Form
  formKey = '';
  formName = '';
  formCategory: 'Genel' | 'Güvenlik' | 'Sistem' | 'Entegrasyon' = 'Genel';
  formValue = '';
  formType: 'text' | 'number' | 'boolean' | 'select' = 'text';
  formDescription = '';
  formError = '';

  categories: ('Genel' | 'Güvenlik' | 'Sistem' | 'Entegrasyon')[] = [
    'Genel',
    'Güvenlik',
    'Sistem',
    'Entegrasyon'
  ];

  ngOnInit() {
    this.pageTitleService.setPage('Parametreler', 'Sistem parametreleri, operasyonel limitler ve konfigürasyon');
  }

  filteredParameters(): SystemParameterItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    const list = this.settingsService.parameters();

    return list.filter(p => {
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.value.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCat = this.filterCategory === 'ALL' || p.category === this.filterCategory;

      return matchesSearch && matchesCat;
    });
  }

  openModal(item?: SystemParameterItem) {
    if (item) {
      this.editingId = item.id;
      this.formKey = item.key;
      this.formName = item.name;
      this.formCategory = item.category;
      this.formValue = item.value;
      this.formType = item.type;
      this.formDescription = item.description;
      this.formError = '';
    } else {
      this.editingId = null;
      this.formKey = '';
      this.formName = '';
      this.formCategory = 'Genel';
      this.formValue = '';
      this.formType = 'text';
      this.formDescription = '';
      this.formError = '';
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
    this.formError = '';
  }

  saveParameter() {
    const key = this.formKey.trim();
    const name = this.formName.trim();
    const val = this.formValue.trim();

    if (!key || !name || !val) {
      this.formError = this.tsService.translate('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }

    if (this.editingId) {
      this.settingsService.updateParameter(this.editingId, {
        key: key.toUpperCase(),
        name,
        category: this.formCategory,
        value: val,
        type: this.formType,
        description: this.formDescription.trim()
      });
    } else {
      this.settingsService.addParameter({
        key: key.toUpperCase(),
        name,
        category: this.formCategory,
        value: val,
        type: this.formType,
        description: this.formDescription.trim()
      });
    }

    this.closeModal();
  }

  deleteParameter(id: number) {
    if (confirm(this.tsService.translate('Bu parametreyi silmek istediğinizden emin misiniz?'))) {
      this.settingsService.deleteParameter(id);
    }
  }

  toggleBoolean(item: SystemParameterItem) {
    this.settingsService.toggleBooleanParam(item.id);
  }
}
