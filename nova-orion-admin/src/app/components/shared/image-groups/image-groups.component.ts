import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProductImageGroupKey,
  ProductImageGroups,
  PRODUCT_IMAGE_GROUPS,
  emptyImageGroups
} from '../../../services/catalog.service';
import { TranslationService } from '../../../services/translation.service';

// Yüklenen görseller depolama alanını korumak için bu boyuta küçültülür
const MAX_IMAGE_SIZE = 1200;

// Görseller sekmesi (Photo, 3D Vectorial, Top View, Wiring Photo); ürün ve ürün ailesi detayında ortak.
// [(groups)] ile bağlanır
@Component({
  selector: 'app-image-groups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-groups.component.html',
  styleUrl: './image-groups.component.css'
})
export class ImageGroupsComponent {
  tsService = inject(TranslationService);

  @Input() groups: ProductImageGroups = emptyImageGroups();
  // Salt okunur: seçim değiştirilemez
  @Input() readOnly = false;
  @Output() groupsChange = new EventEmitter<ProductImageGroups>();

  imageGroups = PRODUCT_IMAGE_GROUPS;

  onImagesSelected(event: Event, group: ProductImageGroupKey) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'));
    input.value = '';

    files.forEach(file => {
      this.resizeImage(file).then(dataUrl => {
        this.emit({ ...this.groups, [group]: [...this.groups[group], dataUrl] });
      });
    });
  }

  removeImage(group: ProductImageGroupKey, index: number) {
    this.emit({ ...this.groups, [group]: this.groups[group].filter((_, i) => i !== index) });
  }

  private emit(groups: ProductImageGroups) {
    this.groups = groups;
    this.groupsChange.emit(groups);
  }

  private resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d')!;
          // Şeffaf PNG'ler JPEG'e çevrilirken siyah arka plan oluşmasın
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }
}
