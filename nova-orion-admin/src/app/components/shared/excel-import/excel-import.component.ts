import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';

// Ürün Ailesi ve Ürün listelerindeki "Excel ile Yükle" butonu: altında Şablon indir / Excel yükle seçenekleri
@Component({
  selector: 'app-excel-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './excel-import.component.html',
  styleUrl: './excel-import.component.css'
})
export class ExcelImportComponent {
  tsService = inject(TranslationService);
  private host = inject(ElementRef<HTMLElement>);

  menuOpen = false;

  // Menü dışına tıklanınca menü kapanır
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen && !this.host.nativeElement.contains(event.target as Node)) this.menuOpen = false;
  }
}
