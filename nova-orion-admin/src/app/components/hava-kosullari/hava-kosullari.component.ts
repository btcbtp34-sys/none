import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherItem } from '../../services/weather.service';
import { CountryService } from '../../services/country.service';
import { AuthService } from '../../services/auth.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-hava-kosullari',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hava-kosullari.component.html',
  styleUrl: './hava-kosullari.component.css'
})
export class HavaKosullariComponent implements OnInit {
  weatherService = inject(WeatherService);
  countryService = inject(CountryService);
  authService = inject(AuthService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  showModal = false;
  editingId: number | null = null;

  // Filter properties
  searchQuery = '';
  filterCountry = 'ALL';
  filterStatus = 'ALL';

  // Form Properties (Yaz Kuru, Kış Kuru & Rakım)
  formCountry = 'Türkiye';
  formStatus: 'Active' | 'Passive' = 'Active';
  formCityName = '';
  formAltitude: number = 0;
  formSummerDryBulb: number = 33;
  formWinterDryBulb: number = -15;

  ngOnInit() {
    this.pageTitleService.setPage('Weather Conditions', 'Şehir ve bölge bazlı hava durumu yapılandırması');
  }

  // Country admin only sees their own country
  get userAllowedCountries(): string[] {
    const user = this.authService.currentUser();
    if (this.authService.isCountryAdmin() && user.assignedCountry) {
      return [user.assignedCountry];
    }
    const list = this.weatherService.weatherData().map(w => w.country);
    const fromCountries = this.countryService.countries().map(c => c.name);
    return Array.from(new Set([...list, ...fromCountries])).filter(Boolean).sort();
  }

  getDistinctCountries(): string[] {
    return this.userAllowedCountries;
  }

  filteredWeatherList(): WeatherItem[] {
    const user = this.authService.currentUser();
    const query = this.searchQuery.trim().toLowerCase();

    return this.weatherService.weatherData().filter(item => {
      // Role-based visibility: Country Admin only sees their own country!
      if (this.authService.isCountryAdmin() && user.assignedCountry) {
        if (item.country.toLowerCase() !== user.assignedCountry.toLowerCase()) return false;
      }

      const matchesSearch = !query || 
        item.city.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query) ||
        (item.altitude != null && item.altitude.toString().includes(query));
      
      const matchesCountry = this.filterCountry === 'ALL' || item.country.toLowerCase() === this.filterCountry.toLowerCase();
      const matchesStatus = this.filterStatus === 'ALL' || item.status.toLowerCase() === this.filterStatus.toLowerCase();

      return matchesSearch && matchesCountry && matchesStatus;
    });
  }

  isFilterActive(): boolean {
    return this.searchQuery.trim() !== '' || this.filterCountry !== 'ALL' || this.filterStatus !== 'ALL';
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterCountry = 'ALL';
    this.filterStatus = 'ALL';
  }

  openModal(item?: WeatherItem) {
    const defaultCountry = this.authService.isCountryAdmin() && this.authService.currentUser().assignedCountry 
      ? this.authService.currentUser().assignedCountry! 
      : 'Türkiye';

    if (item) {
      this.editingId = item.id;
      this.formCountry = item.country || defaultCountry;
      this.formStatus = item.status || 'Active';
      this.formCityName = item.city;
      this.formAltitude = item.altitude != null ? Number(item.altitude) : 0;
      this.formSummerDryBulb = Number(item.summerDryBulb);
      this.formWinterDryBulb = Number(item.winterDryBulb);
    } else {
      this.editingId = null;
      this.formCountry = defaultCountry;
      this.formStatus = 'Active';
      this.formCityName = '';
      this.formAltitude = 0;
      this.formSummerDryBulb = 33;
      this.formWinterDryBulb = -15;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  saveCity() {
    if (!this.formCityName.trim()) return;

    if (this.editingId) {
      this.weatherService.updateWeather(this.editingId, {
        country: this.formCountry.trim(),
        status: this.formStatus,
        city: this.formCityName.trim(),
        altitude: Number(this.formAltitude) || 0,
        summerDryBulb: Number(this.formSummerDryBulb),
        winterDryBulb: Number(this.formWinterDryBulb)
      });
    } else {
      this.weatherService.addWeather({
        country: this.formCountry.trim(),
        status: this.formStatus,
        city: this.formCityName.trim(),
        altitude: Number(this.formAltitude) || 0,
        summerDryBulb: Number(this.formSummerDryBulb),
        winterDryBulb: Number(this.formWinterDryBulb)
      });
    }

    this.closeModal();
  }

  deleteCity(id: number) {
    if (confirm('Bu şehri silmek istediğinizden emin misiniz?')) {
      this.weatherService.deleteWeather(id);
    }
  }
}
