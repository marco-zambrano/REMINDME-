import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ReminderService } from './services/reminder.service';
import { PwaService } from './services/pwa.service';
import { NotificationService } from './services/notification.service';
import { SupabaseService } from './services/supabase.service';
import { ThemeService } from './services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { TalkBackService } from './services/talkback.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('App', () => {
  let mockReminderService: jasmine.SpyObj<ReminderService>;
  let mockPwaService: jasmine.SpyObj<PwaService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockSupabaseService: any;
  let mockThemeService: jasmine.SpyObj<ThemeService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockTalkBackService: jasmine.SpyObj<TalkBackService>;

  beforeEach(async () => {
    mockReminderService = jasmine.createSpyObj('ReminderService', ['initialize']);
    mockReminderService.initialize.and.returnValue(Promise.resolve());

    mockPwaService = jasmine.createSpyObj('PwaService', ['isInstalled', 'canInstall']);
    mockPwaService.isInstalled.and.returnValue(false);
    mockPwaService.canInstall.and.returnValue(false);

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'requestPermission',
      'startLocationMonitoring',
    ]);

    mockSupabaseService = {
      user$: of({ id: 'user1', email: 'test@test.com' }),
      getCurrentUser: jasmine
        .createSpy('getCurrentUser')
        .and.returnValue({ id: 'user1', email: 'test@test.com' }),
    };

    mockThemeService = jasmine.createSpyObj('ThemeService', ['initializeTheme']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['setDefaultLanguage', 'use']);
    mockTalkBackService = jasmine.createSpyObj('TalkBackService', ['speak']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ReminderService, useValue: mockReminderService },
        { provide: PwaService, useValue: mockPwaService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: TalkBackService, useValue: mockTalkBackService },
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
