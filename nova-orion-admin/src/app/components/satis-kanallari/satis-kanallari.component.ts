import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesChannelService, SalesChannelItem } from '../../services/sales-channel.service';
import { CountryService } from '../../services/country.service';
import { RegionService } from '../../services/region.service';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-satis-kanallari',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './satis-kanallari.component.html',
  styleUrl: './satis-kanallari.component.css'
})
export class SatisKanallariComponent implements OnInit {
  channelService = inject(SalesChannelService);
  countryService = inject(CountryService);
  regionService = inject(RegionService);
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';
  filterCountry = 'ALL';
  filterStatus = 'ALL';

  // Form Fields
  formBrandName = '';
  formCode = '';
  formRegion = 'Avrupa';
  selectedCountries: string[] = [];
  selectedProducts: string[] = [];
  formStatus: 'Aktif' | 'Pasif' = 'Aktif';
  formDescription = '';

  // Modal Search Filter Fields
  productSearchQuery = '';
  countrySearchQuery = '';

  ngOnInit() {
    this.pageTitleService.setPage('Satış Kanalları', 'Marka, ülke eşleştirmeleri ve ilişkili ürün dağıtım yönetimi');
  }

  // Filtered available products for modal multi-select
  get filteredAvailableProducts(): string[] {
    const q = this.productSearchQuery.trim().toLowerCase();
    if (!q) return this.channelService.availableProducts;
    return this.channelService.availableProducts.filter(p => p.toLowerCase().includes(q));
  }

  // Filtered available countries for modal multi-select
  get filteredAvailableCountries(): string[] {
    const q = this.countrySearchQuery.trim().toLowerCase();
    if (!q) return this.availableCountriesList;
    return this.availableCountriesList.filter(c => c.toLowerCase().includes(q));
  }

  selectAllProducts() {
    this.selectedProducts = [...this.channelService.availableProducts];
  }

  clearAllProducts() {
    this.selectedProducts = [];
  }

  selectAllCountries() {
    this.selectedCountries = [...this.availableCountriesList];
  }

  clearAllCountries() {
    this.selectedCountries = [];
  }

  // Get filtered channels based on role and search filters
  get filteredChannels(): SalesChannelItem[] {
    const query = this.searchQuery.trim().toLowerCase();
    const user = this.authService.currentUser();

    return this.channelService.channels().filter(item => {
      // Role-based visibility
      if (this.authService.isCountryAdmin() && user.assignedCountry) {
        if (!item.countries.includes(user.assignedCountry)) return false;
      } else if (this.authService.isRegionAdmin() && user.assignedRegion) {
        if (item.region && item.region.toLowerCase() !== user.assignedRegion.toLowerCase()) return false;
      }

      // Search query filter
      const matchesSearch = !query || 
        item.brandName.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query) ||
        item.countries.some(c => c.toLowerCase().includes(query)) ||
        item.products.some(p => p.toLowerCase().includes(query));

      // Country & Status filters
      const matchesCountry = this.filterCountry === 'ALL' || item.countries.includes(this.filterCountry);
      const matchesStatus = this.filterStatus === 'ALL' || item.status === this.filterStatus;

      return matchesSearch && matchesCountry && matchesStatus;
    });
  }

  get availableCountriesList(): string[] {
    const list = this.countryService.countries().map(c => c.name);
    return Array.from(new Set(list)).sort();
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(item: SalesChannelItem) {
    this.editingId = item.id;
    this.formBrandName = item.brandName;
    this.formCode = item.code;
    this.formRegion = item.region || 'Avrupa';
    this.selectedCountries = [...item.countries];
    this.selectedProducts = [...item.products];
    this.formStatus = item.status;
    this.formDescription = item.description || '';
    this.productSearchQuery = '';
    this.countrySearchQuery = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formBrandName = '';
    this.formCode = 'SC-' + Math.floor(100 + Math.random() * 900);
    this.formRegion = 'Avrupa';
    this.selectedCountries = this.authService.isCountryAdmin() && this.authService.currentUser().assignedCountry ? [this.authService.currentUser().assignedCountry!] : ['Türkiye'];
    this.selectedProducts = [this.channelService.availableProducts[0], this.channelService.availableProducts[1]];
    this.formStatus = 'Aktif';
    this.formDescription = '';
    this.productSearchQuery = '';
    this.countrySearchQuery = '';
  }

  toggleCountrySelection(countryName: string) {
    const idx = this.selectedCountries.indexOf(countryName);
    if (idx > -1) {
      this.selectedCountries.splice(idx, 1);
    } else {
      this.selectedCountries.push(countryName);
    }
  }

  isCountrySelected(countryName: string): boolean {
    return this.selectedCountries.includes(countryName);
  }

  toggleProductSelection(productName: string) {
    const idx = this.selectedProducts.indexOf(productName);
    if (idx > -1) {
      this.selectedProducts.splice(idx, 1);
    } else {
      this.selectedProducts.push(productName);
    }
  }

  isProductSelected(productName: string): boolean {
    return this.selectedProducts.includes(productName);
  }

  saveChannel() {
    if (!this.formBrandName.trim() || !this.formCode.trim()) return;

    if (this.editingId) {
      this.channelService.updateChannel(this.editingId, {
        brandName: this.formBrandName.trim(),
        code: this.formCode.trim(),
        region: this.formRegion,
        countries: this.selectedCountries,
        products: this.selectedProducts,
        status: this.formStatus,
        description: this.formDescription.trim()
      });
    } else {
      this.channelService.addChannel({
        brandName: this.formBrandName.trim(),
        code: this.formCode.trim(),
        region: this.formRegion,
        countries: this.selectedCountries,
        products: this.selectedProducts,
        status: this.formStatus,
        description: this.formDescription.trim()
      });
    }

    this.closeModal();
  }

  deleteChannel(id: number) {
    if (confirm('Bu satış kanalını silmek istediğinizden emin misiniz?')) {
      this.channelService.deleteChannel(id);
    }
  }
}
