/**
 * Definiciones de tipos para variables de entorno inyectadas en runtime.
 * 
 * Estas variables se inyectan a través de window.ENV cuando la aplicación
 * se ejecuta en producción (Docker/Cloud). En desarrollo, se usan los
 * valores por defecto definidos en environment.ts
 */

interface EnvironmentVariables {
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
  GOOGLE_MAPS_API_KEY?: string;
}

declare global {
  interface Window {
    ENV?: EnvironmentVariables;
  }
}

export {};
