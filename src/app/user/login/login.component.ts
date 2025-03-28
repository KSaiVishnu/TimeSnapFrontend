declare var google: any;

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TOKEN_KEY } from '../../shared/constants';
import { error } from 'node:console';
import { GoogleLoginComponent } from "../google-login/google-login.component";

import {ChangeDetectionStrategy, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';


import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { FormsModule} from '@angular/forms';
import {merge} from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleLoginComponent, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  errorMessage = signal('');

  constructor(
    public formBuilder: FormBuilder,
    private service: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    
    merge(
      this.form.controls['email'].statusChanges,
      this.form.controls['email'].valueChanges
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateErrorMessage());
    
  }

  updateErrorMessage() {
    const emailControl = this.form.controls['email'];
  
    if (emailControl.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (emailControl.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }
  

  ngOnInit(): void {
    if (this.service.getToken()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  

  // ngAfterViewInit(): void {
  //   if (typeof google !== 'undefined') {
  //     google.accounts.id.initialize({
  //       client_id:
  //         '257848338595-hs3vnsefa2mpgq2esjk6clpdq8pu062v.apps.googleusercontent.com',
  //       callback: (res: any) => {
  //         // console.log('Google Login Response:', res);
  //         this.handleGoogleLogin(res);
  //       },
  //     });

  //     google.accounts.id.renderButton(
  //       document.getElementById('google-button'),
  //       {
  //         theme: 'filled_blue',
  //         size: 'large',
  //         shape: 'rectangle',
  //         width: 300,
  //       }
  //     );
  //   } else {
  //     console.error('Google API not loaded.');
  //   }
  // }


  ngAfterViewInit(): void {
    this.loadGoogleAPI();
  }

  loadGoogleAPI() {
    if (typeof google === 'undefined' || !google.accounts) {
      console.error('Google API not loaded. Adding script manually...');
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initializeGoogleLogin();
      document.head.appendChild(script);
    } else {
      this.initializeGoogleLogin();
    }
  }

  initializeGoogleLogin() {
    google.accounts.id.initialize({
      client_id:
        '257848338595-hs3vnsefa2mpgq2esjk6clpdq8pu062v.apps.googleusercontent.com',
      callback: (res: any) => this.handleGoogleLogin(res),
      ux_mode: "popup"  // Open login in a popup window
    });

    // Render button if element exists
    const button = document.getElementById('google-button');
    if (button) {
      google.accounts.id.renderButton(button, {
        width: 300,
      });
    }

    // Make callback globally available
    (window as any).handleGoogleLogin = this.handleGoogleLogin.bind(this);
  }

  userDetails: any;
  google_login: boolean = false;

  // handleGoogleLogin(response: any) {
  //   if (response) {
  //     // this.service.saveToken(response.credential)
  //     var token = response.credential;
  //     var claims = JSON.parse(window.atob(token.split('.')[1]));
  //     this.userDetails = {
  //       fullName: claims.name,
  //       email: claims.email,
  //       password: claims.email + claims.name + '123',
  //       confirmPassword: claims.email + claims.name + '123',
  //     };
  //     this.google_login = true;
  //     // this.router.navigateByUrl('/dashboard');

  //     // this.service.googleSignin(this.userDetails)
  //     //   .subscribe({
  //     //     next: (res: any) => {
  //     //       if (res.succeeded) {
  //     //         this.service.saveToken(response.credential);
  //     //         this.router.navigateByUrl('/dashboard');
  //     //       }
  //     //     },
  //     //     error: err => {
  //     //       console.log('error during login:\n', err);
  //     //     }
  //     //   });
  //     this.service.findUserByEmail(this.userDetails.email).subscribe({
  //       next: (res: any) => {
  //         console.log(res);
  //         var google_details = {
  //           email: this.userDetails.email,
  //           password: this.userDetails.password,
  //         };
  //         this.service.signin(google_details).subscribe({
  //           next: (res: any) => {
  //             this.service.saveToken(res.token);
  //             this.service.googleLogin(this.google_login);
  //             this.router.navigateByUrl('/dashboard');
  //           },
  //           error: (err) => {
  //             if (err.status == 400)
  //               this.toastr.error(
  //                 'Incorrect email or password.',
  //                 'Login failed'
  //               );
  //             else console.log('error during login:\n', err);
  //           },
  //         });
  //       },
  //       error: (err: any) => {
  //         this.service.createUser(this.userDetails).subscribe({
  //           next: (res: any) => {
  //             var google_details = {
  //               email: this.userDetails.email,
  //               password: this.userDetails.password,
  //             };
  //             this.service.signin(google_details).subscribe({
  //               next: (res: any) => {
  //                 this.service.saveToken(res.token);
  //                 this.service.googleLogin(this.google_login);
  //                 this.router.navigateByUrl('/dashboard');
  //               },
  //               error: (err) => {
  //                 console.log('error during login:\n', err);
  //               },
  //             });
  //           },
  //           error: (err) => {
  //             if (err.error.errors)
  //               err.error.errors.forEach((x: any) => {
  //                 switch (x.code) {
  //                   case 'InvalidEmailDomain':
  //                     this.toastr.error(
  //                       'Only email addresses ending with .ac.in are allowed.',
  //                       'Login Failed'
  //                     );
  //                     break;
  //                   default:
  //                     this.toastr.error(
  //                       'Contact the developer',
  //                       'Registration Failed'
  //                     );
  //                     console.log(x);
  //                     break;
  //                 }
  //               });
  //           },
  //         });
  //         console.log(err);
  //       },
  //     });
  //   }
  // }


  // handleGoogleLogin(response: any) {
  //   if (!response || !response.credential) {
  //     this.toastr.error('Invalid Google response.', 'Login Failed');
  //     return;
  //   }
  //   console.log(response);
  
  //   this.service.googleLogin({ token: response.credential }).subscribe({
  //     next: (res: any) => {
  //       this.service.saveToken(res.token);
  //       this.router.navigateByUrl('/dashboard');
  //     },
  //     error: (err: any) => {
  //       console.log('Login error:', err);
  //       this.toastr.error('Google login failed.', 'Error');
  //     },
  //   });
  // }
  


  handleGoogleLogin(response: any) {
    if (!response || !response.credential) {
      this.toastr.error('Invalid Google response. Please try again.', 'Login Failed');
      return;
    }
  
    console.log(response);
  
    this.service.googleLogin({ token: response.credential }).subscribe({
      next: (res: any) => {
        this.service.saveToken(res.token);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: any) => {
        console.log('Login error:', err);
  
        // Handle specific errors
        if (err.status === 400) {
          if (err.error.includes('Invalid Google token')) {
            this.toastr.error('Invalid Google token. Please try again.', 'Login Failed');
          } else if (err.error.includes('Employee not found')) {
            this.toastr.error('Your email is not registered as an employee.', 'Access Denied');
          } else if (err.error.includes('User registration failed')) {
            this.toastr.error('User creation failed. Contact support.', 'Registration Error');
          } else {
            this.toastr.error(err.error, 'Login Failed');
          }
        } else if (err.status === 500) {
          this.toastr.error('Server error. Please try again later.', 'Login Failed');
        } else {
          this.toastr.error('An unexpected error occurred.', 'Login Failed');
        }
      },
    });
  }
  







  isSubmitted: boolean = false;

  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return (
      Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
    );
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.valid) {
      this.service.signin(this.form.value).subscribe({
        next: (res: any) => {
          this.service.saveToken(res.token);
          // this.service.googleLogin(this.google_login);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          if (err.status == 400)
            this.toastr.error('Incorrect email or password.', 'Login failed');
          else console.log('error during login:\n', err);
        },
      });
    }
  }
}
