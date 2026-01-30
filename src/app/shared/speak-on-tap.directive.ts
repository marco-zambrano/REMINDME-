import { Directive, HostListener, inject, OnInit } from '@angular/core';
import { TalkBackService } from '../services/talkback.service';
import { TranslateService } from '@ngx-translate/core';

const MAX_SPEECH_LENGTH = 200;

@Directive({
  selector: '[appSpeakOnTap]',
  standalone: true,
})
export class SpeakOnTapDirective implements OnInit {
  private readonly talkback = inject(TalkBackService);
  private readonly translate = inject(TranslateService);

  private synth: SpeechSynthesis | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.talkback.enabled()) return;
    if (!this.synth) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('[data-talkback-ignore]')) return;

    const text = this.getAccessibleText(target);
    if (!text || !text.trim()) return;

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim().slice(0, MAX_SPEECH_LENGTH));
    const lang = this.translate.currentLang === 'en' ? 'en-US' : 'es-ES';
    utterance.lang = lang;
    this.synth.speak(utterance);
  }

  private getAccessibleText(el: HTMLElement): string | null {
    let current: HTMLElement | null = el;
    while (current) {
      if (current.closest('[data-talkback-ignore]')) return null;
      if (current.nodeName === 'SCRIPT' || current.nodeName === 'STYLE') {
        current = current.parentElement;
        continue;
      }
      const aria = current.getAttribute('aria-label');
      if (aria && aria.trim()) return aria.trim();
      const title = current.getAttribute('title');
      if (title && title.trim()) return title.trim();
      const text = (current as HTMLElement).innerText;
      if (text && text.trim()) return text.trim();
      current = current.parentElement;
    }
    return null;
  }
}
