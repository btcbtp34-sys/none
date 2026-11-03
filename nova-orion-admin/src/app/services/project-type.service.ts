import { Injectable, signal } from '@angular/core';

export interface ProjectTypeItem {
  id: number;
  code: string;
  value: string;
  brandId: number | null;
}

const STORAGE_KEY = 'nova_orion_project_types';

const INITIAL_PROJECT_TYPES: ProjectTypeItem[] = [
  { id: 1, code: 'KONUT', value: 'Konut', brandId: 1 },
  { id: 2, code: 'TICARI', value: 'Ticari', brandId: 2 },
  { id: 3, code: 'HASTANE', value: 'Hastane & Sağlık', brandId: 1 },
  { id: 4, code: 'OTEL', value: 'Otel & Konaklama', brandId: 2 },
  { id: 5, code: 'ENDUSTRIYEL', value: 'Endüstriyel Tesis', brandId: 1 },
  { id: 6, code: 'OFIS', value: 'Ofis & Plaza', brandId: 2 },
  { id: 7, code: 'EGITIM', value: 'Eğitim Kurumu', brandId: 1 },
  { id: 8, code: 'AVM', value: 'Alışveriş Merkezi', brandId: 2 }
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
