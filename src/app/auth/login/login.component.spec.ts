import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormBuilder } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['signIn', 'getCurrentUser']);
    const mockRouterObj = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouterObj.createUrlTree.and.returnValue({} as any);
    mockRouterObj.serializeUrl.and.returnValue('');
    mockRouter = { ...mockRouterObj, events: of({}) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email and password fields', () => {
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
  });

  it('should validate email field as required', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should redirect to reminders if user is already authenticated', () => {
    mockSupabaseService.getCurrentUser.and.returnValue({
      id: '123',
      email: 'test@test.com',
    } as any);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reminders']);
  });

  it('should show error if form is invalid on submit', async () => {
    component.form.setValue({ email: '', password: '' });
    await component.onSubmit();
    expect(component.error).toBe('Revisa los campos');
  });

  it('should call signIn on valid form submit', async () => {
    mockSupabaseService.signIn.and.returnValue(
      Promise.resolve({ data: { user: {} as any, session: {} as any }, error: null })
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    await component.onSubmit();

    expect(mockSupabaseService.signIn).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('should navigate to reminders on successful login', async () => {
    mockSupabaseService.signIn.and.returnValue(
      Promise.resolve({ data: { user: {} as any, session: {} as any }, error: null })
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    await component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reminders']);
  });

  it('should show error message on failed login', async () => {
    mockSupabaseService.signIn.and.returnValue(
      Promise.resolve({ data: null, error: { message: 'Invalid credentials' } } as any)
    );

    component.form.setValue({ email: 'test@test.com', password: 'wrong' });
    await component.onSubmit();

    expect(component.error).toBe('Invalid credentials');
  });

  it('should set loading state during login', async () => {
    mockSupabaseService.signIn.and.returnValue(
      new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null } as any), 100))
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    const promise = component.onSubmit();

    expect(component.loading).toBe(true);
    await promise;
    expect(component.loading).toBe(false);
  });
});
