export type SupportedLang = 'tr' | 'en' | 'de' | 'fr';

// tr ve en zorunlu; de/fr verilmezse İngilizce gösterilir (Türkçe metin asla yabancı dilde görünmez)
export type TranslationEntry = { tr: string; en: string; de?: string; fr?: string };

export type TranslationEntries = Record<string, TranslationEntry>;
