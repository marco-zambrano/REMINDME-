import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReminderFormComponent } from './reminder-form.component';
import { ReminderService } from '../../services/reminder.service';
import { GeolocationService } from '../../services/geolocation.service';
import { SupabaseService } from '../../services/supabase.service';
import { CategoryService } from '../../services/category.service';
import { Router, ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Location } from '../../models';

describe('ReminderFormComponent', () => {
  let component: ReminderFormComponent;
  let fixture: ComponentFixture<ReminderFormComponent>;
  let mockReminderService: jasmine.SpyObj<ReminderService>;
  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockReminderService = jasmine.createSpyObj('ReminderService', [
      'getReminderById',
      'createReminder',
      'updateReminder',
    ]);
    mockGeolocationService = jasmine.createSpyObj('GeolocationService', ['getCurrentPosition']);
    mockGeolocationService.getCurrentPosition.and.returnValue(
      of({ latitude: 40.7128, longitude: -74.006 })
    );
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['getCurrentUser']);
    mockCategoryService = jasmine.createSpyObj(
      'CategoryService',
      ['refresh', 'getCategoryBySlug', 'getCategories'],
      {
        categories$: of([
          { id: 'cat1', name: 'Trabajo', slug: 'trabajo', icon: 'work', color: 'bg-blue-500' },
          { id: 'cat2', name: 'Personal', slug: 'personal', icon: 'person', color: 'bg-green-500' },
        ]),
      }
    );

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    mockSupabaseService.getCurrentUser.and.returnValue({
      id: 'user123',
      email: 'test@test.com',
    } as any);
    mockCategoryService.getCategories.and.returnValue([
      { id: 'cat1', name: 'Trabajo', slug: 'trabajo', icon: 'work', color: 'bg-blue-500' },
    ]);

    await TestBed.configureTestingModule({
      imports: [ReminderFormComponent, provideRouter([])],
      providers: [
        { provide: ReminderService, useValue: mockReminderService },
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReminderFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode when no id in route', () => {
    fixture.detectChanges();
    expect(component.isEditMode()).toBe(false);
  });

  it('should initialize in edit mode when id is in route', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('reminder123');
    mockReminderService.getReminderById.and.returnValue(
      Promise.resolve({
        id: 'reminder123',
        userId: 'user123',
        title: 'Test',
        description: 'Test',
        category: 'cat1',
        location: { latitude: 0, longitude: 0 },
        radius: 500,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    fixture.detectChanges();
    expect(component.isEditMode()).toBe(true);
  });

  it('should get current location on init in create mode', () => {
    const mockLocation: Location = { latitude: 40.7128, longitude: -74.006 };
    mockGeolocationService.getCurrentPosition.and.returnValue(of(mockLocation));

    fixture.detectChanges();

    expect(mockGeolocationService.getCurrentPosition).toHaveBeenCalled();
  });

  it('should validate required fields before saving', async () => {
    fixture.detectChanges();

    component.title.set('');
    component.description.set('');

    await component.save();

    expect(component.message()?.type).toBe('error');
    expect(mockReminderService.createReminder).not.toHaveBeenCalled();
  });

  it('should require location before saving', async () => {
    fixture.detectChanges();

    component.title.set('Test Title');
    component.description.set('Test Description');
    component.location.set(null);

    await component.save();

    expect(component.message()?.type).toBe('error');
    expect(mockReminderService.createReminder).not.toHaveBeenCalled();
  });

  it('should create reminder with valid data', async () => {
    mockReminderService.createReminder.and.returnValue(
      Promise.resolve({
        id: 'new-id',
        userId: 'user123',
        title: 'Test',
        description: 'Test',
        category: 'cat1',
        location: { latitude: 0, longitude: 0 },
        radius: 500,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    mockCategoryService.getCategoryBySlug.and.returnValue({
      id: 'cat1',
      name: 'Trabajo',
      slug: 'trabajo',
      icon: 'work',
      color: 'bg-blue-500',
    });

    fixture.detectChanges();

    component.title.set('Test Title');
    component.description.set('Test Description');
    component.location.set({ latitude: 40.7128, longitude: -74.006 });
    component.categorySlug.set('trabajo');

    await component.save();

    expect(mockReminderService.createReminder).toHaveBeenCalled();
  });

  it('should navigate to reminders after successful save', (done) => {
    mockReminderService.createReminder.and.returnValue(
      Promise.resolve({
        id: 'new-id',
        userId: 'user123',
        title: 'Test',
        description: 'Test',
        category: 'cat1',
        location: { latitude: 0, longitude: 0 },
        radius: 500,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );

    mockCategoryService.getCategoryBySlug.and.returnValue({
      id: 'cat1',
      name: 'Trabajo',
      slug: 'trabajo',
      icon: 'work',
      color: 'bg-blue-500',
    });

    fixture.detectChanges();

    component.title.set('Test');
    component.description.set('Test');
    component.location.set({ latitude: 0, longitude: 0 });
    component.categorySlug.set('trabajo');

    component.save().then(() => {
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/reminders']);
        done();
      }, 1600);
    });
  });

  it('should navigate to reminders on cancel', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reminders']);
  });

  it('should update category signal', () => {
    component.updateCategory('trabajo');
    expect(component.categorySlug()).toBe('trabajo');
  });

  it('should update radius signal', () => {
    component.updateRadius(1000);
    expect(component.radius()).toBe(1000);
  });
});
