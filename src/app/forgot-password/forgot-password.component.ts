import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  sendOtp() {
    this.authService.sendResetOtp(this.email).subscribe({
      next: () => {
        this.authService.setResetEmail(this.email);
        this.router.navigateByUrl('/reset-verify-otp');
      },
      error: (err) => {
        console.error(err);
        if (err.error?.message) {
          this.toastr.error(err.error.message, 'Reset Failed');
        } else {
          this.toastr.error('Unexpected error occurred.', 'Reset Failed');
        }
      }
    });
    
  }
}
