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

    // Verificar sesión existente con manejo de errores
    this.supabase.auth
      .getSession()
      .then(({ data }) => {
        this.currentUser.next(data.session?.user ?? null);
      })
      .catch((error) => {
        // Silenciar errores de lock en desarrollo (son normales cuando hay múltiples pestañas)
        if (!error.message?.includes('NavigatorLock')) {
          console.warn('⚠️ Error al obtener sesión:', error);
        }
        this.currentUser.next(null);
      });

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
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
}
