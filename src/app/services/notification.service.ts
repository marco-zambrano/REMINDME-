import { Injectable, inject } from '@angular/core';
import { GeolocationService } from './geolocation.service';
import { ReminderService } from './reminder.service';
import { Reminder, Location } from '../models';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly geolocationService = inject(GeolocationService);
  private readonly reminderService = inject(ReminderService);
  private isMonitoring = false;
  private monitoringSubscription: any = null;
  private readonly notifiedReminders = new Set<string>();

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
   * Muestra una notificación
   * @param title Título de la notificación
   * @param options Opciones de la notificación
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/icon.png',
        badge: '/assets/badge.png',
        ...options,
      });

      // Auto-cerrar después de 5 segundos
      setTimeout(() => notification.close(), 5000);
    }
  }

  /**
   * Muestra una notificación para un recordatorio
   * @param reminder Recordatorio
   */
  showReminderNotification(reminder: Reminder): void {
    const options: NotificationOptions = {
      body: reminder.description,
      icon: '/assets/icon.png',
      badge: '/assets/badge.png',
      tag: reminder.id,
      requireInteraction: true,
      data: { reminderId: reminder.id },
    };

    this.showNotification(`📍 ${reminder.title}`, options);

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
      this.monitoringSubscription = this.geolocationService.watchPosition().subscribe({
        next: (currentLocation) => {
          this.checkRemindersNearby(currentLocation);
        },
        error: (error) => {
          console.error('Error en el monitoreo de ubicación:', error);
          this.stopLocationMonitoring();
        },
      });

      console.log('Monitoreo de ubicación iniciado');
    });
  }

  /**
   * Detiene el monitoreo de ubicación
   */
  stopLocationMonitoring(): void {
    if (this.monitoringSubscription) {
      this.monitoringSubscription.unsubscribe();
      this.monitoringSubscription = null;
    }
    this.isMonitoring = false;
    console.log('Monitoreo de ubicación detenido');
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
  sendTestNotification(): void {
    this.showNotification('¡Notificaciones activadas!', {
      body: 'RemindMe te notificará cuando estés cerca de tus recordatorios.',
      icon: '/assets/icon.png',
    });
  }
}
