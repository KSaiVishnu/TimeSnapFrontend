import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';

import { signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-registration',
  standalone: true,
  // providers:[AuthService],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FirstKeyPipe,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent implements OnInit {
  form: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private service: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = this.formBuilder.group(
      {
        fullName: ['', Validators.required],
        email: [
          '',
          [Validators.required, Validators.email, this.emailDomainValidator],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/(?=.*[^a-zA-Z0-9 ])/),
          ],
        ],
        confirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.service.getToken()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  isSubmitted: boolean = false;

  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    return email && (email.endsWith('@framsikt.no'))
      ? null
      : { invalidDomain: true };
  }
  

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value != confirmPassword.value)
      confirmPassword?.setErrors({ passwordMismatch: true });
    else confirmPassword?.setErrors(null);

    return null;
  };

  // email:string = "";

  onSubmit() {
    this.isSubmitted = true;
    console.log(this.form);
    if (this.form.valid) {
      let FormValue = this.form.value;
      this.service.setForm(FormValue);
      // this.router.navigateByUrl('/verify');
      // this.service.sendOtp(FormValue.email).subscribe({
      //   next: (res: any) => {
      //     console.log(res);
      //   },
      //   error: (err) => {
      //     console.log(err);
      //   },
      // });

      this.service.preRegister(this.form.value.email).subscribe({
        next: () => {
          this.router.navigate(['/verify']);
        },
        // error: (err) => {
        //   if (err.status === 400) {
        //     alert(err.error);
        //   } else if (err.status === 500) {
        //     alert("Server error. Please try again later.");
        //   } else {
        //     alert("Unexpected error occurred.");
        //   }
        // }
        error: (err) => {
          if (err.status === 400) {
            const errorCode = err.error?.code;

            switch (errorCode) {
              case "UnauthorizedEmail":
                this.toastr.error('Your email is not authorized to register.', 'Registration Failed');
                break;
              case "UserAlreadyRegistered":
                this.toastr.error('Email is already taken.', 'Registration Failed');
                break;
              case "InvalidEmailDomain":
                this.toastr.error('Email should end with @framsikt.no', 'Registration Failed');
                break;
              default:
                alert(err.error?.message || "Something went wrong.");
            }
          } else if (err.status === 500) {
            // alert("Server error. Please try again later.");
            this.toastr.error('Server error. Please try again later.', 'Registration Failed');
            
          } else {
            // alert("Unexpected error occurred.");
            this.toastr.error('Unexpected error occurred.', 'Registration Failed');
          }
          this.isSubmitted = false;
        }
        
      });

      // this.service.createUser(this.form.value)
      //   .subscribe({
      //     next: (res: any) => {
      //       if (res.succeeded) {
      //         this.form.reset();
      //         this.isSubmitted = false;
      //         this.toastr.success('New user created!', 'Registration Successful');
      //         // this.service.sendOtp(this.form.value.email);
      //         // this.router.navigateByUrl("/verify");
      //       }
      //     },
      //     error: err => {
      //       if (err.error.errors)
      //         err.error.errors.forEach((x: any) => {
      //           switch (x.code) {
      //             case "DuplicateUserName":
      //               break;
      //             case "DuplicateEmail":
      //               this.toastr.error('Email is already taken.', 'Registration Failed')
      //               break;
      //             case "InvalidEmailDomain":
      //               this.toastr.error('Only email addresses ending with .ac.in are allowed.', 'Registration Failed')
      //               break
      //             default:
      //               this.toastr.error('Contact the developer', 'Registration Failed')
      //               console.log(x);
      //               break;
      //           }
      //         })
      //       else
      //         console.log('error:',err);
      //     }
      //   });
    }
  }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  hasDisplayableError(controlName: string): Boolean {
    const control = this.form.get(controlName);
    return (
      Boolean(control?.invalid) &&
      // (this.isSubmitted || Boolean(control?.touched) || Boolean(control?.dirty))
      (this.isSubmitted || Boolean(control?.touched))
    );
  }
}
