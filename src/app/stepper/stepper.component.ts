import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import type { MatStepper } from '@angular/material/stepper';
import { type OnInit, ViewChild } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { FirstKeyPipe } from "../shared/pipes/first-key.pipe";

@Component({
  selector: 'app-stepper',
  imports: [
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatOptionModule,
    MatIcon,
    CommonModule,
    LoadingComponent,
    RouterLink,
    FirstKeyPipe
],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
})

// export class StepperComponent {
//   fb = inject(FormBuilder);
//   authService = inject(AuthService);
//   toastr = inject(ToastrService);
//   router = inject(Router);

//   otpSent = false;
//   otpVerified = false;

//   emailForm = this.fb.group({
//     email: ['', [Validators.required, Validators.email]],
//   });

//   otpForm = this.fb.group({
//     otp: ['', Validators.required],
//   });

//   hidePassword = true;
//   hideConfirmPassword = true;

//   passwordForm = this.fb.group({
//     password: ['', [Validators.required, Validators.minLength(6)]],
//     confirmPassword: ['', Validators.required]
//   }, { validators: this.passwordMatchValidator });

//   passwordMatchValidator(form: FormGroup) {
//     return form.get('password')!.value === form.get('confirmPassword')!.value
//       ? null : { mismatch: true };
//   }

//   sendOtp(stepper: any) {
//     const email = this.emailForm.value.email!;
//     console.log(email)
//     this.authService.sendResetOtp(email).subscribe({
//       next: () => {
//         this.otpSent = true;
//         this.toastr.success('OTP sent');
//         stepper.next(); // move to next step only on success
//       },
//       error: (err) => {
//         console.error(err);
//         this.otpSent = false;
//         if (err.error?.message) {
//           this.toastr.error(err.error.message, 'Reset Failed');
//         } else {
//           this.toastr.error('Unexpected error occurred.', 'Reset Failed');
//         }
//       }
//     });
//   }

//   verifyOtp(stepper: any) {
//     const email = this.emailForm.value.email!;
//     const otp = this.otpForm.value.otp!;
//     this.authService.verifyResetOtp(email, otp).subscribe({
//       next: (res: any) => {
//         this.toastr.success(res.message, 'OTP Verified');
//         stepper.next(); // move to next step only on success
//       },
//       error: (err) => {
//         console.error(err);

//         if (err.status === 400 && err.error?.message) {
//           this.toastr.error(err.error.message, 'Verification Failed');
//         } else {
//           this.toastr.error('Something went wrong. Please try again.', 'Error');
//         }
//       }
//     });
//   }

//   setPassword() {
//     const email = this.emailForm.value.email!;
//     const password = this.passwordForm.value.password!;
//     this.authService.setNewPassword(email, password).subscribe({
//       next: () => {
//         this.toastr.success('Password reset successful');
//         this.router.navigateByUrl('/signin');
//       },
//       error: () => this.toastr.error('Failed to reset password'),
//     });
//   }

// }
export class StepperComponent implements OnInit {
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;

  otpDigits: string[] = ['', '', '', '', '', ''];
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  otpSent = false;
  otpVerified = false;

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });

    this.passwordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            // Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/),
            Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  onOtpDigitInput(event: any, index: number): void {
    const input = event.target;

    // Add filled class when digit is entered
    if (input.value) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }

    // Auto-focus next input
    if (input.value && index < 5) {
      const inputs = document.getElementsByClassName('otp-digit');
      if (inputs[index + 1]) {
        (inputs[index + 1] as HTMLInputElement).focus();
      }
    }

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const inputs = document.getElementsByClassName('otp-digit');
      if (inputs[index - 1]) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    }

    // Update the hidden form control with the combined OTP value
    this.updateOtpFormControl();
  }

  updateOtpFormControl(): void {
    const otpValue = this.otpDigits.join('');
    this.otpForm.get('otp')?.setValue(otpValue);
    this.otpForm.markAsTouched();
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every((digit) => digit !== '');
  }

  // sendOtp(stepper: MatStepper): void {
  //   if (this.emailForm.invalid) {
  //     return;
  //   }

  //   this.isLoading = true;

  //   // Simulate API call
  //   setTimeout(() => {
  //     this.isLoading = false;
  //     stepper.next();

  //     // Focus the first OTP input after navigation
  //     setTimeout(() => {
  //       const inputs = document.getElementsByClassName('otp-digit');
  //       if (inputs[0]) {
  //         (inputs[0] as HTMLInputElement).focus();
  //       }
  //     }, 100);
  //   }, 1500);
  // }

  // verifyOtp(stepper: MatStepper): void {
  //   if (!this.isOtpComplete()) {
  //     this.otpForm.markAsTouched();
  //     return;
  //   }

  //   this.isLoading = true;

  //   // Simulate API call
  //   setTimeout(() => {
  //     this.isLoading = false;
  //     stepper.next();
  //   }, 1500);
  // }

  // setPassword(): void {
  //   if (this.passwordForm.invalid) {
  //     return;
  //   }

  //   this.isLoading = true;

  //   // Simulate API call
  //   setTimeout(() => {
  //     this.isLoading = false;
  //     // Handle successful password reset
  //     // Redirect to login page or show success message
  //   }, 1500);
  // }

  sendOtp(stepper: any) {
    const email = this.emailForm.value.email!;
    this.isLoading = true;
    console.log(email);
    console.log(this.isLoading);
    this.authService.sendResetOtp(email).subscribe({
      next: () => {
        this.otpSent = true;
        this.isLoading = false;

        this.toastr.success('OTP sent');
        stepper.next(); // move to next step only on success
      },
      error: (err) => {
        console.error(err);
        this.otpSent = false;
        this.isLoading = false;

        if (err.error?.message) {
          this.toastr.error(err.error.message, 'Reset Failed');
        } else {
          this.toastr.error('Unexpected error occurred.', 'Reset Failed');
        }
      },
    });
  }

  verifyOtp(stepper: any) {
    const email = this.emailForm.value.email!;
    const otp = this.otpForm.value.otp!;
    this.isLoading = true;
    this.authService.verifyResetOtp(email, otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastr.success(res.message, 'OTP Verified');
        stepper.next(); // move to next step only on success
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        if (err.status === 400 && err.error?.message) {
          this.toastr.error(err.error.message, 'Verification Failed');
        } else {
          this.toastr.error('Something went wrong. Please try again.', 'Error');
        }
      },
    });
  }

  setPassword() {
    const email = this.emailForm.value.email!;
    const password = this.passwordForm.value.password!;
    this.isLoading = true;
    this.authService.setNewPassword(email, password).subscribe({
      next: () => {
        this.toastr.success('Password reset successful');
        this.router.navigateByUrl('/signin');
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to reset password'),
        this.isLoading = false;
      }
    });
  }

  resending: boolean = false;
  resendOtp(event: Event) {
    event.preventDefault(); // prevent page reload

    const email = this.emailForm.value.email!;
    if (!email) {
      this.toastr.warning('Please enter a valid email first.');
      return;
    }

    // this.isLoading = true;
    this.resending = true;


    this.authService.sendResetOtp(email).subscribe({
      next: () => {
        this.toastr.success('OTP resent successfully');
        // this.isLoading = false;
        this.resending = false;

      },
      error: (err) => {
        // this.isLoading = false;
        this.resending = false;

        if (err.error?.message) {
          this.toastr.error(err.error.message, 'Resend Failed');
        } else {
          this.toastr.error('Unexpected error occurred.', 'Resend Failed');
        }
      },
    });
  }
}
