import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { SupabaseService } from '../services/supabase.service';

describe('authGuard', () => {
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

  it('should allow access when user is authenticated', async () => {
    mockSupabaseService.getCurrentUser.and.returnValue({
      id: '123',
      email: 'test@test.com',
    } as any);

    TestBed.runInInjectionContext(async () => {
      const result = await authGuard();
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockSupabaseService.getCurrentUser.and.returnValue(null);

    TestBed.runInInjectionContext(async () => {
      const result = await authGuard();
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
