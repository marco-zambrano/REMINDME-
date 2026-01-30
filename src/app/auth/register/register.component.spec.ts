import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockSupabaseService: jasmine.SpyObj<SupabaseService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockSupabaseService = jasmine.createSpyObj('SupabaseService', ['signUp', 'getCurrentUser']);
    const mockRouterObj = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    mockRouterObj.createUrlTree.and.returnValue({} as any);
    mockRouterObj.serializeUrl.and.returnValue('');
    mockRouter = { ...mockRouterObj, events: of({}) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RegisterComponent],
      providers: [
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
        FormBuilder,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('should validate email field as required and valid', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBe(true);
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

  it('should call signUp on valid form submit', async () => {
    mockSupabaseService.signUp.and.returnValue(
      Promise.resolve({ data: { user: {} as any, session: null }, error: null })
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    await component.onSubmit();

    expect(mockSupabaseService.signUp).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('should show success message on successful registration', async () => {
    mockSupabaseService.signUp.and.returnValue(
      Promise.resolve({ data: { user: {} as any, session: null }, error: null })
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    await component.onSubmit();

    expect(component.success).toBe('Cuenta creada. Revisa tu correo para confirmar (si aplica).');
  });

  it('should navigate to login after successful registration', (done) => {
    mockSupabaseService.signUp.and.returnValue(
      Promise.resolve({ data: { user: {} as any, session: null }, error: null })
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    component.onSubmit().then(() => {
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 1300);
    });
  });

  it('should show error message on failed registration', async () => {
    mockSupabaseService.signUp.and.returnValue(
      Promise.resolve({ data: null, error: { message: 'User already exists' } } as any)
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    await component.onSubmit();

    expect(component.error).toBe('User already exists');
  });

  it('should set loading state during registration', async () => {
    mockSupabaseService.signUp.and.returnValue(
      new Promise((resolve) => setTimeout(() => resolve({ data: null, error: null } as any), 100))
    );

    component.form.setValue({ email: 'test@test.com', password: '123456' });
    const promise = component.onSubmit();

    expect(component.loading).toBe(true);
    await promise;
    expect(component.loading).toBe(false);
  });
});
