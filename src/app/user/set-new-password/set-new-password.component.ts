import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-set-new-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './set-new-password.component.html',
  styleUrl: './set-new-password.component.css'
})
export class SetNewPasswordComponent {
  password: string = '';
  confirmPassword: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  resetPassword() {
    if (this.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const email = this.authService.getResetEmail();


    this.authService.setNewPassword(email, this.password).subscribe({
      next: () => {
        alert("Password reset successfully");
        this.router.navigate(['/signin']);
      },
      error: err => alert(err.error?.message || "Error resetting password")
    });
  }
}
