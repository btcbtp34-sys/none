import { Injectable, signal } from '@angular/core';

export interface LanguageItem {
  id: number;
  code: string;
  name: string;
  direction?: 'LTR' | 'RTL';
  status: 'Aktif' | 'Pasif';
  isDefault?: boolean;
  badgeCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private languagesList = signal<LanguageItem[]>([
    { id: 1, code: 'tr', name: 'Türkçe', direction: 'LTR', status: 'Aktif', isDefault: true, badgeCode: 'TR' },
    { id: 2, code: 'en', name: 'English', direction: 'LTR', status: 'Aktif', isDefault: false, badgeCode: 'EN' },
    { id: 3, code: 'de', name: 'Deutsch', direction: 'LTR', status: 'Aktif', isDefault: false, badgeCode: 'DE' },
    { id: 4, code: 'fr', name: 'Français', direction: 'LTR', status: 'Pasif', isDefault: false, badgeCode: 'FR' },
    { id: 5, code: 'es', name: 'Español', direction: 'LTR', status: 'Pasif', isDefault: false, badgeCode: 'ES' },
  ]);

  languages = this.languagesList.asReadonly();

  addLanguage(lang: Omit<LanguageItem, 'id' | 'badgeCode'>) {
    const current = this.languagesList();
    const newId = current.length > 0 ? Math.max(...current.map(l => l.id)) + 1 : 1;
    const newItem: LanguageItem = {
      ...lang,
      id: newId,
      badgeCode: lang.code.toUpperCase()
    };
    this.languagesList.set([...current, newItem]);
  }

  updateLanguage(id: number, updated: Partial<Omit<LanguageItem, 'id'>>) {
    this.languagesList.set(
      this.languagesList().map(l => 
        l.id === id ? { 
          ...l, 
          ...updated, 
          badgeCode: updated.code ? updated.code.toUpperCase() : l.badgeCode 
        } : l
      )
    );
  }

  deleteLanguage(id: number) {
    this.languagesList.set(this.languagesList().filter(l => l.id !== id));
  }

  toggleStatus(id: number) {
    this.languagesList.set(
      this.languagesList().map(l => 
        l.id === id ? { ...l, status: l.status === 'Aktif' ? 'Pasif' : 'Aktif' } : l
      )
    );
  }
}
