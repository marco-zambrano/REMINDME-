import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/category.model';
import { SupabaseService } from './supabase.service';

const STORAGE_KEY = 'remindme.categories.v1';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Ya no usamos categorías por defecto hardcodeadas; todo viene de la BD

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  getCategories(): Category[] {
    return this.categoriesSubject.value;
  }

  async refresh(): Promise<void> {
    const user = this.supabaseService.getCurrentUser();
    if (!user) {
      this.categoriesSubject.next([]);
      return;
    }

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('categories')
      .select('id, name, color, created_by')
      .eq('created_by', user.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading categories:', error);
      this.categoriesSubject.next([]);
      return;
    }

    const mapped: Category[] = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: slugify(row.name),
      icon: 'label',
      color: row.color || 'bg-gray-500',
    }));

    this.categoriesSubject.next(mapped);
  }

  async addCategory(input: { name: string; icon?: string; color?: string }): Promise<Category | null> {
    const user = this.supabaseService.getCurrentUser();
    if (!user) return null;

    const name = input.name.trim();
    const slug = slugify(name);
    const icon = input.icon ?? 'label';
    const color = input.color ?? 'bg-gray-500';

    // Evitar duplicados por slug local
    const list = this.categoriesSubject.value;
    const existing = list.find((c) => c.slug === slug);
    if (existing) return existing;

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('categories')
      .insert({ name, color, created_by: user.id })
      .select('id, name, color')
      .single();

    if (error) {
      console.error('Error inserting category:', error);
      return null;
    }

    const created: Category = {
      id: data.id,
      name: data.name,
      slug,
      icon,
      color: data.color || color,
    };
    this.categoriesSubject.next([...list, created]);
    return created;
  }

  async removeCategory(slug: string): Promise<void> {
    const list = this.categoriesSubject.value;
    const target = list.find((c) => c.slug === slug);
    if (!target?.id) {
      this.categoriesSubject.next(list.filter((c) => c.slug !== slug));
      return;
    }
    const client = this.supabaseService.getClient();
    const { error } = await client.from('categories').delete().eq('id', target.id);
    if (error) {
      console.error('Error deleting category:', error);
      return;
    }
    this.categoriesSubject.next(list.filter((c) => c.slug !== slug));
  }

  async updateCategory(partial: Partial<Category> & { slug: string }): Promise<void> {
    const list = this.categoriesSubject.value;
    const idx = list.findIndex((c) => c.slug === partial.slug);
    if (idx === -1) return;

    const current = list[idx];
    const next: Category = { ...current, ...partial } as Category;

    if (current.id) {
      const client = this.supabaseService.getClient();
      const payload: any = { name: next.name, color: next.color };
      const { error } = await client.from('categories').update(payload).eq('id', current.id);
      if (error) {
        console.error('Error updating category:', error);
        return;
      }
    }

    const updated = [...list];
    updated[idx] = next;
    this.categoriesSubject.next(updated);
  }

  // Compat: mantener función que antes cargaba localStorage, ahora solo inicia refresco
  private load(): Category[] {
    this.refresh();
    return [];
  }

  // Ya no persistimos en localStorage; la fuente de verdad es Supabase
  private persist(_categories: Category[]) {}

  /**
   * Busca y devuelve una categoría por su slug (ej: 'trabajo').
   * Es crucial para que el ReminderForm pueda obtener el UUID antes de guardar un recordatorio.
   * @param slug El slug de la categoría.
   * @returns La categoría completa o undefined si no se encuentra.
   */
  getCategoryBySlug(slug: string): Category | undefined {
    return this.categoriesSubject.value.find((c) => c.slug === slug);
  }

}
