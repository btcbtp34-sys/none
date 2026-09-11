import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegionService, RegionItem } from '../../services/region.service';
import { CountryService } from '../../services/country.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-bolgeler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bolgeler.component.html',
  styleUrl: './bolgeler.component.css'
})
export class BolgelerComponent implements OnInit {
  regionService = inject(RegionService);
  countryService = inject(CountryService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  formCode = '';
  formName = '';
  formDescription = '';
  formStatus: 'Aktif' | 'Pasif' = 'Aktif';

  ngOnInit() {
    this.pageTitleService.setPage(
      this.tsService.translate('Bölgeler'),
      this.tsService.translate('Sistemde tanımlı coğrafi bölgeler ve ülke eşleştirmeleri')
    );
  }

  getCountryCount(regionName: string): number {
    return this.countryService.countries().filter(c => c.region === regionName).length;
  }

  getCountriesInRegion(regionName: string) {
    return this.countryService.countries().filter(c => c.region === regionName);
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: RegionItem) {
    this.editingId = item.id;
    this.formCode = item.code;
    this.formName = item.name;
    this.formDescription = item.description || '';
    this.formStatus = item.status;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formDescription = '';
    this.formStatus = 'Aktif';
  }

  saveRegion() {
    if (!this.formName.trim() || !this.formCode.trim()) return;

    if (this.editingId) {
      this.regionService.updateRegion(this.editingId, {
        name: this.formName.trim(),
        code: this.formCode.trim().toUpperCase(),
        description: this.formDescription.trim(),
        status: this.formStatus
      });
    } else {
      this.regionService.addRegion({
        name: this.formName.trim(),
        code: this.formCode.trim().toUpperCase(),
        description: this.formDescription.trim(),
        status: this.formStatus
      });
    }

    this.closeModal();
  }

  deleteRegion(id: number) {
    if (confirm('Bu bölgeyi silmek istediğinizden emin misiniz?')) {
      this.regionService.deleteRegion(id);
    }
  }
}
