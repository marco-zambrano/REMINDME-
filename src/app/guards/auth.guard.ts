import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard = () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const user = supabaseService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
