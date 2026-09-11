import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../services/translation.service';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-frontend-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frontend-faq.component.html',
  styleUrl: './frontend-faq.component.css'
})
export class FrontendFaqComponent {
  tsService = inject(TranslationService);

  searchQuery = '';
  selectedCategory = 'Tümü';

  categories = ['Tümü', 'Proje Yönetimi', 'Sistem & Donanım', 'Hesap & Yetki', 'Teknik Destek'];

  faqList: FaqItem[] = [
    {
      id: 'f1',
      question: 'Yeni bir projeyi nasıl başlatabilir ve konfigüre edebilirim?',
      answer: 'Ana sayfada bulunan "Yeni Proje Oluştur" kartına tıklayarak açılan pencereden Proje Adı, Proje Tipi ve Ülke bilgilerini girerek projenizi anında başlatabilirsiniz. Oluşturulan proje çalışma listenize otomatik olarak kaydedilir.',
      category: 'Proje Yönetimi',
      isOpen: true
    },
    {
      id: 'f2',
      question: 'Kayıtlı projelerime nereden erişebilirim?',
      answer: 'Ana sayfadaki "Proje Aç" butonunu kullanarak veya aşağıdaki "Son Projeler" tablosundan dilediğiniz projeyi doğrudan açıp operasyonel detaylarına ulaşabilirsiniz.',
      category: 'Proje Yönetimi',
      isOpen: false
    },
    {
      id: 'f3',
      question: 'Project Nova ile Project Orion arasındaki temel farklar nelerdir?',
      answer: 'Project Nova; bölge, ülke, satış kanalları ve sistem operasyonlarının yönetildiği kurumsal platformdur. Project Orion ise merkezi veri yönetimi, distribütör ağı ve küresel varlık senkronizasyonunu sağlayan üst düzey platformdur.',
      category: 'Sistem & Donanım',
      isOpen: false
    },
    {
      id: 'f4',
      question: 'Arayüz dilini nasıl değiştirebilirim?',
      answer: 'Üst menüdeki bayrak simgelerine tıklayarak (TR, EN, DE, FR) ya da "Dil Seçenekleri" sayfasına giderek sistem dilini anında tüm arayüz için değiştirebilirsiniz.',
      category: 'Hesap & Yetki',
      isOpen: false
    },
    {
      id: 'f5',
      question: 'Teknik çizim ve katalogları nereden indirebilirim?',
      answer: 'Üst menüde yer alan "İndirilenler" linkine tıklayarak tüm resmi PDF katalogları, DWG çizim dosyalarını ve yazılım paketlerini tek tıkla cihazınıza indirebilirsiniz.',
      category: 'Teknik Destek',
      isOpen: false
    }
  ];

  get filteredFaqs(): FaqItem[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.faqList.filter(f => {
      const matchCat = this.selectedCategory === 'Tümü' || f.category === this.selectedCategory;
      const matchQuery = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }

  toggleFaq(item: FaqItem) {
    item.isOpen = !item.isOpen;
  }
}
