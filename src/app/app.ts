import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReminderService } from './services/reminder.service';
import { PwaService } from './services/pwa.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('remindme');
  private readonly reminderService = inject(ReminderService);
  private readonly pwaService = inject(PwaService);

  async ngOnInit() {
    // Inicializar el servicio de recordatorios
    await this.reminderService.initialize();
    
    // Inicializar PWA service (ya se auto-inicializa en el constructor)
    console.log('🚀 RemindMe PWA iniciado');
    console.log('📱 ¿App instalada?', this.pwaService.isInstalled());
    console.log('💾 ¿Puede instalarse?', this.pwaService.canInstall());
  }
}
