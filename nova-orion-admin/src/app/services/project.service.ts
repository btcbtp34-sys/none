import { Injectable, signal } from '@angular/core';

export interface ProjectInfo {
  id: 'nova' | 'orion';
  name: string;
  code: string;
  tagline: string;
  titleColor: string;
  gradient: string;
  initials: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Record<'nova' | 'orion', ProjectInfo> = {
    nova: {
      id: 'nova',
      name: 'Project Nova',
      code: 'NOVA',
      tagline: 'Sistem & Operasyon Yönetim Portalı',
      titleColor: '#e11d48', // Nova: Kırmızı logo yazısı
      gradient: 'linear-gradient(90deg, #ec4899 0%, #06b6d4 35%, #3b82f6 70%, #10b981 100%)',
      initials: 'PN'
    },
    orion: {
      id: 'orion',
      name: 'Project Orion',
      code: 'ORION',
      tagline: 'Kurumsal Varlık & Veri Platformu',
      titleColor: '#0f172a', // Orion: Siyah logo yazısı
      gradient: 'linear-gradient(90deg, #e11d48 0%, #06b6d4 35%, #3b82f6 70%, #10b981 100%)',
      initials: 'PO'
    }
  };

  currentProject = signal<ProjectInfo>(this.projects.nova);

  setProject(projectId: 'nova' | 'orion') {
    this.currentProject.set(this.projects[projectId]);
  }

  toggleProject() {
    const next = this.currentProject().id === 'nova' ? 'orion' : 'nova';
    this.setProject(next);
  }
}
