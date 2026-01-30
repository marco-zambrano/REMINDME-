import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { GeolocationService } from './geolocation.service';
import { ReminderService } from './reminder.service';
import { SwPush } from '@angular/service-worker';
import { Reminder, Location } from '../models';
import { Subject } from 'rxjs';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let mockReminderService: jasmine.SpyObj<ReminderService>;
  let notificationPermissionValue: NotificationPermission = 'default';

  beforeEach(() => {
    // Create a proper mock for Notification API using Object.defineProperty
    const NotificationMock = class {
      static get permission() {
        return notificationPermissionValue;
      }
      static requestPermission() {
        return Promise.resolve(notificationPermissionValue);
      }
      constructor(public title: string, public options?: NotificationOptions) {}
      close() {}
    };
    
    // Replace the global Notification with our mock
    Object.defineProperty(globalThis, 'Notification', {
      value: NotificationMock,
      writable: true,
      configurable: true,
    });

    mockGeolocationService = jasmine.createSpyObj('GeolocationService', [
      'watchPosition',
      'isWithinRadius',
    ]);

    mockReminderService = jasmine.createSpyObj('ReminderService', [
      'getActiveReminders',
      'markAsNotified',
    ]);

    const mockSwPush = jasmine.createSpyObj('SwPush', ['requestSubscription'], {
      messages: new Subject(),
      subscription: new Subject(),
      isEnabled: true,
    });

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: ReminderService, useValue: mockReminderService },
        { provide: SwPush, useValue: mockSwPush },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requestPermission', () => {
    it('should return granted when permission is already granted', async () => {
      notificationPermissionValue = 'granted';

      const result = await service.requestPermission();

      expect(result).toBe('granted');
    });

    it('should request permission if not granted', async () => {
      notificationPermissionValue = 'default';

      const result = await service.requestPermission();

      expect(result).toBe('default');
    });
  });

  describe('showNotification', () => {
    it('should show notification when permission is granted', () => {
      notificationPermissionValue = 'granted';

      expect(() => {
        service.showNotification('Test Title', { body: 'Test Body' });
      }).not.toThrow();
    });

    it('should not throw when permission is not granted', () => {
      notificationPermissionValue = 'denied';

      expect(() => {
        service.showNotification('Test Title');
      }).not.toThrow();
    });
  });

  describe('showReminderNotification', () => {
    it('should show notification for reminder', async () => {
      notificationPermissionValue = 'granted';
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
      notificationPermissionValue = 'granted';
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
