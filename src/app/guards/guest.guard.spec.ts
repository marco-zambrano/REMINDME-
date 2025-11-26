import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { guestGuard } from './guest.guard';
import { SupabaseService } from '../services/supabase.service';

describe('guestGuard', () => {
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should allow access when user is not authenticated', () => {
    mockSupabaseService.getCurrentUser.and.returnValue(null);

    TestBed.runInInjectionContext(() => {
      const result = guestGuard();
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to reminders when user is authenticated', () => {
    mockSupabaseService.getCurrentUser.and.returnValue({
      id: '123',
      email: 'test@test.com',
    } as any);

    TestBed.runInInjectionContext(() => {
      const result = guestGuard();
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/reminders']);
    });
  });
});
