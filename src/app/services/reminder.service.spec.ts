import { TestBed } from '@angular/core/testing';
import { ReminderService } from './reminder.service';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { Reminder } from '../models';

describe('ReminderService', () => {
  let service: ReminderService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

  const mockReminder: Reminder = {
    id: '1',
    userId: 'user1',
    title: 'Test Reminder',
    description: 'Test Description',
    category: 'cat1',
    location: { latitude: 40.7128, longitude: -74.006, name: 'New York', address: 'NY' },
    radius: 500,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    notified: false,
  };

  beforeEach(() => {
    mockSupabaseClient = {
      from: jasmine.createSpy('from').and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine
              .createSpy('order')
              .and.returnValue(Promise.resolve({ data: [], error: null })),
          }),
        }),
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: null, error: null })),
          }),
        }),
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            select: jasmine.createSpy('select').and.returnValue({
              single: jasmine
                .createSpy('single')
                .and.returnValue(Promise.resolve({ data: null, error: null })),
            }),
          }),
        }),
        delete: jasmine.createSpy('delete').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      }),
    };

    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['getCurrentUser', 'getClient']);
    mockSupabaseService.getCurrentUser.and.returnValue({
      id: 'user1',
      email: 'test@test.com',
    } as any);
    mockSupabaseService.getClient.and.returnValue(mockSupabaseClient);

    TestBed.configureTestingModule({
      providers: [ReminderService, { provide: SupabaseService, useValue: mockSupabaseService }],
    });

    service = TestBed.inject(ReminderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have reminders$ observable', (done) => {
    service.reminders$.subscribe((reminders) => {
      expect(reminders).toBeDefined();
      expect(Array.isArray(reminders)).toBe(true);
      done();
    });
  });

  describe('initialize', () => {
    it('should load reminders on initialize', async () => {
      spyOn<any>(service, 'loadReminders').and.returnValue(Promise.resolve());
      await service.initialize();
      expect((service as any).loadReminders).toHaveBeenCalled();
    });
  });

  describe('getReminders', () => {
    it('should return all reminders without filter', async () => {
      const reminders = await service.getReminders();
      expect(Array.isArray(reminders)).toBe(true);
    });

    it('should filter reminders by category', async () => {
      const dbData = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Test',
          description: 'Test',
          category_id: 'cat1',
          latitude: 0,
          longitude: 0,
          location_name: 'Test',
          location_address: 'Test',
          radius_meters: 500,
          is_completed: false,
          notification_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine
              .createSpy('order')
              .and.returnValue(Promise.resolve({ data: dbData, error: null })),
          }),
        }),
      });

      await service.initialize();
      const filtered = await service.getReminders({ category: 'cat1' });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((r) => r.category === 'cat1')).toBe(true);
    });

    it('should filter reminders by completed status', async () => {
      const dbData = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Test 1',
          description: 'Test',
          category_id: 'cat1',
          latitude: 0,
          longitude: 0,
          location_name: 'Test',
          location_address: 'Test',
          radius_meters: 500,
          is_completed: false,
          notification_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'user1',
          title: 'Test 2',
          description: 'Test',
          category_id: 'cat1',
          latitude: 0,
          longitude: 0,
          location_name: 'Test',
          location_address: 'Test',
          radius_meters: 500,
          is_completed: true,
          notification_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine
              .createSpy('order')
              .and.returnValue(Promise.resolve({ data: dbData, error: null })),
          }),
        }),
      });

      await service.initialize();
      const active = await service.getReminders({ completed: false });

      expect(active.every((r) => !r.completed)).toBe(true);
    });
  });

  describe('getReminderById', () => {
    it('should return reminder by id', async () => {
      const dbData = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Test',
          description: 'Test',
          category_id: 'cat1',
          latitude: 0,
          longitude: 0,
          location_name: 'Test',
          location_address: 'Test',
          radius_meters: 500,
          is_completed: false,
          notification_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine
              .createSpy('order')
              .and.returnValue(Promise.resolve({ data: dbData, error: null })),
          }),
        }),
      });

      await service.initialize();
      const reminder = await service.getReminderById('1');

      expect(reminder).toBeTruthy();
      expect(reminder?.id).toBe('1');
    });

    it('should return null for non-existent id', async () => {
      const reminder = await service.getReminderById('non-existent');
      expect(reminder).toBeNull();
    });
  });

  describe('createReminder', () => {
    it('should create a new reminder', async () => {
      const newReminderData = {
        userId: 'user1',
        title: 'New Reminder',
        description: 'New Description',
        category: 'cat1',
        location: { latitude: 0, longitude: 0, name: 'Test', address: 'Test' },
        radius: 500,
        completed: false,
        notified: false,
      };

      const dbResponse = {
        id: 'new-id',
        user_id: 'user1',
        title: 'New Reminder',
        description: 'New Description',
        category_id: 'cat1',
        latitude: 0,
        longitude: 0,
        location_name: 'Test',
        location_address: 'Test',
        radius_meters: 500,
        is_completed: false,
        notification_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: dbResponse, error: null })),
          }),
        }),
      });

      const result = await service.createReminder(newReminderData);

      expect(result).toBeTruthy();
      expect(result.title).toBe('New Reminder');
    });
  });

  describe('updateReminder', () => {
    it('should update an existing reminder', async () => {
      const updates = { title: 'Updated Title' };

      const dbResponse = {
        id: '1',
        user_id: 'user1',
        title: 'Updated Title',
        description: 'Test',
        category_id: 'cat1',
        latitude: 0,
        longitude: 0,
        location_name: 'Test',
        location_address: 'Test',
        radius_meters: 500,
        is_completed: false,
        notification_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            select: jasmine.createSpy('select').and.returnValue({
              single: jasmine
                .createSpy('single')
                .and.returnValue(Promise.resolve({ data: dbResponse, error: null })),
            }),
          }),
        }),
      });

      const result = await service.updateReminder('1', updates);

      expect(result).toBeTruthy();
      expect(result?.title).toBe('Updated Title');
    });
  });

  describe('deleteReminder', () => {
    it('should delete a reminder', async () => {
      const dbData = [
        {
          id: '1',
          user_id: 'user1',
          title: 'Test',
          description: 'Test',
          category_id: 'cat1',
          latitude: 0,
          longitude: 0,
          location_name: 'Test',
          location_address: 'Test',
          radius_meters: 500,
          is_completed: false,
          notification_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabaseClient.from.and.returnValue({
        select: jasmine.createSpy('select').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            order: jasmine
              .createSpy('order')
              .and.returnValue(Promise.resolve({ data: dbData, error: null })),
          }),
        }),
        delete: jasmine.createSpy('delete').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      });

      await service.initialize();
      const result = await service.deleteReminder('1');

      expect(result).toBe(true);
    });
  });

  describe('Helper methods', () => {
    it('should complete a reminder', async () => {
      const dbResponse = {
        id: '1',
        user_id: 'user1',
        title: 'Test',
        description: 'Test',
        category_id: 'cat1',
        latitude: 0,
        longitude: 0,
        location_name: 'Test',
        location_address: 'Test',
        radius_meters: 500,
        is_completed: true,
        notification_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            select: jasmine.createSpy('select').and.returnValue({
              single: jasmine
                .createSpy('single')
                .and.returnValue(Promise.resolve({ data: dbResponse, error: null })),
            }),
          }),
        }),
      });

      const result = await service.completeReminder('1');
      expect(result?.completed).toBe(true);
    });

    it('should get active reminders', async () => {
      const reminders = await service.getActiveReminders();
      expect(reminders.every((r) => !r.completed)).toBe(true);
    });

    it('should get completed reminders', async () => {
      const reminders = await service.getCompletedReminders();
      expect(reminders.every((r) => r.completed)).toBe(true);
    });

    it('should get stats', async () => {
      const stats = await service.getStats();
      expect(stats).toBeTruthy();
      expect(stats.total).toBeDefined();
      expect(stats.active).toBeDefined();
      expect(stats.completed).toBeDefined();
      expect(stats.byCategory).toBeDefined();
    });

    it('should get reminders by category', async () => {
      const reminders = await service.getRemindersByCategory('cat1');
      expect(Array.isArray(reminders)).toBe(true);
    });

    it('should mark as notified', async () => {
      mockSupabaseClient.from.and.returnValue({
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue({
            select: jasmine.createSpy('select').and.returnValue({
              single: jasmine
                .createSpy('single')
                .and.returnValue(Promise.resolve({ data: mockReminder, error: null })),
            }),
          }),
        }),
      });

      await service.markAsNotified('1');
      // Verificar que se llamó al método de actualización
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });

    it('should refresh reminders', async () => {
      spyOn<any>(service, 'loadReminders').and.returnValue(Promise.resolve());
      await service.refresh();
      expect((service as any).loadReminders).toHaveBeenCalled();
    });
  });
});
