import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verification',
  imports: [FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css',
})
export class VerificationComponent {
  constructor(private authService: AuthService, private router: Router,
    private toastr: ToastrService,) {}
  // inputValue: string = "";
  otpValue: string = '';

  onVerifyOtp() {
    this.authService
      .verifyOtp(this.authService.getEmail(), this.otpValue)
      .subscribe({
        next: (res: any) => {
          // this.router.navigateByUrl("/signin");
          this.authService.createUser(this.authService.getForm()).subscribe({
            next: (res: any) => {
              if (res.succeeded) {
                this.toastr.success(
                  'New user created!',
                  'Registration Successful'
                );
                this.router.navigateByUrl("/signin");
              }
            },
            error: (err) => {
              if (err.error.errors)
                err.error.errors.forEach((x: any) => {
                  switch (x.code) {
                    case 'DuplicateUserName':
                      break;
                    case 'DuplicateEmail':
                      this.toastr.error(
                        'Email is already taken.',
                        'Registration Failed'
                      );
                      break;
                    case 'InvalidEmailDomain':
                      this.toastr.error(
                        'Only email addresses ending with .ac.in are allowed.',
                        'Registration Failed'
                      );
                      break;
                    default:
                      this.toastr.error(
                        'Contact the developer',
                        'Registration Failed'
                      );
                      console.log(x);
                      break;
                  }
                });
              else console.log('error:', err);
            },
          });

          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
