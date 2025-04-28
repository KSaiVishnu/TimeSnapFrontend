import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HideIfClaimsNotMetDirective } from '../shared/directives/hide-if-claims-not-met.directive';
import { claimReq } from '../shared/utils/claimReq-utils';
import { UserService } from '../shared/services/user.service';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HideIfClaimsNotMetDirective,
    MatSnackBarModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // User data
  user = {
    name: '',
    email: '',
    empId: '',
    avatarUrl: '',
    memberSince: new Date(2022, 5, 15),
    timezone: 'America/New_York',
  };

  // User stats
  userStats = {
    totalHours: '256.5',
    daysActive: '124',
    projectsCompleted: '18',
  };

  // Login history
  loginHistory = [
    {
      device: 'Windows PC - Chrome',
      deviceIcon: 'computer',
      location: 'New York, USA',
      time: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      current: true,
    },
    {
      device: 'iPhone 13 - Safari',
      deviceIcon: 'smartphone',
      location: 'New York, USA',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      current: false,
    },
    {
      device: 'MacBook Pro - Firefox',
      deviceIcon: 'laptop_mac',
      location: 'Boston, USA',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      current: false,
    },
  ];

  // Timezones
  timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  // Forms
  nameForm!: FormGroup;
  passwordForm!: FormGroup;
  resetForm!: FormGroup;
  timezoneForm!: FormGroup;

  // UI state
  isEditingName = false;
  isEditingTimezone = false;
  hideCurrentPassword = true;
  hidePassword = true;
  hideConfirmPassword = true;
  hideNewPassword = true;
  isPasswordChanging = false;
  isResetting = false;
  isDeleting = false;
  isUploading = false;
  uploadProgress = 0;
  showDeleteModal = false;
  deleteConfirmation = '';
  twoFactorEnabled = false;
  showTwoFactorModal = false;
  twoFactorQrCode = 'https://via.placeholder.com/200?text=QR+Code';
  twoFactorCode = '';
  isVerifying = false;

  // Role
  claimReq = claimReq;

  // Msgs
  successMsg: any;
  errorMsg: any;

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.getUserProfile();
  }

  getUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (res: any) => {
        console.log(res);
        this.user.name = res.fullName;
        this.user.email = res.email;
        this.user.avatarUrl = res.avatarUrl;
        this.userService.setUserDetails(res);
      },
      error: (err: any) =>
        console.log('error while retrieving user profile:\n', err),
    });

    let userDetails = this.userService.getUserDetails();
    console.log(userDetails());
    if (!userDetails()) {
      this.userService.getUserProfile().subscribe({
        next: (res: any) => {
          this.user.name = res.fullName;
          this.user.email = res.email;
          this.user.empId = res.empId;
        },
        error: (err: any) =>
          console.log('error while retrieving user profile:\n', err),
      });
    } else {
      this.user.name = userDetails().fullName;
      this.user.email = userDetails().email;
      this.user.empId = userDetails().empId;
    }
  }

  initForms(): void {
    // Name form
    this.nameForm = this.fb.group({
      name: [this.user.name, [Validators.required, Validators.minLength(2)]],
    });

    // Password form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    // Admin reset form
    this.resetForm = this.fb.group({
      employeeEmail: ['', [Validators.required, Validators.email]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          ),
        ],
      ],
    });

    // Timezone form
    this.timezoneForm = this.fb.group({
      timezone: [this.user.timezone, Validators.required],
    });
  }

  // Helper to get first error key
  getFirstError(control: AbstractControl | null): string | null {
    if (!control || !control.errors) return null;
    return Object.keys(control.errors)[0];
  }

  // Password match validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  // Name editing
  startNameEdit(): void {
    this.isEditingName = true;
    this.nameForm.patchValue({ name: this.user.name });
  }

  cancelNameEdit(): void {
    this.isEditingName = false;
    this.nameForm.reset({ name: this.user.name });
  }

  updateName(): void {
    if (this.nameForm.invalid) return;
    const newName = this.nameForm.value.name;
    console.log('Updating name to:', newName);

    this.userService.updateFullName(newName).subscribe({
      next: (res) => {
        console.log(res);
        this.user.name = newName;
        this.isEditingName = false;
        this.snackBar.open('Name updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
      },
      error: (err) => {
        this.isEditingName = false;
        this.snackBar.open(err.error || 'Failed to update name', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  // Timezone editing
  startTimezoneEdit(): void {
    this.isEditingTimezone = true;
    this.timezoneForm.patchValue({ timezone: this.user.timezone });
  }

  cancelTimezoneEdit(): void {
    this.isEditingTimezone = false;
    this.timezoneForm.reset({ timezone: this.user.timezone });
  }

  updateTimezone(): void {
    if (this.timezoneForm.invalid) return;

    const newTimezone = this.timezoneForm.value.timezone;
    // Call API to update timezone
    console.log('Updating timezone to:', newTimezone);

    // Simulate API call
    setTimeout(() => {
      this.user.timezone = newTimezone;
      this.isEditingTimezone = false;
      // Show success notification
    }, 800);
  }

  // Password change
  // changePassword(): void {
  //   if (this.passwordForm.invalid) return;

  //   this.isPasswordChanging = true;
  //   const { currentPassword, password } = this.passwordForm.value;

  //   // Call API to change password
  //   console.log('Changing password');

  //   // Simulate API call
  //   setTimeout(() => {
  //     this.isPasswordChanging = false;
  //     this.passwordForm.reset();
  //     this.hideCurrentPassword = true;
  //     this.hidePassword = true;
  //     this.hideConfirmPassword = true;
  //     // Show success notification
  //   }, 1500);
  // }

  currentPasswordValid: boolean = false;
  currentPasswordInvalid: boolean = false;
  // isPasswordChanging: boolean = false;

  validateCurrentPassword(): void {
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    if (!currentPassword) return;

    this.userService.validateCurrentPassword(currentPassword).subscribe({
      next: (isValid: boolean) => {
        this.currentPasswordValid = isValid;
        this.currentPasswordInvalid = !isValid;

        if (!isValid) {
          // Clear new password fields if wrong
          this.passwordForm.get('password')?.reset();
          this.passwordForm.get('confirmPassword')?.reset();
        }
      },
      error: () => {
        this.currentPasswordValid = false;
        this.currentPasswordInvalid = true;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || !this.currentPasswordValid) return;

    this.isPasswordChanging = true;
    const { currentPassword, password } = this.passwordForm.value;

    // Call the service to change the password
    this.userService.changePassword(currentPassword, password).subscribe({
      next: () => {
        this.isPasswordChanging = false;
        this.passwordForm.reset();
        this.hideCurrentPassword = true;
        this.hidePassword = true;
        this.hideConfirmPassword = true;
        this.currentPasswordValid = false; // Reset after successful password change
        // Optionally, show success message
        this.snackBar.open('Password updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
      },
      error: (err) => {
        this.isPasswordChanging = false;
        // Optionally, show error message based on err
        this.snackBar.open(
          err.error.message || 'Failed to update password',
          'Close',
          {
            duration: 3000,
            panelClass: ['snackbar-error'],
          }
        );
        console.error('Error changing password:', err);
      },
    });
  }

  // Admin password reset
  resetPassword(): void {
    if (this.resetForm.invalid) return;

    this.isResetting = true;
    const { employeeEmail, newPassword } = this.resetForm.value;

    this.userService.resetEmployeePassword(employeeEmail, newPassword).subscribe({
      next: () => {
        this.isResetting = false;
        this.resetForm.reset();
        this.hideNewPassword = true;
        alert('Password reset successfully!');
      },
      error: (error) => {
        this.isResetting = false;
        console.error(error);
        alert('Failed to reset password.');
      }
    });
  }

  // Avatar upload
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) return;

  //   const file = input.files[0];
  //   if (!file.type.startsWith('image/')) {
  //     alert('Please select an image file');
  //     return;
  //   }

  //   this.uploadAvatar(file);
  // }

  // // uploadAvatar(file: File): void {
  // //   this.isUploading = true;
  // //   this.uploadProgress = 0;

  // //   // Simulate upload progress
  // //   const interval = setInterval(() => {
  // //     this.uploadProgress += 10;
  // //     if (this.uploadProgress >= 100) {
  // //       clearInterval(interval);

  // //       // Create a temporary URL for the uploaded file
  // //       const reader = new FileReader();
  // //       reader.onload = (e) => {
  // //         if (e.target?.result) {
  // //           this.user.avatarUrl = e.target.result as string;
  // //         }
  // //         this.isUploading = false;
  // //         // Show success notification
  // //       };
  // //       reader.readAsDataURL(file);
  // //     }
  // //   }, 200);
  // // }

  // uploadAvatar(file: File): void {
  //   this.isUploading = true;
  //   this.uploadProgress = 0;

  //   this.userService.uploadAvatar(file).subscribe({
  //     next: (avatarUrl) => {
  //       this.user.avatarUrl = avatarUrl;
  //       this.snackBar.open('Avatar updated!', 'Close', { duration: 3000 });
  //       this.isUploading = false;
  //     },
  //     error: (err) => {
  //       this.snackBar.open('Failed to upload avatar', 'Close', { duration: 3000 });
  //       this.isUploading = false;
  //     }
  //   });
  // }

  // Account deletion

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const base64Image = e.target.result as string;
        this.uploadAvatar(base64Image);
      }
    };
    reader.readAsDataURL(file); // This will convert file to Base64 URL
  }

  // uploadAvatar(base64Image: string): void {
  //   this.isUploading = true;
  //   this.uploadProgress = 0;

  //   this.userService.uploadAvatar(base64Image).subscribe({
  //     next: (avatarUrl) => {
  //       this.user.avatarUrl = avatarUrl;
  //       // this.user.avatarUrl = `https://localhost:7245${avatarUrl}`;
  //       console.log(avatarUrl);
  //       this.snackBar.open('Avatar updated!', 'Close', { duration: 3000 });
  //       this.isUploading = false;
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       this.snackBar.open('Failed to upload avatar', 'Close', { duration: 3000 });
  //       this.isUploading = false;
  //     }
  //   });
  // }

  uploadAvatar(base64Image: string): void {
    this.isUploading = true;
    this.uploadProgress = 0;

    const fakeProgressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10; // slowly increase to 90%
      }
    }, 200);

    this.userService.uploadAvatar(base64Image).subscribe({
      next: (avatarUrl) => {
        this.user.avatarUrl = avatarUrl;
        clearInterval(fakeProgressInterval);
        this.uploadProgress = 100;

        setTimeout(() => {
          this.isUploading = false; // Hide progress after short delay
          this.uploadProgress = 0;
        }, 500); // wait half second to show 100% before hiding
      },
      error: (err) => {
        clearInterval(fakeProgressInterval);
        this.snackBar.open('Failed to upload avatar', 'Close', {
          duration: 3000,
        });
        this.isUploading = false;
        this.uploadProgress = 0;
      },
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
    this.deleteConfirmation = '';
  }

  // deleteAccount(): void {
  //   if (this.deleteConfirmation !== 'DELETE') return;

  //   this.isDeleting = true;

  //   // Call API to delete account
  //   console.log('Deleting account...');

  //   // Simulate API call
  //   setTimeout(() => {
  //     this.isDeleting = false;
  //     this.showDeleteModal = false;
  //     // Redirect to logout or home page
  //   }, 2000);
  // }

  deleteAccount(): void {
    if (this.deleteConfirmation !== 'DELETE') return;

    this.isDeleting = true;

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        // Redirect to logout or home page
        console.log('Account deleted successfully.');
        // For example, navigate to login
        this.authService.deleteToken();
        this.router.navigate(['/signin']);
        this.toastr.success('Account Deleted Successfully', 'Account Deleted');
      },
      error: (err) => {
        this.isDeleting = false;
        this.toastr.error('Error While Deleting Account', 'Deletion Error');
        console.error('Error deleting account:', err);
      },
    });
  }

  // Two-factor authentication
  toggleTwoFactor(): void {
    if (this.twoFactorEnabled) {
      // Disable two-factor
      this.disableTwoFactor();
    } else {
      // Enable two-factor
      this.showTwoFactorModal = true;
      this.twoFactorCode = '';
    }
  }

  disableTwoFactor(): void {
    // Call API to disable two-factor
    console.log('Disabling two-factor authentication');

    // Simulate API call
    setTimeout(() => {
      this.twoFactorEnabled = false;
      // Show success notification
    }, 1000);
  }

  verifyTwoFactorCode(): void {
    if (!this.twoFactorCode || this.twoFactorCode.length !== 6) return;

    this.isVerifying = true;

    // Call API to verify code
    console.log('Verifying two-factor code:', this.twoFactorCode);

    // Simulate API call
    setTimeout(() => {
      this.isVerifying = false;
      this.showTwoFactorModal = false;
      this.twoFactorEnabled = true;
      // Show success notification
    }, 1500);
  }

  // Login history
  viewAllLoginHistory(): void {
    // Navigate to full login history page or open modal with complete history
    console.log('Viewing all login history');
  }

  // Admin reports
  generateTimeReports(): void {
    // Generate time reports for employees
    console.log('Generating time reports');
  }

  exportTimeData(): void {
    // Export time tracking data
    console.log('Exporting time data');
  }
}
