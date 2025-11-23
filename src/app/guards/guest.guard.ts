import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const guestGuard = () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const user = supabaseService.getCurrentUser();

  // Si está logueado → redirigir a reminders
  if (user) {
    router.navigate(['/reminders']);
    return false;
  }

  return true;
};
