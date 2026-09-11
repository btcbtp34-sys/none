import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLang } from '../../services/translation.service';

export interface LanguageCard {
  code: SupportedLang;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

@Component({
  selector: 'app-frontend-language',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frontend-language.component.html',
  styleUrl: './frontend-language.component.css'
})
export class FrontendLanguageComponent {
  tsService = inject(TranslationService);

  languages: LanguageCard[] = [
    {
      code: 'tr',
      name: 'Türkçe',
      nativeName: 'Türkçe',
      flag: '🇹🇷',
      description: 'Türkiye ve çevre bölgeler için varsayılan sistem dili.'
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English (US / UK)',
      flag: '🇬🇧',
      description: 'International business standard language for global operations.'
    },
    {
      code: 'de',
      name: 'Almanca',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      description: 'Zentraleuropäische Sprachkonfiguration für Deutschland, Österreich und Schweiz.'
    },
    {
      code: 'fr',
      name: 'Fransızca',
      nativeName: 'Français',
      flag: '🇫🇷',
      description: 'Configuration linguistique pour les régions francophones européennes et mondiales.'
    }
  ];

  selectLanguage(lang: SupportedLang) {
    this.tsService.setLanguage(lang);
  }
}
