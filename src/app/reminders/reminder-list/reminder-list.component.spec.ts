import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReminderListComponent } from './reminder-list.component';
import { ReminderService } from '../../services/reminder.service';
import { NotificationService } from '../../services/notification.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SupabaseService } from '../../services/supabase.service';
import { PwaService } from '../../services/pwa.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Reminder } from '../../models';

describe('ReminderListComponent', () => {
  let component: ReminderListComponent;
  let fixture: ComponentFixture<ReminderListComponent>;
  let mockReminderService: any;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let mockSupabaseService: any;
  let mockPwaService: jasmine.SpyObj<PwaService>;
  let mockCategoryService: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockReminders: Reminder[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Test Reminder 1',
      description: 'Description 1',
      category: 'cat1',
      location: { latitude: 40.7128, longitude: -74.006 },
      radius: 500,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Test Reminder 2',
      description: 'Description 2',
      category: 'cat2',
      location: { latitude: 34.0522, longitude: -118.2437 },
      radius: 1000,
      completed: true,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const remindersSubject = new BehaviorSubject<Reminder[]>(mockReminders);

    mockReminderService = {
      reminders$: remindersSubject.asObservable(),
      getReminders: jasmine
        .createSpy('getReminders')
        .and.returnValue(Promise.resolve(mockReminders)),
      getActiveReminders: jasmine
        .createSpy('getActiveReminders')
        .and.returnValue(Promise.resolve([mockReminders[0]])),
      getCompletedReminders: jasmine
        .createSpy('getCompletedReminders')
        .and.returnValue(Promise.resolve([mockReminders[1]])),
      getStats: jasmine.createSpy('getStats').and.returnValue(
        Promise.resolve({
          total: 2,
          active: 1,
          completed: 1,
          byCategory: { cat1: 1, cat2: 1 },
        })
      ),
      completeReminder: jasmine
        .createSpy('completeReminder')
        .and.returnValue(Promise.resolve(mockReminders[0])),
      uncompleteReminder: jasmine
        .createSpy('uncompleteReminder')
        .and.returnValue(Promise.resolve(mockReminders[1])),
      deleteReminder: jasmine.createSpy('deleteReminder').and.returnValue(Promise.resolve(true)),
      refresh: jasmine.createSpy('refresh').and.returnValue(Promise.resolve()),
    };

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'startLocationMonitoring',
      'stopLocationMonitoring',
      'isMonitoringActive',
    ]);

    mockGeolocationService = jasmine.createSpyObj('GeolocationService', [
      'getCurrentPosition',
      'calculateDistance',
      'formatDistance',
    ]);

    const userSubject = new BehaviorSubject({ id: 'user1', email: 'test@test.com' });
    mockSupabaseService = {
      user$: userSubject.asObservable(),
      getCurrentUser: jasmine
        .createSpy('getCurrentUser')
        .and.returnValue({ id: 'user1', email: 'test@test.com' }),
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve({ error: null })),
    };

    mockPwaService = jasmine.createSpyObj('PwaService', [
      'canInstall',
      'isInstalled',
      'installPwa',
    ]);

    const categoriesSubject = new BehaviorSubject([
      { id: 'cat1', name: 'Trabajo', slug: 'trabajo', icon: 'work', color: 'bg-blue-500' },
      { id: 'cat2', name: 'Personal', slug: 'personal', icon: 'person', color: 'bg-green-500' },
    ]);

    mockCategoryService = {
      categories$: categoriesSubject.asObservable(),
      getCategories: jasmine.createSpy('getCategories').and.returnValue([
        { id: 'cat1', name: 'Trabajo', slug: 'trabajo', icon: 'work', color: 'bg-blue-500' },
        { id: 'cat2', name: 'Personal', slug: 'personal', icon: 'person', color: 'bg-green-500' },
      ]),
      refresh: jasmine.createSpy('refresh').and.returnValue(Promise.resolve()),
      addCategory: jasmine.createSpy('addCategory').and.returnValue(
        Promise.resolve({
          id: 'cat3',
          name: 'Nueva',
          slug: 'nueva',
          icon: 'label',
          color: 'bg-red-500',
        })
      ),
      removeCategory: jasmine.createSpy('removeCategory').and.returnValue(Promise.resolve()),
    };

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockGeolocationService.getCurrentPosition.and.returnValue(
      of({ latitude: 40.7128, longitude: -74.006 })
    );
    mockGeolocationService.calculateDistance.and.returnValue(1000);
    mockGeolocationService.formatDistance.and.returnValue('1.0km');
    mockNotificationService.isMonitoringActive.and.returnValue(false);
    mockPwaService.canInstall.and.returnValue(false);
    mockPwaService.isInstalled.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [],
      declarations: [ReminderListComponent],
      providers: [
        { provide: ReminderService, useValue: mockReminderService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: PwaService, useValue: mockPwaService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load reminders on init', () => {
    expect(mockReminderService.getReminders).toHaveBeenCalled();
  });

  it('should load stats on init', () => {
    expect(mockReminderService.getStats).toHaveBeenCalled();
  });

  it('should filter reminders by status', () => {
    component.setFilter('active');
    expect(component.selectedFilter()).toBe('active');
  });

  it('should filter reminders by category', () => {
    component.setCategory('trabajo');
    expect(component.selectedCategory()).toBe('trabajo');
  });

  it('should toggle reminder completion', async () => {
    await component.toggleComplete(mockReminders[0]);
    expect(mockReminderService.completeReminder).toHaveBeenCalledWith('1');
  });

  it('should delete reminder with confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    await component.deleteReminder(mockReminders[0]);
    expect(mockReminderService.deleteReminder).toHaveBeenCalledWith('1');
  });

  it('should not delete reminder without confirmation', async () => {
    spyOn(window, 'confirm').and.returnValue(false);
    await component.deleteReminder(mockReminders[0]);
    expect(mockReminderService.deleteReminder).not.toHaveBeenCalled();
  });

  it('should toggle monitoring', () => {
    mockNotificationService.isMonitoringActive.and.returnValue(false);
    component.toggleMonitoring();
    expect(mockNotificationService.startLocationMonitoring).toHaveBeenCalled();
  });

  it('should stop monitoring when already active', () => {
    mockNotificationService.isMonitoringActive.and.returnValue(true);
    component.checkMonitoringStatus();
    component.toggleMonitoring();
    expect(mockNotificationService.stopLocationMonitoring).toHaveBeenCalled();
  });

  it('should refresh reminders', async () => {
    await component.refresh();
    expect(mockReminderService.refresh).toHaveBeenCalled();
  });

  it('should logout and navigate to home', async () => {
    spyOn(window, 'confirm').and.returnValue(true);
    await component.logout();
    expect(mockSupabaseService.signOut).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should get category name by id', () => {
    const name = component.getCategoryName('cat1');
    expect(name).toBe('Trabajo');
  });

  it('should get category color by id', () => {
    const color = component.getCategoryColor('cat1');
    expect(color).toBe('bg-blue-500');
  });

  it('should get category icon by id', () => {
    const icon = component.getCategoryIcon('cat1');
    expect(icon).toBe('work');
  });

  it('should calculate distance to reminder', () => {
    const distance = component.getDistanceToReminder(mockReminders[0]);
    expect(distance).toBe('1.0km');
  });

  it('should add new category', async () => {
    component.newCategoryName.set('Nueva Categoria');
    component.newCategoryColor.set('bg-red-500');

    await component.addCategory();

    expect(mockCategoryService.addCategory).toHaveBeenCalledWith({
      name: 'Nueva Categoria',
      icon: 'label',
      color: 'bg-red-500',
    });
  });

  it('should remove category with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.removeCategory('trabajo');
    expect(mockCategoryService.removeCategory).toHaveBeenCalledWith('trabajo');
  });

  it('should check if PWA can be installed', () => {
    mockPwaService.canInstall.and.returnValue(true);
    mockPwaService.isInstalled.and.returnValue(false);

    const result = component.canInstallPwa();
    expect(result).toBe(true);
  });

  it('should install PWA', async () => {
    mockPwaService.installPwa.and.returnValue(Promise.resolve(true));
    await component.installPwa();
    expect(mockPwaService.installPwa).toHaveBeenCalled();
  });
});
