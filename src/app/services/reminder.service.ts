import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Reminder, ReminderFilter, ReminderStats } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly remindersSubject = new BehaviorSubject<Reminder[]>([]);
  public reminders$ = this.remindersSubject.asObservable();

  constructor() {
    // Los recordatorios se cargarán cuando se llame a initialize()
  }

  // --- FUNCIONES DE MAPEO (HELPERS) ---

  /**
   * Mapea los datos de Supabase (snake_case) al modelo Reminder (camelCase).
   * Se usa al CARGAR (fetch) los datos.
   */
  private mapSupabaseToReminder(data: any): Reminder {
    // Mapeo de los campos con nombres diferentes
    return {
      ...data,
      userId: data.user_id, // user_id (DB) -> userId (TS)
      category: data.category_id, // category_id (DB) -> category (TS)
      completed: data.is_completed, // is_completed (DB) -> completed (TS)
      notified: data.notification_enabled, // notification_enabled (DB) -> notified (TS)
      
      // Crear objeto location desde fields planos
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        name: data.location_name,
        address: data.location_address,
      },
      radius: data.radius_meters, // radius_meters (DB) -> radius (TS)
    } as Reminder;
  }

  /**
   * Mapea las actualizaciones del modelo Reminder (camelCase) al Payload de Supabase (snake_case).
   * Se usa al CREAR o ACTUALIZAR (insert/update) los datos.
   */
  private mapReminderToSupabasePayload(updates: Partial<Reminder>): any {
    // 🔑 Destructuramos y mapeamos los campos conflictivos
    const { 
        category, 
        completed, 
        notified, 
        userId,
        locationName, 
        locationAddress, 
        radiusMeters,
        location,
        radius, // <-- Se usa si radiusMeters no existe
        completedAt, // <-- Excluir: no es una columna en la DB
        updatedAt, // <-- Excluir: manejado automáticamente por Supabase
        createdAt, // <-- Excluir: no se puede actualizar
        id, // <-- Excluir: no se puede actualizar
        ...rest 
    } = updates as any;

    // Extraer name, address, latitude y longitude del objeto location si existe
    const locName = locationName || location?.name || '';
    const locAddress = locationAddress || location?.address || '';
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    
    // Usar radius o radiusMeters, con valor por defecto 500
    const radMeters = radiusMeters || radius || 500;

    // Mapeo de campos opcionales para el payload
    const payload: any = {
      ...rest, // Incluye campos coincidentes: title, description, etc.
      
      // TS (camelCase) -> DB (snake_case)
      ...(category !== undefined && { category_id: category }),
      ...(completed !== undefined && { is_completed: completed }),
      ...(notified !== undefined && { notification_enabled: notified }),
      ...(userId !== undefined && { user_id: userId }),
      
      // Ubicación
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      
      // Asegurar valores no nulos para location_name y location_address
      location_name: locName,
      location_address: locAddress,
      radius_meters: radMeters,
    };

    return payload;
  }

  // --- MÉTODOS DE CARGA Y ESTADO ---

  /**
   * Initializes the service by loading reminders
   */
  async initialize(): Promise<void> {
    await this.loadReminders();
  }

  /**
   * Carga todos los recordatorios del usuario actual DESDE SUPABASE.
   */
  private async loadReminders(): Promise<void> {
    const user = this.supabaseService.getCurrentUser();
    if (!user) {
      this.remindersSubject.next([]);
      return;
    }

    const client = this.supabaseService.getClient();
    try {
      const { data, error } = await client
        .from('reminders')
        .select('*') 
        .eq('user_id', user.id) // Filtramos por el nombre de columna correcto 'user_id'
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders from Supabase:', error);
        throw error;
      }

      // Mapeamos los datos de la BD (snake_case) a nuestro modelo (camelCase)
      const mapped: Reminder[] = (data || []).map(row => this.mapSupabaseToReminder(row));
      this.remindersSubject.next(mapped);

    } catch (error) {
      console.error('Error loading reminders:', error);
      this.remindersSubject.next([]);
    }
  }

  /**
   * Obtiene todos los recordatorios con filtros opcionales (FILTRA LOCALMENTE).
   */
  async getReminders(filter?: ReminderFilter): Promise<Reminder[]> {
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
   * Obtiene un recordatorio por ID.
   */
  async getReminderById(id: string): Promise<Reminder | null> {
    const reminders = this.remindersSubject.value;
    return reminders.find((r) => r.id === id) || null;
  }

  // --- MÉTODOS CRUD CON SINCRONIZACIÓN ---

  /**
   * Crea un nuevo recordatorio en Supabase y actualiza el estado local.
   */
  async createReminder(
    reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Reminder> {
    const supabase = this.supabaseService.getClient();
    
    // 1. Mapeo a Payload DB (snake_case)
    const payload = this.mapReminderToSupabasePayload({
        ...reminder,
        userId: this.supabaseService.getCurrentUser()?.id, // Asegurar user_id
    });

    const { data, error } = await supabase
      .from('reminders')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('❌ Error al crear recordatorio en Supabase:', error);
      throw new Error('Fallo al Crear Recordatorio')
    }
    
    console.log('✅ Recordatorio creado en Supabase:', data);

    // 2. Mapeo de vuelta a Reminder (camelCase) y sincronización local
    const createdReminder = this.mapSupabaseToReminder(data); 
    const currentReminders = this.remindersSubject.value;
    const updatedReminders = [createdReminder, ...currentReminders];
    this.remindersSubject.next(updatedReminders);

    return createdReminder;
  }

  /**
   * Actualiza un recordatorio existente en Supabase y actualiza el estado local.
   */
  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | null> {
    const supabase = this.supabaseService.getClient();
    
    // 1. Mapeo a Payload DB (snake_case)
    // No incluimos updatedAt: Supabase lo maneja automáticamente
    const payload = this.mapReminderToSupabasePayload(updates);

    const { data, error } = await supabase
      .from('reminders')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error al actualizar recordatorio ${id} en Supabase:`, error);
      throw new Error('Fallo al actualizar el recordatorio.');
    }

    if (!data) {
      return null; // No se encontró el recordatorio
    }

    console.log('✅ Recordatorio actualizado en Supabase:', data);

    // 2. Mapeo de vuelta a Reminder (camelCase) y sincronización local
    const updatedReminder = this.mapSupabaseToReminder(data); 
    const currentReminders = this.remindersSubject.value;
    const newReminders = currentReminders.map(r => 
      r.id === id ? updatedReminder : r 
    );
    this.remindersSubject.next(newReminders);

    return updatedReminder;
  }

  /**
   * Elimina un recordatorio de Supabase y actualiza el estado local.
   */
  async deleteReminder(id: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    // 1. ELIMINAR de Supabase
    const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`❌ Error al eliminar recordatorio ${id} en Supabase:`, error);
        throw new Error('Fallo al eliminar el recordatorio.');
    }
    
    // 2. SINCRONIZACIÓN: Actualizar BehaviorSubject
    const currentReminders = this.remindersSubject.value;
    const filtered = currentReminders.filter((r) => r.id !== id);
    
    if (filtered.length === currentReminders.length) {
      return false; 
    }

    this.remindersSubject.next(filtered);
    console.log(`🗑️ Recordatorio ${id} eliminado y estado local actualizado.`);
    return true;
  }

  // --- MÉTODOS AUXILIARES ---

  /**
   * Marca un recordatorio como completado.
   */
  async completeReminder(id: string): Promise<Reminder | null> {
    return this.updateReminder(id, {
      completed: true,
      completedAt: new Date(),
    });
  }

  /**
   * Marca un recordatorio como no completado.
   */
  async uncompleteReminder(id: string): Promise<Reminder | null> {
    return this.updateReminder(id, {
      completed: false,
      completedAt: undefined,
    });
  }

  /**
   * Obtiene recordatorios activos (no completados).
   */
  async getActiveReminders(): Promise<Reminder[]> {
    return this.getReminders({ completed: false });
  }

  /**
   * Obtiene recordatorios completados.
   */
  async getCompletedReminders(): Promise<Reminder[]> {
    return this.getReminders({ completed: true });
  }

  /**
   * Obtiene estadísticas de recordatorios.
   */
  async getStats(): Promise<ReminderStats> {
    const allReminders = this.remindersSubject.value;

    const stats: ReminderStats = {
      total: allReminders.length,
      active: allReminders.filter((r) => !r.completed).length,
      completed: allReminders.filter((r) => r.completed).length,
      byCategory: {},
    };

    for (const reminder of allReminders) {
      const key = reminder.category || 'sin-categoria';
      stats.byCategory[key] = (stats.byCategory[key] ?? 0) + 1;
    }

    return stats;
  }

  /**
   * Obtiene recordatorios por categoría.
   */
  async getRemindersByCategory(category: string): Promise<Reminder[]> {
    return this.getReminders({ category });
  }

  /**
   * Marca un recordatorio como notificado.
   */
  async markAsNotified(id: string): Promise<void> {
    await this.updateReminder(id, { notified: true });
  }

  /**
   * Refresca la lista de recordatorios.
   */
  async refresh(): Promise<void> {
    await this.loadReminders();
  }
}