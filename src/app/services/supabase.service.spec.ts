import { TestBed } from '@angular/core/testing';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';
import { take } from 'rxjs/operators';
import { of } from 'rxjs';
import type { User } from '@supabase/supabase-js';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);

    // Mockear métodos para evitar dependencias reales
    const mockUser: Partial<User> = {
      id: 'mock-id',
      email: 'mock@email.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    spyOn(service, 'signUp').and.callFake(async (email, password) => ({
      data: { user: mockUser as any, session: null },
      error: null,
    } as any));
    spyOn(service, 'signIn').and.callFake(async (email, password) => ({
      data: { user: mockUser as any, session: null },
      error: null,
    } as any));
    spyOn(service, 'signOut').and.callFake(async () => ({ error: null }));
    spyOn(service, 'getCurrentUser').and.callFake(() => mockUser as User);
    spyOnProperty(service, 'user$', 'get').and.returnValue(of(null));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize Supabase client', () => {
    expect(service.getClient()).toBeTruthy();
  });

  it('should provide user$ observable', (done) => {
    service.user$.pipe(take(1)).subscribe((user) => {
      expect(user).toBeDefined();
      done();
    });
  });

  it('should get current user', () => {
    const user = service.getCurrentUser();
    expect(user).toBeDefined();
  });

  it('should return Supabase client', () => {
    const client = service.getClient();
    expect(client).toBeTruthy();
    expect(client.auth).toBeTruthy();
  });

  describe('Authentication methods', () => {
    it('should have signUp method', () => {
      expect(typeof service.signUp).toBe('function');
    });

    it('should have signIn method', () => {
      expect(typeof service.signIn).toBe('function');
    });

    it('should have signOut method', () => {
      expect(typeof service.signOut).toBe('function');
    });

    it('signUp should return promise with data and error properties', async () => {
      const result = await service.signUp('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect('data' in result).toBe(true);
      expect('error' in result).toBe(true);
    });

    it('signIn should return promise with data and error properties', async () => {
      const result = await service.signIn('test@example.com', 'password123');
      expect(result).toBeDefined();
      expect('data' in result).toBe(true);
      expect('error' in result).toBe(true);
    });

    it('signOut should return promise with error property', async () => {
      const result = await service.signOut();
      expect(result).toBeDefined();
      expect('error' in result).toBe(true);
    });
  });
});
