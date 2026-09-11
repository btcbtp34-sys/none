import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModullerService, ModuleItem, ModuleSlide, ModuleCard, CardSeverity } from '../../services/moduller.service';
import { PageTitleService } from '../../services/page-title.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-moduller',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './moduller.component.html',
  styleUrl: './moduller.component.css'
})
export class ModullerComponent implements OnInit {
  modullerService = inject(ModullerService);
  pageTitleService = inject(PageTitleService);
  tsService = inject(TranslationService);

  selectedModuleKey = signal<string>('genel-bulgular');
  activeSlideIndex = signal<number>(0);
  searchFilter = signal<string>('');
  selectedSeverityFilter = signal<string>('TÜMÜ');

  // Modal State for adding/editing cards
  isModalOpen = signal<boolean>(false);
  editingCardId = signal<string | null>(null);
  formTitle = '';
  formSeverity: CardSeverity = 'KRİTİK';
  formBulletsText = '';
  formFooterNote = '';
  formIsFullWidth = false;

  severityOptions: CardSeverity[] = [
    'KRİTİK',
    'GELİŞTİRME',
    'STANDART',
    'FIRSAT',
    'UYGUN DEĞİL',
    'KISMEN UYGUN',
    'ÖNERİLEN'
  ];

  ngOnInit() {
    this.pageTitleService.setPage(
      'S/4HANA Değerlendirme Modülleri',
      'Geçiş analizi, modül bulguları ve önerilen dönüşüm yol haritası'
    );
  }

  get currentModule(): ModuleItem | undefined {
    return this.modullerService.getModuleByKey(this.selectedModuleKey());
  }

  get currentSlide(): ModuleSlide | undefined {
    const mod = this.currentModule;
    if (!mod || !mod.slides || mod.slides.length === 0) return undefined;
    const idx = Math.min(this.activeSlideIndex(), mod.slides.length - 1);
    return mod.slides[idx];
  }

  get availableSeveritiesInSlide(): { severity: CardSeverity; count: number }[] {
    const slide = this.currentSlide;
    if (!slide) return [];
    const counts = new Map<CardSeverity, number>();
    for (const card of slide.cards) {
      counts.set(card.severity, (counts.get(card.severity) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([severity, count]) => ({ severity, count }));
  }

  get filteredCards(): ModuleCard[] {
    const slide = this.currentSlide;
    if (!slide) return [];
    let list = slide.cards;

    const query = this.searchFilter().trim().toLowerCase();
    if (query) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.bullets.some(b => b.toLowerCase().includes(query)) ||
        (c.footerNote && c.footerNote.toLowerCase().includes(query))
      );
    }

    const sev = this.selectedSeverityFilter();
    if (sev !== 'TÜMÜ') {
      list = list.filter(c => c.severity === sev);
    }

    return list;
  }

  selectModule(key: string) {
    this.selectedModuleKey.set(key);
    this.activeSlideIndex.set(0);
    this.searchFilter.set('');
    this.selectedSeverityFilter.set('TÜMÜ');
  }

  setSlide(index: number) {
    this.activeSlideIndex.set(index);
    this.selectedSeverityFilter.set('TÜMÜ');
  }

  getSeverityClass(severity: CardSeverity): string {
    switch (severity) {
      case 'KRİTİK':
      case 'UYGUN DEĞİL':
        return 'severity-red';
      case 'GELİŞTİRME':
      case 'KISMEN UYGUN':
        return 'severity-amber';
      case 'STANDART':
      case 'ÖNERİLEN':
        return 'severity-green';
      case 'FIRSAT':
        return 'severity-blue';
      default:
        return 'severity-gray';
    }
  }

  openAddModal() {
    this.editingCardId.set(null);
    this.formTitle = '';
    this.formSeverity = 'KRİTİK';
    this.formBulletsText = '';
    this.formFooterNote = '';
    this.formIsFullWidth = false;
    this.isModalOpen.set(true);
  }

  openEditModal(card: ModuleCard) {
    this.editingCardId.set(card.id);
    this.formTitle = card.title;
    this.formSeverity = card.severity;
    this.formBulletsText = card.bullets.join('\n');
    this.formFooterNote = card.footerNote || '';
    this.formIsFullWidth = !!card.isFullWidth;
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveCard() {
    if (!this.formTitle.trim()) return;
    const slide = this.currentSlide;
    if (!slide) return;

    const bullets = this.formBulletsText
      .split('\n')
      .map(b => b.trim())
      .filter(b => b.length > 0);

    if (this.editingCardId()) {
      // Edit existing
      const card = slide.cards.find(c => c.id === this.editingCardId());
      if (card) {
        card.title = this.formTitle.trim();
        card.severity = this.formSeverity;
        card.bullets = bullets;
        card.footerNote = this.formFooterNote.trim() || undefined;
        card.isFullWidth = this.formIsFullWidth;
      }
    } else {
      // Add new
      const newCard: ModuleCard = {
        id: 'card-' + Date.now(),
        title: this.formTitle.trim(),
        severity: this.formSeverity,
        bullets: bullets,
        footerNote: this.formFooterNote.trim() || undefined,
        isFullWidth: this.formIsFullWidth
      };
      this.modullerService.addCard(this.selectedModuleKey(), slide.id, newCard);
    }

    this.closeModal();
  }
}
