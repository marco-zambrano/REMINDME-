import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category.model';

const STORAGE_KEY = 'remindme.categories.v1';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Personal', slug: 'personal', icon: 'label', color: 'bg-blue-500' },
  { name: 'Trabajo', slug: 'trabajo', icon: 'label', color: 'bg-purple-500' },
  { name: 'Compras', slug: 'compras', icon: 'label', color: 'bg-green-500' },
  { name: 'Salud', slug: 'salud', icon: 'label', color: 'bg-red-500' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>(this.load());
  categories$ = this.categoriesSubject.asObservable();

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  addCategory(input: { name: string; icon?: string; color?: string }): Category {
    const name = input.name.trim();
    const slug = slugify(name);
    const icon = input.icon ?? '';
    const color = input.color ?? 'bg-gray-500';

    const list = this.categoriesSubject.value;
    if (list.find((c) => c.slug === slug)) {
      return list.find((c) => c.slug === slug)!;
    }

    const newCat: Category = { name, slug, icon, color };
    const updated = [...list, newCat];
    this.categoriesSubject.next(updated);
    this.persist(updated);
    return newCat;
  }

  removeCategory(slug: string): void {
    const updated = this.categoriesSubject.value.filter((c) => c.slug !== slug);
    this.categoriesSubject.next(updated);
    this.persist(updated);
  }

  updateCategory(partial: Partial<Category> & { slug: string }): void {
    const list = this.categoriesSubject.value;
    const idx = list.findIndex((c) => c.slug === partial.slug);
    if (idx === -1) return;
    const updated = [...list];
    updated[idx] = { ...updated[idx], ...partial } as Category;
    this.categoriesSubject.next(updated);
    this.persist(updated);
  }

  private load(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_CATEGORIES;
      const parsed = JSON.parse(raw) as Category[];
      if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES;

      // Migration: ensure icon and color for all categories
      let changed = false;
      const migrated = parsed.map((c) => {
        const icon = c.icon && c.icon.trim() ? c.icon : 'label';
        const color = c.color && c.color.trim() ? c.color : 'bg-gray-500';
        if (icon !== c.icon || color !== c.color) changed = true;
        return { ...c, icon, color } as Category;
      });

      if (changed) {
        this.persist(migrated);
      }
      return migrated;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  private persist(categories: Category[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch {}
  }
}
