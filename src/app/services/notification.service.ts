import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { GeolocationService } from './geolocation.service';
import { ReminderService } from './reminder.service';
import { Reminder, Location } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly geolocationService = inject(GeolocationService);
  private readonly reminderService = inject(ReminderService);
  private readonly swPush = inject(SwPush);
  private isMonitoring = false;
  private monitoringSubscription: any = null;
  private readonly notifiedReminders = new Set<string>();
  private timeCheckInterval: any = null;

  constructor() {}

  /**
   * Solicita permiso para mostrar notificaciones
   * @returns Promise con el estado del permiso
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in globalThis)) {
      console.warn('Este navegador no soporta notificaciones');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Muestra una notificación usando Service Worker (compatible con móviles)
   * @param title Título de la notificación
   * @param options Opciones de la notificación
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      // Detectar si es iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // En iOS, usar alertas de audio/vibración como alternativa
      if (isIOS) {
        // Vibración en iOS (si está soportada)
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // Reproducir sonido de notificación
        this.playNotificationSound();
        
        // Mostrar con Notification API
        try {
          new Notification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            body: options?.body,
            tag: options?.tag,
            requireInteraction: true,
          });
        } catch (e) {
          console.log('Notification API no disponible en iOS');
        }
      } else {
        // Android: usar Service Worker
        if (this.swPush.isEnabled && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: true,
            ...options,
          });
        } else {
          // Fallback
          const notification = new Notification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            ...options,
          });
          setTimeout(() => notification.close(), 5000);
        }
      }
    } catch (error) {
      console.error('Error al mostrar notificación:', error);
      try {
        new Notification(title, options);
      } catch (e) {
        console.error('Error con Notification API:', e);
      }
    }
  }

  /**
   * Reproduce un sonido de notificación
   */
  private playNotificationSound(): void {
    try {
      const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silenciar si no funciona
    }
  }

  /**
   * Muestra una notificación para un recordatorio
   * @param reminder Recordatorio
   */
  async showReminderNotification(reminder: Reminder): Promise<void> {
    const options: NotificationOptions = {
      body: reminder.description,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: reminder.id,
      requireInteraction: true,
      data: { reminderId: reminder.id },
      vibrate: [200, 100, 200, 100, 200],
    };

    await this.showNotification(`📍 ${reminder.title}`, options);

    // Marcar como notificado
    if (reminder.id) {
      this.notifiedReminders.add(reminder.id);
      this.reminderService.markAsNotified(reminder.id);
    }
  }

  /**
   * Inicia el monitoreo de ubicación para notificaciones
   */
  startLocationMonitoring(): void {
    if (this.isMonitoring) {
      console.log('El monitoreo ya está activo');
      return;
    }

    this.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        console.warn('Permiso de notificaciones denegado');
        return;
      }

      this.isMonitoring = true;
      
      // Monitoreo de ubicación para recordatorios por proximidad
      this.monitoringSubscription = this.geolocationService.watchPosition().subscribe({
        next: (currentLocation) => {
          this.checkRemindersNearby(currentLocation);
        },
        error: (error) => {
          console.error('Error en el monitoreo de ubicación:', error);
          this.stopLocationMonitoring();
        },
      });

      // Monitoreo de tiempo para recordatorios programados (cada 30 segundos)
      this.startTimeMonitoring();

      console.log('Monitoreo de ubicación y tiempo iniciado');
    });
  }

  /**
   * Inicia el monitoreo de recordatorios programados por tiempo
   */
  private startTimeMonitoring(): void {
    if (this.timeCheckInterval) {
      return;
    }

    // Verificar inmediatamente
    this.checkScheduledReminders();

    // En iOS, verificar más frecuentemente (cada 10s) porque el app puede ser suspendido
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const interval = isIOS ? 10000 : 30000;

    // Verificar cada 10-30 segundos
    this.timeCheckInterval = setInterval(() => {
      this.checkScheduledReminders();
    }, interval);

    console.log(`Monitoreo de tiempo iniciado (intervalo: ${interval}ms)`);
  }

  /**
   * Verifica recordatorios programados que deben activarse
   */
  private async checkScheduledReminders(): Promise<void> {
    try {
      const activeReminders = await this.reminderService.getActiveReminders();
      const now = new Date();

      for (const reminder of activeReminders) {
        // Saltar si ya fue notificado en esta sesión
        if (reminder.id && this.notifiedReminders.has(reminder.id)) {
          continue;
        }

        // Verificar recordatorios con activación temporal
        if (
          (reminder.activationType === 'time' || reminder.activationType === 'both') &&
          reminder.scheduledTime &&
          !reminder.isTimeActivated
        ) {
          const scheduledDate = new Date(reminder.scheduledTime);
          
          // En iOS, usar margen mayor (2 minutos) por imprecisión del timing
          const marginMs = /iPad|iPhone|iPod/.test(navigator.userAgent) ? 120000 : 60000;
          
          // Si ya pasó la hora programada (con margen)
          if (scheduledDate <= now && scheduledDate > new Date(now.getTime() - marginMs)) {
            console.log(`✅ Recordatorio programado activado: ${reminder.title}`);
            this.showReminderNotification(reminder);
            
            // Marcar como activado por tiempo
            if (reminder.id) {
              await this.reminderService.markAsTimeActivated(reminder.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar recordatorios programados:', error);
    }
  }

  /**
   * Detiene el monitoreo de ubicación
   */
  stopLocationMonitoring(): void {
    if (this.monitoringSubscription) {
      this.monitoringSubscription.unsubscribe();
      this.monitoringSubscription = null;
    }
    
    if (this.timeCheckInterval) {
      clearInterval(this.timeCheckInterval);
      this.timeCheckInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('Monitoreo de ubicación y tiempo detenido');
  }

  /**
   * Verifica si hay recordatorios cercanos a la ubicación actual
   * @param currentLocation Ubicación actual
   */
  private async checkRemindersNearby(currentLocation: Location): Promise<void> {
    try {
      const activeReminders = await this.reminderService.getActiveReminders();

      for (const reminder of activeReminders) {
        // Saltar si ya fue notificado en esta sesión
        if (reminder.id && this.notifiedReminders.has(reminder.id)) {
          continue;
        }

        // Solo verificar proximidad si el tipo de activación lo requiere
        if (reminder.activationType === 'location' || reminder.activationType === 'both') {
          // Verificar si está dentro del radio
          const isNearby = this.geolocationService.isWithinRadius(
            reminder.location,
            currentLocation,
            reminder.radius
          );

          if (isNearby) {
            console.log(`Recordatorio cercano detectado: ${reminder.title}`);
            this.showReminderNotification(reminder);
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar recordatorios cercanos:', error);
    }
  }

  /**
   * Limpia la caché de recordatorios notificados
   */
  clearNotifiedCache(): void {
    this.notifiedReminders.clear();
  }

  /**
   * Verifica si el monitoreo está activo
   * @returns true si está monitoreando
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Envía una notificación de prueba
   */
  async sendTestNotification(): Promise<void> {
    await this.showNotification('¡Notificaciones activadas!', {
      body: 'RemindMe te notificará cuando estés cerca de tus recordatorios.',
      icon: '/icons/icon-192x192.png',
      vibrate: [200, 100, 200],
    });
  }
}
