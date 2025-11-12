import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private supabase: SupabaseService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir a reminders
    if (this.supabase.getCurrentUser()) {
      this.router.navigate(['/reminders']);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.error = 'Revisa los campos';
      return;
    }
    this.loading = true;
    this.error = null;
    this.success = null;
    const { email, password } = this.form.value;
    try {
      const { data, error } = await this.supabase.signUp(email, password);
      if (error) {
        this.error = error.message || 'Error al crear la cuenta';
      } else {
        this.success = 'Cuenta creada. Revisa tu correo para confirmar (si aplica).';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      }
    } catch (err: any) {
      this.error = err?.message ?? String(err);
    } finally {
      this.loading = false;
    }
  }
}
