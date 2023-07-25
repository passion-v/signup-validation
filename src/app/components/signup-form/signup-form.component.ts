import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IPassValidationUtility } from 'src/app/models/passValidations';
import { IUserUtility } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent implements OnInit, OnDestroy {
  userThumbnailUrl = '';
  subscriptions: Subscription[] = [];
  signupForm: FormGroup;
  passwordValidation: IPassValidationUtility | undefined;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signupForm = this.createSignupForm();
  }

  ngOnInit(): void {
    const firstNameControl = this.signupForm.get('firstName');
    if (firstNameControl) {
      const firstNameSubscription = firstNameControl.valueChanges.subscribe(() => {
        this.signupForm.get('password')?.updateValueAndValidity();
      });
      this.subscriptions.push(firstNameSubscription);
    }

    const lastNameControl = this.signupForm.get('lastName');
    if (lastNameControl) {
      const lastNameSubscription = lastNameControl.valueChanges.subscribe(() => {
        this.signupForm.get('password')?.updateValueAndValidity();
      });
      this.subscriptions.push(lastNameSubscription);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const values = this.signupForm.value;
      this.authService
        .getThumbnailUrl(values.lastName.length)
        .pipe(
          switchMap((thumbnail) => {
            const user: IUserUtility = {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              password: values.password,
              thumbnailUrl: thumbnail.thumbnailUrl,
            };
            this.userThumbnailUrl = thumbnail.thumbnailUrl;
            return this.authService.addUser(user);
          })
        )
        .subscribe((user) => {
          console.log(user);
        });
    }
  }

  private createSignupForm(): FormGroup {
    return this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, this.passwordValidator.bind(this)]],
    });
  }

  public passwordValidator(control: FormControl): { [key: string]: boolean } | null {
    const password = control.value;
    const firstName = this.signupForm?.get('firstName')?.value;
    const lastName = this.signupForm?.get('lastName')?.value;

    this.passwordValidation = {
      hasMinimumLength: password?.length > 8,
      hasUpperCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      containsName:
        (firstName && password?.toLowerCase().includes(firstName?.toLowerCase())) ||
        (lastName && password?.toLowerCase().includes(lastName?.toLowerCase())),
    };

    if (
      password &&
      (password.length < 8 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        (firstName &&
          password?.toLowerCase().includes(firstName?.toLowerCase())) ||
        (lastName && password?.toLowerCase().includes(lastName?.toLowerCase())))
    ) {
      return { invalidPassword: true };
    }

    return null;
  }

  get fullName(): string {
    const firstName = this.signupForm.get('firstName')?.value || '';
    const lastName = this.signupForm.get('lastName')?.value || '';

    if (firstName.trim() === '' && lastName.trim() === '') {
      return '';
    } else if (firstName.trim() === '') {
      return lastName;
    } else if (lastName.trim() === '') {
      return firstName;
    } else {
      return `${firstName} ${lastName}`;
    }
  }

  handleThumbnailError() {
    this.userThumbnailUrl = ''; // Reset userThumbnailUrl on error to avoid broken images
  }
}
