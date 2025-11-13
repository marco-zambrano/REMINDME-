import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Reminder, ReminderCategory, ReminderFilter, ReminderStats } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$ = this.remindersSubject.asObservable();

  constructor() {
    // Reminders will be loaded when initialize() is called
  }

  /**
   * Initializes the service by loading reminders
   */
  async initialize(): Promise<void> {
    await this.loadReminders();
  }

  /**
   * Carga todos los recordatorios del usuario actual
   */
  private async loadReminders(): Promise<void> {
    const user = this.supabaseService.getCurrentUser();
    if (!user) return;

    try {
      const reminders = await this.getReminders({ userId: user.id });
      this.remindersSubject.next(reminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }

  /**
   * Obtiene todos los recordatorios con filtros opcionales
   * @param filter Filtros a aplicar
   * @returns Lista de recordatorios
   */
  async getReminders(filter?: ReminderFilter): Promise<Reminder[]> {
    // Obtener recordatorios del estado actual
    let filteredReminders = this.remindersSubject.value;

    if (filter) {
      if (filter.category) {
        filteredReminders = filteredReminders.filter((r) => r.category === filter.category);
      }
      if (filter.completed !== undefined) {
        filteredReminders = filteredReminders.filter((r) => r.completed === filter.completed);
      }
      if (filter.userId) {
        filteredReminders = filteredReminders.filter((r) => r.userId === filter.userId);
      }
    }

    return filteredReminders;
  }

  /**
   * Obtiene un recordatorio por ID
   * @param id ID del recordatorio
   * @returns Recordatorio o null si no existe
   */
  async getReminderById(id: string): Promise<Reminder | null> {
    const reminders = this.remindersSubject.value;
    return reminders.find((r) => r.id === id) || null;
  }

  /**
   * Crea un nuevo recordatorio
   * @param reminder Datos del recordatorio
   * @returns Recordatorio creado
   */
  async createReminder(
    reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reminder> {
    const newReminder: Reminder = {
      ...reminder,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📝 Creando nuevo recordatorio:', newReminder);

    // Agregar a la lista local
    const currentReminders = this.remindersSubject.value;
    const updatedReminders = [...currentReminders, newReminder];
    this.remindersSubject.next(updatedReminders);

    console.log('✅ Recordatorio creado. Total de recordatorios:', updatedReminders.length);

    return newReminder;
  }

  /**
   * Actualiza un recordatorio existente
   * @param id ID del recordatorio
   * @param updates Actualizaciones a aplicar
   * @returns Recordatorio actualizado
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | null> {
    const currentReminders = this.remindersSubject.value;
    const index = currentReminders.findIndex((r) => r.id === id);

    if (index === -1) return null;

    const updatedReminder: Reminder = {
      ...currentReminders[index],
      ...updates,
      updatedAt: new Date(),
    };

    const newReminders = [...currentReminders];
    newReminders[index] = updatedReminder;
    this.remindersSubject.next(newReminders);

    return updatedReminder;
  }

  /**
   * Elimina un recordatorio
   * @param id ID del recordatorio
   * @returns true si se eliminó correctamente
   */
  async deleteReminder(id: string): Promise<boolean> {
    const currentReminders = this.remindersSubject.value;
    const filtered = currentReminders.filter((r) => r.id !== id);

    if (filtered.length === currentReminders.length) {
      return false; // No se encontró el recordatorio
    }

    this.remindersSubject.next(filtered);

    return true;
  }

  /**
   * Marca un recordatorio como completado
   * @param id ID del recordatorio
   * @returns Recordatorio actualizado
   */
  async completeReminder(id: string): Promise<Reminder | null> {
    return this.updateReminder(id, {
      completed: true,
      completedAt: new Date(),
    });
  }

  /**
   * Marca un recordatorio como no completado
   * @param id ID del recordatorio
   * @returns Recordatorio actualizado
   */
  async uncompleteReminder(id: string): Promise<Reminder | null> {
    return this.updateReminder(id, {
      completed: false,
      completedAt: undefined,
    });
  }

  /**
   * Obtiene recordatorios activos (no completados)
   * @returns Lista de recordatorios activos
   */
  async getActiveReminders(): Promise<Reminder[]> {
    return this.getReminders({ completed: false });
  }

  /**
   * Obtiene recordatorios completados
   * @returns Lista de recordatorios completados
   */
  async getCompletedReminders(): Promise<Reminder[]> {
    return this.getReminders({ completed: true });
  }

  /**
   * Obtiene estadísticas de recordatorios
   * @returns Estadísticas
   */
  async getStats(): Promise<ReminderStats> {
    const allReminders = this.remindersSubject.value;

    const stats: ReminderStats = {
      total: allReminders.length,
      active: allReminders.filter((r) => !r.completed).length,
      completed: allReminders.filter((r) => r.completed).length,
      byCategory: {
        [ReminderCategory.PERSONAL]: 0,
        [ReminderCategory.TRABAJO]: 0,
        [ReminderCategory.COMPRAS]: 0,
        [ReminderCategory.SALUD]: 0,
      },
    };

    for (const reminder of allReminders) {
      stats.byCategory[reminder.category]++;
    }

    return stats;
  }

  /**
   * Obtiene recordatorios por categoría
   * @param category Categoría
   * @returns Lista de recordatorios
   */
  async getRemindersByCategory(category: ReminderCategory): Promise<Reminder[]> {
    return this.getReminders({ category });
  }

  /**
   * Marca un recordatorio como notificado
   * @param id ID del recordatorio
   */
  async markAsNotified(id: string): Promise<void> {
    await this.updateReminder(id, { notified: true });
  }

  /**
   * Genera un ID único
   * @returns ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Refresca la lista de recordatorios
   */
  async refresh(): Promise<void> {
    await this.loadReminders();
  }
}
