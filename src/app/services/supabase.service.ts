// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor() {
    const supabaseUrl = 'https://ebrtyrkyacahgkraxbwa.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicnR5cmt5YWNhaGdrcmF4YndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTc4NjcsImV4cCI6MjA3ODM3Mzg2N30.mTVofKOZZ8AmGmFJzlnSkLg8zdvOpyTm9iVA3g43Tss';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar sesión existente
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUser.next(data.session?.user ?? null);
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
      password
    });
    return { data, error };
  }

  // Login con email y contraseña
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
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