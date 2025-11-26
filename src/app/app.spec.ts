import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ReminderService } from './services/reminder.service';
import { PwaService } from './services/pwa.service';
import { provideRouter } from '@angular/router';

describe('App', () => {
  let mockReminderService: jasmine.SpyObj<ReminderService>;
  let mockPwaService: jasmine.SpyObj<PwaService>;

  beforeEach(async () => {
    mockReminderService = jasmine.createSpyObj('ReminderService', ['initialize']);
    mockReminderService.initialize.and.returnValue(Promise.resolve());

    mockPwaService = jasmine.createSpyObj('PwaService', ['isInstalled', 'canInstall']);
    mockPwaService.isInstalled.and.returnValue(false);
    mockPwaService.canInstall.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ReminderService, useValue: mockReminderService },
        { provide: PwaService, useValue: mockPwaService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have title signal with value "remindme"', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app['title']()).toBe('remindme');
  });

  it('should initialize reminder service on ngOnInit', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await app.ngOnInit();
    expect(mockReminderService.initialize).toHaveBeenCalled();
  });

  it('should check PWA installation status on ngOnInit', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    await app.ngOnInit();
    expect(mockPwaService.isInstalled).toHaveBeenCalled();
    expect(mockPwaService.canInstall).toHaveBeenCalled();
  });
});
