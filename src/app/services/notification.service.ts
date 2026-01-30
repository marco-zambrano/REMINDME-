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

    // Verificar cada 30 segundos
    this.timeCheckInterval = setInterval(() => {
      this.checkScheduledReminders();
    }, 30000);

    console.log('Monitoreo de tiempo iniciado');
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
          
          // Si ya pasó la hora programada (con margen de 1 minuto)
          if (scheduledDate <= now && scheduledDate > new Date(now.getTime() - 60000)) {
            console.log(`Recordatorio programado activado: ${reminder.title}`);
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
  sendTestNotification(): void {
    this.showNotification('¡Notificaciones activadas!', {
      body: 'RemindMe te notificará cuando estés cerca de tus recordatorios.',
      icon: '/assets/icon.png',
    });
  }
}
