import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService, CountryItem } from '../../services/country.service';
import { RegionService } from '../../services/region.service';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

export interface PredefinedCountry {
  code: string;
  name: string;
  region: string;
  timezone: string;
  defaultLang: string;
  states?: string[];
}

export interface RegionCountryGroup {
  regionName: string;
  regionCode: string;
  countries: CountryItem[];
}

@Component({
  selector: 'app-ulkeler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ulkeler.component.html',
  styleUrl: './ulkeler.component.css'
})
export class UlkelerComponent implements OnInit {
  countryService = inject(CountryService);
  regionService = inject(RegionService);
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;
  searchQuery = '';

  formRegion = 'Avrupa';
  selectedPresetCode = '';
  formCode = '';
  formName = '';
  formState = '';
  formTimezone = 'Europe/Istanbul (UTC+03:00)';
  formStatus: 'Aktif' | 'Pasif' = 'Aktif';

  // Region-categorized countries
  allPredefinedCountries: PredefinedCountry[] = [
    // Avrupa (Europe)
    { code: 'TR', name: 'Türkiye', region: 'Avrupa', timezone: 'Europe/Istanbul (UTC+03:00)', defaultLang: 'Türkçe' },
    { code: 'DE', name: 'Almanya', region: 'Avrupa', timezone: 'Europe/Berlin (UTC+01:00)', defaultLang: 'Deutsch' },
    { code: 'GB', name: 'Birleşik Krallık', region: 'Avrupa', timezone: 'Europe/London (UTC+00:00)', defaultLang: 'English' },
    { code: 'FR', name: 'Fransa', region: 'Avrupa', timezone: 'Europe/Paris (UTC+01:00)', defaultLang: 'Français' },
    { code: 'IT', name: 'İtalya', region: 'Avrupa', timezone: 'Europe/Rome (UTC+01:00)', defaultLang: 'Italiano' },
    { code: 'ES', name: 'İspanya', region: 'Avrupa', timezone: 'Europe/Madrid (UTC+01:00)', defaultLang: 'Español' },
    { code: 'NL', name: 'Hollanda', region: 'Avrupa', timezone: 'Europe/Amsterdam (UTC+01:00)', defaultLang: 'English' },
    { code: 'AT', name: 'Avusturya', region: 'Avrupa', timezone: 'Europe/Vienna (UTC+01:00)', defaultLang: 'Deutsch' },
    { code: 'BE', name: 'Belçika', region: 'Avrupa', timezone: 'Europe/Brussels (UTC+01:00)', defaultLang: 'Français' },
    { code: 'CH', name: 'İsviçre', region: 'Avrupa', timezone: 'Europe/Zurich (UTC+01:00)', defaultLang: 'Deutsch' },
    { code: 'SE', name: 'İsveç', region: 'Avrupa', timezone: 'Europe/Stockholm (UTC+01:00)', defaultLang: 'English' },
    { code: 'NO', name: 'Norveç', region: 'Avrupa', timezone: 'Europe/Oslo (UTC+01:00)', defaultLang: 'English' },
    { code: 'DK', name: 'Danimarka', region: 'Avrupa', timezone: 'Europe/Copenhagen (UTC+01:00)', defaultLang: 'English' },
    { code: 'PL', name: 'Polonya', region: 'Avrupa', timezone: 'Europe/Warsaw (UTC+01:00)', defaultLang: 'English' },
    { code: 'PT', name: 'Portekiz', region: 'Avrupa', timezone: 'Europe/Lisbon (UTC+00:00)', defaultLang: 'English' },
    { code: 'GR', name: 'Yunanistan', region: 'Avrupa', timezone: 'Europe/Athens (UTC+02:00)', defaultLang: 'English' },

    // Asya Pasifik (Asia Pacific)
    { code: 'JP', name: 'Japonya', region: 'Asya Pasifik', timezone: 'Asia/Tokyo (UTC+09:00)', defaultLang: 'English' },
    { code: 'CN', name: 'Çin', region: 'Asya Pasifik', timezone: 'Asia/Shanghai (UTC+08:00)', defaultLang: 'English' },
    { code: 'KR', name: 'Güney Kore', region: 'Asya Pasifik', timezone: 'Asia/Seoul (UTC+09:00)', defaultLang: 'English' },
    { 
      code: 'AU', 
      name: 'Avustralya', 
      region: 'Asya Pasifik', 
      timezone: 'Australia/Sydney (UTC+10:00)', 
      defaultLang: 'English',
      states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
    },
    { code: 'SG', name: 'Singapur', region: 'Asya Pasifik', timezone: 'Asia/Singapore (UTC+08:00)', defaultLang: 'English' },
    { code: 'IN', name: 'Hindistan', region: 'Asya Pasifik', timezone: 'Asia/Kolkata (UTC+05:30)', defaultLang: 'English' },
    { code: 'NZ', name: 'Yeni Zelanda', region: 'Asya Pasifik', timezone: 'Pacific/Auckland (UTC+12:00)', defaultLang: 'English' },
    { code: 'TH', name: 'Tayland', region: 'Asya Pasifik', timezone: 'Asia/Bangkok (UTC+07:00)', defaultLang: 'English' },
    { code: 'MY', name: 'Malezya', region: 'Asya Pasifik', timezone: 'Asia/Kuala_Lumpur (UTC+08:00)', defaultLang: 'English' },
    { code: 'ID', name: 'Endonezya', region: 'Asya Pasifik', timezone: 'Asia/Jakarta (UTC+07:00)', defaultLang: 'English' },
    { code: 'PH', name: 'Filipinler', region: 'Asya Pasifik', timezone: 'Asia/Manila (UTC+08:00)', defaultLang: 'English' },
    { code: 'VN', name: 'Vietnam', region: 'Asya Pasifik', timezone: 'Asia/Ho_Chi_Minh (UTC+07:00)', defaultLang: 'English' },

    // Amerika (Americas)
    { 
      code: 'US', 
      name: 'Amerika Birleşik Devletleri', 
      region: 'Amerika', 
      timezone: 'America/New_York (UTC-05:00)', 
      defaultLang: 'English',
      states: [
        'California', 'Texas', 'Florida', 'New York', 'Pennsylvania',
        'Illinois', 'Ohio', 'Georgia', 'North Carolina', 'Michigan',
        'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Tennessee',
        'Massachusetts', 'Indiana', 'Missouri', 'Maryland', 'Wisconsin',
        'Colorado', 'Minnesota', 'South Carolina', 'Alabama', 'Louisiana'
      ]
    },
    { 
      code: 'CA', 
      name: 'Kanada', 
      region: 'Amerika', 
      timezone: 'America/Toronto (UTC-05:00)', 
      defaultLang: 'English',
      states: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Nova Scotia']
    },
    { 
      code: 'BR', 
      name: 'Brezilya', 
      region: 'Amerika', 
      timezone: 'America/Sao_Paulo (UTC-03:00)', 
      defaultLang: 'English',
      states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná']
    },
    { code: 'MX', name: 'Meksika', region: 'Amerika', timezone: 'America/Mexico_City (UTC-06:00)', defaultLang: 'Español' },
    { code: 'AR', name: 'Arjantin', region: 'Amerika', timezone: 'America/Argentina/Buenos_Aires (UTC-03:00)', defaultLang: 'Español' }
  ];

