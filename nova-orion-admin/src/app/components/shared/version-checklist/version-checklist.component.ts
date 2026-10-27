import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../../services/catalog.service';
import { TranslationService } from '../../../services/translation.service';

// Katalog > Versiyon kayıtlarından yuvarlak checkbox ile çoklu seçim; [(selectedIds)] ile bağlanır
@Component({
  selector: 'app-version-checklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './version-checklist.component.html',
  styleUrl: './version-checklist.component.css'
})
export class VersionChecklistComponent {
  catalogService = inject(CatalogService);
  tsService = inject(TranslationService);

  @Input() selectedIds: number[] = [];
  // true: seçenekler alt alta değil yan yana dizilir (dar alanlar, modal)
  @Input() inline = false;
  @Output() selectedIdsChange = new EventEmitter<number[]>();

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  toggle(id: number) {
    this.selectedIds = this.isSelected(id)
      ? this.selectedIds.filter(v => v !== id)
      : [...this.selectedIds, id];
    this.selectedIdsChange.emit(this.selectedIds);
  }
}
