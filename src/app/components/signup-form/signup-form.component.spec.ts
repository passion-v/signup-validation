import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupFormComponent } from './signup-form.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { of } from 'rxjs';
import { IThumbnailUtility } from 'src/app/models/thumbnail';

describe('SignupFormComponent', () => {
  let component: SignupFormComponent;
  let fixture: ComponentFixture<SignupFormComponent>;
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignupFormComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        MatCardModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the SignupFormComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.signupForm.valid).toBeFalsy();
  });

  it('should have valid form when all required fields are filled', () => {
    component.signupForm.controls['firstName'].setValue('John');
    component.signupForm.controls['lastName'].setValue('Doe');
    component.signupForm.controls['email'].setValue('john.doe@example.com');
    component.signupForm.controls['password'].setValue('Abcd1234');

    expect(component.signupForm.valid).toBeTruthy();
  });

  it('should generate correct fullName when both first name and last name are provided', () => {
    component.signupForm.controls['firstName'].setValue('John');
    component.signupForm.controls['lastName'].setValue('Doe');

    expect(component.fullName).toBe('John Doe');
  });

  it('should generate correct fullName when only first name is provided', () => {
    component.signupForm.controls['firstName'].setValue('John');
    component.signupForm.controls['lastName'].setValue('');

    expect(component.fullName).toBe('John');
  });

  it('should generate correct fullName when only last name is provided', () => {
    component.signupForm.controls['firstName'].setValue('');
    component.signupForm.controls['lastName'].setValue('Doe');

    expect(component.fullName).toBe('Doe');
  });

  it('should call addUser method of AuthService when the form is submitted', fakeAsync(() => {
    const mockThumbnail: IThumbnailUtility = {
      id: 1,
      albumId: 1,
      title: 'Mock Thumbnail',
      url: 'https://example.com/image.jpg',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    spyOn(authService, 'getThumbnailUrl').and.returnValue(of(mockThumbnail));
    spyOn(authService, 'addUser').and.returnValue(of({ success: true }));

    component.signupForm.controls['firstName'].setValue('John');
    component.signupForm.controls['lastName'].setValue('Doe');
    component.signupForm.controls['email'].setValue('john.doe@example.com');
    component.signupForm.controls['password'].setValue('Abcd1234');
    component.onSubmit();

    tick();

    expect(authService.getThumbnailUrl).toHaveBeenCalled();
    expect(authService.addUser).toHaveBeenCalled();
    expect(authService.addUser).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Abcd1234',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    });
  }));

  describe('passwordValidator', () => {
    it('should return null for a valid password', () => {
      const control = new FormControl('Abcd1234');
      const validation = component.passwordValidator(control);
      expect(validation).toBeNull();
    });

    it('should return invalidPassword error for password with less than 8 characters', () => {
      const control = new FormControl('Abcd12');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });

    it('should return invalidPassword error for password without uppercase letter', () => {
      const control = new FormControl('abcd1234');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });

    it('should return invalidPassword error for password that contains the first name', () => {
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      const control = new FormControl('Abcd1234John');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });

    it('should return invalidPassword error for password that contains the last name', () => {
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      const control = new FormControl('Abcd1234Doe');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });

    it('should return invalidPassword error for password that contains both first and last name', () => {
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      const control = new FormControl('Abcd1234JohnDoe');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });

    it('should return invalidPassword error for password that fails all criteria', () => {
      component.signupForm.patchValue({ firstName: 'John', lastName: 'Doe' });
      const control = new FormControl('abcd');
      const validation = component.passwordValidator(control);
      expect(validation).toEqual({ invalidPassword: true });
    });
  });
});