  // ALL languages pre-selected by default as requested!
  availableLanguages = [
    { code: 'TR', name: 'Türkçe', selected: true },
    { code: 'EN', name: 'English', selected: true },
    { code: 'DE', name: 'Deutsch', selected: true },
    { code: 'FR', name: 'Français', selected: true },
    { code: 'ES', name: 'Español', selected: true },
    { code: 'IT', name: 'Italiano', selected: true }
  ];

  ngOnInit() {
    this.pageTitleService.setPage('Ülkeler', 'Sistemde desteklenen ülke listesi ve bölge yapılandırması');
  }

  // Grouped and sorted countries list: Regions sorted alphabetically, Countries sorted alphabetically inside
  get groupedCountries(): RegionCountryGroup[] {
    const user = this.authService.currentUser();
    const query = this.searchQuery.trim().toLowerCase();

    // 1. Filter raw countries based on role and search query
    const filteredCountries = this.countryService.countries().filter(c => {
      if (this.authService.isCountryAdmin() && user.assignedCountry) {
        if (c.name.toLowerCase() !== user.assignedCountry.toLowerCase()) return false;
      } else if (this.authService.isRegionAdmin() && user.assignedRegion) {
        if (c.region.toLowerCase() !== user.assignedRegion.toLowerCase()) return false;
      }

      if (!query) return true;
      return c.name.toLowerCase().includes(query) || 
             c.code.toLowerCase().includes(query) || 
             c.region.toLowerCase().includes(query);
    });

    // 2. Identify distinct regions and sort them alphabetically
    const regionNames = Array.from(new Set(filteredCountries.map(c => c.region || 'Diğer'))).sort((a, b) => a.localeCompare(b, 'tr'));

    // 3. Construct grouped array with countries inside sorted alphabetically by name
    return regionNames.map(rName => {
      const matchedRegion = this.regionService.regions().find(r => r.name.toLowerCase() === rName.toLowerCase());
      const countriesInRegion = filteredCountries
        .filter(c => (c.region || 'Diğer').toLowerCase() === rName.toLowerCase())
        .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

      return {
        regionName: rName,
        regionCode: matchedRegion?.code || rName.substring(0, 3).toUpperCase(),
        countries: countriesInRegion
      };
    });
  }

