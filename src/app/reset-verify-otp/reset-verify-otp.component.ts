import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-verify-otp',
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-verify-otp.component.html',
  styleUrl: './reset-verify-otp.component.css',
})
export class ResetVerifyOtpComponent {
  otp: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  verifyOtp() {
    // this.authService.verifyResetOtp(this.otp).subscribe({
    //   next: () => this.router.navigate(['/set-new-password']),
    //   error: err => alert(err.error?.message || "Invalid OTP")
    // });
    // console.log(this.otp);

    const email = this.authService.getResetEmail();
    const payload = { email, otp: this.otp };

    // console.log(this.otp, email)

    this.authService.verifyResetOtp(email, this.otp).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message, 'OTP Verified');
        this.router.navigateByUrl('/set-new-password');
      },
      error: (err) => {
        console.error(err);
    
        if (err.status === 400 && err.error?.message) {
          this.toastr.error(err.error.message, 'Verification Failed');
        } else {
          this.toastr.error('Something went wrong. Please try again.', 'Error');
        }
      }
    });
  }
}
