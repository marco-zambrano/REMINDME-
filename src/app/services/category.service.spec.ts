import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockSupabaseClient: any;

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
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
        delete: jasmine.createSpy('delete').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      }),
    };

    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['getCurrentUser', 'getClient']);
    mockSupabaseService.getCurrentUser.and.returnValue({
      id: 'user123',
      email: 'test@test.com',
    } as any);
    mockSupabaseService.getClient.and.returnValue(mockSupabaseClient);

    TestBed.configureTestingModule({
      providers: [CategoryService, { provide: SupabaseService, useValue: mockSupabaseService }],
    });

    service = TestBed.inject(CategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have categories$ observable', (done) => {
    service.categories$.subscribe((categories) => {
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      done();
    });
  });

  it('should return empty array when no user is logged in', async () => {
    mockSupabaseService.getCurrentUser.and.returnValue(null);

    await service.refresh();
    const categories = service.getCategories();

    expect(categories).toEqual([]);
  });

  describe('addCategory', () => {
    it('should add a new category', async () => {
      const mockData = { id: 'cat1', name: 'Trabajo', color: 'bg-blue-500' };
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: mockData, error: null })),
          }),
        }),
      });

      const result = await service.addCategory({ name: 'Trabajo', color: 'bg-blue-500' });

      expect(result).toBeTruthy();
      expect(result?.name).toBe('Trabajo');
    });

    it('should return null when no user is logged in', async () => {
      mockSupabaseService.getCurrentUser.and.returnValue(null);

      const result = await service.addCategory({ name: 'Test' });

      expect(result).toBeNull();
    });

    it('should not add duplicate categories by slug', async () => {
      const mockData = { id: 'cat1', name: 'Trabajo', color: 'bg-blue-500' };
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: mockData, error: null })),
          }),
        }),
      });

      await service.addCategory({ name: 'Trabajo' });
      const result = await service.addCategory({ name: 'Trabajo' });

      expect(result?.name).toBe('Trabajo');
    });
  });

  describe('removeCategory', () => {
    it('should remove a category by slug', async () => {
      const mockData = { id: 'cat1', name: 'Trabajo', color: 'bg-blue-500' };
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: mockData, error: null })),
          }),
        }),
        delete: jasmine.createSpy('delete').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      });

      await service.addCategory({ name: 'Trabajo' });
      await service.removeCategory('trabajo');

      const categories = service.getCategories();
      expect(categories.find((c) => c.slug === 'trabajo')).toBeUndefined();
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const mockData = { id: 'cat1', name: 'Trabajo', color: 'bg-blue-500' };
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: mockData, error: null })),
          }),
        }),
        update: jasmine.createSpy('update').and.returnValue({
          eq: jasmine.createSpy('eq').and.returnValue(Promise.resolve({ error: null })),
        }),
      });

      await service.addCategory({ name: 'Trabajo' });
      await service.updateCategory({ slug: 'trabajo', name: 'Work', color: 'bg-red-500' });

      const categories = service.getCategories();
      const updated = categories.find((c) => c.slug === 'trabajo');
      expect(updated?.name).toBe('Work');
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category by slug', async () => {
      const mockData = { id: 'cat1', name: 'Trabajo', color: 'bg-blue-500' };
      mockSupabaseClient.from.and.returnValue({
        insert: jasmine.createSpy('insert').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            single: jasmine
              .createSpy('single')
              .and.returnValue(Promise.resolve({ data: mockData, error: null })),
          }),
        }),
      });

      await service.addCategory({ name: 'Trabajo' });
      const category = service.getCategoryBySlug('trabajo');

      expect(category).toBeTruthy();
      expect(category?.name).toBe('Trabajo');
    });

    it('should return undefined for non-existent slug', () => {
      const category = service.getCategoryBySlug('non-existent');
      expect(category).toBeUndefined();
    });
  });
});
