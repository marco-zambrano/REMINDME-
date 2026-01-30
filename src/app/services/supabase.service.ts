import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private readonly currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );
  private sessionInitialized = false;
  private sessionInitializedPromise: Promise<void>;

  constructor() {
    // Usar variables de entorno desde environment
    const supabaseUrl = environment.supabaseUrl;
    const supabaseKey = environment.supabaseKey;

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: 'remindme-auth-token',
      },
    });

    // Crear promesa para esperar la inicialización (una sola vez)
    this.sessionInitializedPromise = this.initializeSession();

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  private async initializeSession(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      this.currentUser.next(data.session?.user ?? null);
    } catch (error: any) {
      // Silenciar todos los errores de lock - son normales
      if (error.message?.includes('Lock') || error.message?.includes('lock') || error.name?.includes('Lock')) {
        // Ignorar completamente
      } else {
        console.warn('⚠️ Error al obtener sesión:', error);
      }
      this.currentUser.next(null);
    } finally {
      this.sessionInitialized = true;
    }
  }

  async waitForSessionInitialized(): Promise<User | null> {
    await this.sessionInitializedPromise;
    return this.currentUser.value;
  }

  // Observable del usuario actual
  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  // Registro con email y contraseña
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  // Login con email y contraseña
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // Cerrar sesión
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  // Exponer el cliente de Supabase para consultas a tablas
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
