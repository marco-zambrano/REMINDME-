import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { GeolocationService } from './geolocation.service';
import { ReminderService } from './reminder.service';
import { Reminder, Location } from '../models';
import { Subject } from 'rxjs';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let mockReminderService: jasmine.SpyObj<ReminderService>;

  beforeEach(() => {
    // Mock básico de la API de Notification
    if (!(globalThis as any).Notification) {
      let _permission: NotificationPermission = 'default';
      (globalThis as any).Notification = class {
        static get permission() {
          return _permission;
        }
        static set permission(val: NotificationPermission) {
          _permission = val;
        }
        static requestPermission = () => Promise.resolve('granted' as NotificationPermission);
        constructor(public title: string, public options?: NotificationOptions) {}
        close() {}
      };
    }

    mockGeolocationService = jasmine.createSpyObj('GeolocationService', [
      'watchPosition',
      'isWithinRadius',
    ]);

    mockReminderService = jasmine.createSpyObj('ReminderService', [
      'getActiveReminders',
      'markAsNotified',
    ]);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: ReminderService, useValue: mockReminderService },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestPermission', () => {
    it('should return granted when permission is already granted', async () => {
      (globalThis as any).Notification.permission = 'granted';

      const result = await service.requestPermission();

      expect(result).toBe('granted');
    });

    it('should request permission if not granted', async () => {
      (globalThis as any).Notification.permission = 'default';

      const result = await service.requestPermission();

      expect(result).toBe('granted');
    });
  });

  describe('showNotification', () => {
    it('should show notification when permission is granted', () => {
      (globalThis as any).Notification.permission = 'granted';

      expect(() => {
        service.showNotification('Test Title', { body: 'Test Body' });
      }).not.toThrow();
    });

    it('should not throw when permission is not granted', () => {
      (globalThis as any).Notification.permission = 'denied';

      expect(() => {
        service.showNotification('Test Title');
      }).not.toThrow();
    });
  });

  describe('showReminderNotification', () => {
    it('should show notification for reminder', async () => {
      (globalThis as any).Notification.permission = 'granted';
      mockReminderService.markAsNotified.and.returnValue(Promise.resolve());
      const reminder: Reminder = {
        id: '1',
        userId: 'user1',
        title: 'Test Reminder',
        description: 'Test Description',
        category: 'personal',
        location: { latitude: 0, longitude: 0 },
        radius: 100,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        notified: false,
      };
      await service.showReminderNotification(reminder);
      expect(mockReminderService.markAsNotified).toHaveBeenCalledWith('1');
    });
  });

  describe('monitoring', () => {
    it('should start location monitoring', async () => {
      const locationSubject = new Subject<Location>();
      mockGeolocationService.watchPosition.and.returnValue(locationSubject.asObservable());
      mockReminderService.getActiveReminders.and.returnValue(Promise.resolve([]));
      (globalThis as any).Notification.permission = 'granted';
      await service.startLocationMonitoring();
      // Simular emisión de posición
      locationSubject.next({ latitude: 0, longitude: 0 });
      expect(service.isMonitoringActive()).toBe(true);
    });

    it('should stop monitoring', () => {
      service.stopLocationMonitoring();
      expect(service.isMonitoringActive()).toBe(false);
    });
  });

  describe('clearNotifiedCache', () => {
    it('should clear notified reminders cache', () => {
      expect(() => {
        service.clearNotifiedCache();
      }).not.toThrow();
    });
  });

  describe('sendTestNotification', () => {
    it('should send a test notification', () => {
      spyOn(service, 'showNotification');

      service.sendTestNotification();

      expect(service.showNotification).toHaveBeenCalledWith(
        '¡Notificaciones activadas!',
        jasmine.objectContaining({ body: jasmine.any(String) })
      );
    });
  });
});