  getCountriesForRegion(regionName: string): PredefinedCountry[] {
    return this.allPredefinedCountries
      .filter(c => c.region.toLowerCase() === regionName.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }

  getCurrentCountryStates(): string[] {
    const preset = this.allPredefinedCountries.find(c => c.code === this.selectedPresetCode || c.name === this.formName);
    if (preset && preset.states && preset.states.length > 0) {
      return preset.states;
    }
    if (this.isAmericasSelected()) {
      const usPreset = this.allPredefinedCountries.find(c => c.code === 'US');
      return usPreset?.states || [];
    }
    return [];
  }

  isAmericasSelected(): boolean {
    return this.formRegion === 'Amerika' || this.formRegion === 'AMER' || this.formCode.toUpperCase() === 'US';
  }

  hasStates(): boolean {
    return this.getCurrentCountryStates().length > 0;
  }

  onRegionChange() {
    const regionCountries = this.getCountriesForRegion(this.formRegion);
    if (regionCountries.length > 0) {
      this.selectPresetCountry(regionCountries[0]);
    } else {
      this.selectedPresetCode = 'CUSTOM';
      this.formState = '';
    }
  }

  onPresetChange() {
    if (this.selectedPresetCode === 'CUSTOM') {
      this.formCode = '';
      this.formName = '';
      this.formState = '';
      return;
    }
    const preset = this.allPredefinedCountries.find(c => c.code === this.selectedPresetCode);
    if (preset) {
      this.selectPresetCountry(preset);
    }
  }

  private selectPresetCountry(preset: PredefinedCountry) {
    this.selectedPresetCode = preset.code;
    this.formName = preset.name;
    this.formCode = preset.code;
    this.formTimezone = preset.timezone;
    if (preset.states && preset.states.length > 0) {
      this.formState = preset.states[0];
    } else {
      this.formState = '';
    }
  }

  openAddModal() {
    this.editingId = null;
    this.resetForm();
    // Ensure all languages are selected by default when adding a country
    this.availableLanguages.forEach(l => l.selected = true);
    this.showModal = true;
  }

  openEditModal(item: CountryItem) {
    this.editingId = item.id;
    this.formRegion = item.region || 'Avrupa';
    this.formCode = item.code;
    this.formName = item.name;
    this.formState = item.state || '';
    this.formTimezone = item.timezone || 'Europe/Istanbul (UTC+03:00)';
    this.formStatus = item.status;

    // Sync available languages
    this.availableLanguages.forEach(l => {
      l.selected = item.usedLanguages ? item.usedLanguages.includes(l.name) : true;
    });

    const matchedPreset = this.allPredefinedCountries.find(c => c.code.toUpperCase() === item.code.toUpperCase() || c.name.toLowerCase() === item.name.toLowerCase());
    this.selectedPresetCode = matchedPreset ? matchedPreset.code : 'CUSTOM';

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  resetForm() {
    this.formRegion = this.regionService.regions().length > 0 ? this.regionService.regions()[0].name : 'Avrupa';
    const regionCountries = this.getCountriesForRegion(this.formRegion);
    if (regionCountries.length > 0) {
      this.selectPresetCountry(regionCountries[0]);
    } else {
      this.selectedPresetCode = 'CUSTOM';
      this.formCode = '';
      this.formName = '';
      this.formState = '';
      this.formTimezone = 'Europe/Istanbul (UTC+03:00)';
    }
    this.formStatus = 'Aktif';
    this.availableLanguages.forEach(l => l.selected = true);
  }

  toggleLangSelection(lang: any) {
    lang.selected = !lang.selected;
  }

  saveCountry() {
    if (!this.formName.trim() || !this.formCode.trim()) return;

    const selectedLangs = this.availableLanguages.filter(l => l.selected).map(l => l.name);
    const stateValue = this.hasStates() && this.formState.trim() ? this.formState.trim() : undefined;
    const defaultLangValue = selectedLangs.length > 0 ? selectedLangs[0] : 'Türkçe';

    if (this.editingId) {
      this.countryService.updateCountry(this.editingId, {
        name: this.formName.trim(),
        code: this.formCode.trim().toUpperCase(),
        region: this.formRegion,
        state: stateValue,
        timezone: this.formTimezone,
        defaultLang: defaultLangValue,
        status: this.formStatus,
        usedLanguages: selectedLangs
      });
    } else {
      this.countryService.addCountry({
        name: this.formName.trim(),
        code: this.formCode.trim().toUpperCase(),
        region: this.formRegion,
        state: stateValue,
        timezone: this.formTimezone,
        defaultLang: defaultLangValue,
        status: this.formStatus,
        usedLanguages: selectedLangs
      });
    }

    this.closeModal();
  }

  deleteCountry(id: number) {
    if (confirm('Bu ülkeyi silmek istediğinizden emin misiniz?')) {
      this.countryService.deleteCountry(id);
    }
  }
}
