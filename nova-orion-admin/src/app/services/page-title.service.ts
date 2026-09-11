import { Injectable, signal } from '@angular/core';

export interface PageMeta {
  title: string;
  subtitle: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {
  meta = signal<PageMeta>({
    title: 'Dil Yönetimi',
    subtitle: 'Sistem dillerini ve kodlarını yönetin'
  });

  setPage(title: string, subtitle: string = '') {
    this.meta.set({ title, subtitle });
  }
}
