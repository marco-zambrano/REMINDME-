import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

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
    const { email, password } = this.form.value;
    try {
      const { data, error } = await this.supabase.signIn(email, password);
      if (error) {
        this.error = error.message || 'Error al iniciar sesión';
      } else {
        this.router.navigate(['/reminders']);
      }
    } catch (err: any) {
      this.error = err?.message ?? String(err);
    } finally {
      this.loading = false;
    }
  }
}
