import { Injectable, signal } from '@angular/core';

export interface CountryItem {
  id: number;
  code: string;
  name: string;
  region: string;
  state?: string;
  defaultLang: string;
  usedLanguages: string[];
  timezone: string;
  status: 'Aktif' | 'Pasif';
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countriesList = signal<CountryItem[]>([
    { id: 1, code: 'TR', name: 'Türkiye', region: 'Avrupa', defaultLang: 'Türkçe (TR)', usedLanguages: ['Türkçe'], timezone: 'Europe/Istanbul', status: 'Aktif' },
    { id: 2, code: 'DE', name: 'Almanya', region: 'Avrupa', defaultLang: 'Deutsch (DE)', usedLanguages: ['Deutsch'], timezone: 'Europe/Berlin', status: 'Aktif' },
    { id: 3, code: 'GB', name: 'Birleşik Krallık', region: 'Avrupa', defaultLang: 'English (EN)', usedLanguages: ['English'], timezone: 'Europe/London', status: 'Aktif' },
    { id: 4, code: 'FR', name: 'Fransa', region: 'Avrupa', defaultLang: 'Français (FR)', usedLanguages: ['Français'], timezone: 'Europe/Paris', status: 'Aktif' },
    { id: 5, code: 'US', name: 'Amerika Birleşik Devletleri', region: 'Amerika', state: 'California', defaultLang: 'English (EN)', usedLanguages: ['English', 'Español'], timezone: 'America/New_York', status: 'Aktif' },
    { id: 6, code: 'JP', name: 'Japonya', region: 'Asya Pasifik', defaultLang: 'English (EN)', usedLanguages: ['English'], timezone: 'Asia/Tokyo', status: 'Aktif' },
    { id: 7, code: 'IT', name: 'İtalya', region: 'Avrupa', defaultLang: 'IT', usedLanguages: ['IT'], timezone: 'Europe/Rome', status: 'Aktif' },
    { id: 8, code: 'ES', name: 'İspanya', region: 'Avrupa', defaultLang: 'Español (ES)', usedLanguages: ['Español'], timezone: 'Europe/Madrid', status: 'Aktif' },
    { id: 9, code: 'NL', name: 'Hollanda', region: 'Avrupa', defaultLang: 'English (EN)', usedLanguages: ['English'], timezone: 'Europe/Amsterdam', status: 'Aktif' },
  ]);

  countries = this.countriesList.asReadonly();

  addCountry(country: Omit<CountryItem, 'id'>) {
    const current = this.countriesList();
    const newId = current.length > 0 ? Math.max(...current.map(c => c.id)) + 1 : 1;
    this.countriesList.set([...current, { ...country, id: newId }]);
  }

  updateCountry(id: number, updated: Partial<CountryItem>) {
    this.countriesList.set(
      this.countriesList().map(c => 
        c.id === id ? { ...c, ...updated } : c
      )
    );
  }

  deleteCountry(id: number) {
    this.countriesList.set(this.countriesList().filter(c => c.id !== id));
  }

  toggleStatus(id: number) {
    this.countriesList.set(this.countriesList().map(c => 
      c.id === id ? { ...c, status: c.status === 'Aktif' ? 'Pasif' : 'Aktif' } : c
    ));
  }

  getCountriesByRegion(regionName: string): CountryItem[] {
    return this.countriesList().filter(c => c.region.toLowerCase() === regionName.toLowerCase());
  }
}
