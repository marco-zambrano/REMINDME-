import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ReminderService } from './services/reminder.service';
import { PwaService } from './services/pwa.service';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { TalkBackService } from './services/talkback.service';
import { SpeakOnTapDirective } from './shared/speak-on-tap.directive';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, SpeakOnTapDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('remindme');
  private readonly reminderService = inject(ReminderService);
  private readonly pwaService = inject(PwaService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly themeService = inject(ThemeService);
  protected readonly translate = inject(TranslateService);
  protected readonly talkbackService = inject(TalkBackService);

  private readonly currentUser = toSignal(this.supabaseService.user$, { initialValue: this.supabaseService.getCurrentUser() });
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly showAccessibilityButton = computed(
    () => !!this.currentUser() && this.currentUrl().startsWith('/reminders')
  );
  protected readonly modalOpen = signal(false);

  async ngOnInit() {
    // Restaurar idioma guardado (solo páginas autenticadas usan i18n)
    const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('remindme-lang') : null;
    if (savedLang === 'es' || savedLang === 'en') {
      this.translate.use(savedLang);
    }

    // Inicializar el servicio de recordatorios
    await this.reminderService.initialize();

    // Inicializar PWA service (ya se auto-inicializa en el constructor)
    console.log('🚀 RemindMe PWA iniciado');
    console.log('📱 ¿App instalada?', this.pwaService.isInstalled());
    console.log('💾 ¿Puede instalarse?', this.pwaService.canInstall());
  }

  setLanguage(lang: 'es' | 'en'): void {
    this.translate.use(lang);
    try {
      localStorage.setItem('remindme-lang', lang);
    } catch {
      // ignore
    }
  }

  openAccessibilityModal(): void {
    this.modalOpen.set(true);
  }

  closeAccessibilityModal(): void {
    this.modalOpen.set(false);
  }
}
