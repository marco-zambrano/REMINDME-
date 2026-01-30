import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'remindme-talkback';

@Injectable({
  providedIn: 'root',
})
export class TalkBackService {
  private readonly enabledSignal = signal<boolean>(this.readStored());

  readonly enabled = this.enabledSignal.asReadonly();

  setEnabled(enabled: boolean): void {
    this.enabledSignal.set(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // ignore
    }
  }

  toggle(): void {
    this.setEnabled(!this.enabledSignal());
  }

  private readStored(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
