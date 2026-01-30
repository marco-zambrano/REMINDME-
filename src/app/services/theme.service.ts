import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'remindme-theme';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.readStoredTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  getTheme(): Theme {
    return this.themeSignal();
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }

  toggleTheme(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  private readStoredTheme(): Theme {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'light';
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const doc = typeof document !== 'undefined' ? document : null;
    if (!doc?.documentElement) {
      return;
    }
    if (theme === 'dark') {
      doc.documentElement.classList.add('dark');
    } else {
      doc.documentElement.classList.remove('dark');
    }
  }
}
