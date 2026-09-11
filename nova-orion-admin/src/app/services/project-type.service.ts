import { Injectable, signal } from '@angular/core';

export interface ProjectTypeItem {
  id: number;
  code: string;
  value: string;
}

const STORAGE_KEY = 'nova_orion_project_types';

const INITIAL_PROJECT_TYPES: ProjectTypeItem[] = [
  { id: 1, code: 'KONUT', value: 'Konut' },
  { id: 2, code: 'TICARI', value: 'Ticari' },
  { id: 3, code: 'HASTANE', value: 'Hastane & Sağlık' },
  { id: 4, code: 'OTEL', value: 'Otel & Konaklama' },
  { id: 5, code: 'ENDUSTRIYEL', value: 'Endüstriyel Tesis' },
  { id: 6, code: 'OFIS', value: 'Ofis & Plaza' },
  { id: 7, code: 'EGITIM', value: 'Eğitim Kurumu' },
  { id: 8, code: 'AVM', value: 'Alışveriş Merkezi' }
];

@Injectable({
  providedIn: 'root'
})
export class ProjectTypeService {
  private projectTypeList = signal<ProjectTypeItem[]>(this.loadInitialData());

  projectTypes = this.projectTypeList.asReadonly();

  private loadInitialData(): ProjectTypeItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to initial list on parse error
    }
    return INITIAL_PROJECT_TYPES;
  }

  private persist(data: ProjectTypeItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  addProjectType(item: Omit<ProjectTypeItem, 'id'>) {
    const current = this.projectTypeList();
    const newId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
    const updated = [{ ...item, id: newId }, ...current];
    this.projectTypeList.set(updated);
    this.persist(updated);
  }

  updateProjectType(id: number, updated: Partial<ProjectTypeItem>) {
    const next = this.projectTypeList().map(p =>
      p.id === id ? { ...p, ...updated } : p
    );
    this.projectTypeList.set(next);
    this.persist(next);
  }

  deleteProjectType(id: number) {
    const next = this.projectTypeList().filter(p => p.id !== id);
    this.projectTypeList.set(next);
    this.persist(next);
  }
}
