import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-google-login',
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.css'],
})
export class GoogleLoginComponent {
  private clientId = '257848338595-hs3vnsefa2mpgq2esjk6clpdq8pu062v.apps.googleusercontent.com';
  private redirectUri = 'http://localhost:4200'; // This should be your frontend URL

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

    baseURL = environment.apiBaseUrl;
  

  googleLogin() {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${this.clientId}
      &redirect_uri=${this.redirectUri}
      &response_type=code
      &scope=email profile openid`;

    const popup = window.open(authUrl, '_blank', 'width=500,height=600');

    const interval = setInterval(() => {
      try {
        if (popup?.location.href.includes(this.redirectUri)) {
          const urlParams = new URLSearchParams(popup.location.search);
          const authCode = urlParams.get('code');

          if (authCode) {
            popup.close();
            clearInterval(interval);
            this.exchangeCodeForToken(authCode);
          }
        }
      } catch (err) {
        // Catch cross-origin errors until redirect happens
      }
    }, 1000);
  }

  exchangeCodeForToken(code: string) {
    this.http.post(`${this.baseURL}/api/google-login`, { token: code }).subscribe({
      next: (res: any) => {
        localStorage.setItem('auth_token', res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.toastr.error('Google login failed.', 'Error');
      },
    });
  }
}
