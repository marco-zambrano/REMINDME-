import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // Esperar a que se cargue la sesión de Supabase
  const user = await supabaseService.waitForSessionInitialized();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
